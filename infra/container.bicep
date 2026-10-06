// infra/container.bicep
// The visitor-counter API as a container on Azure Container Apps, added to an EXISTING environment
// (the one main.bicep built: same Cosmos database, same analytics tables, same website).
//
// Two phases, because a container app needs its image to exist before it can be created:
//   phase 1: deployApp=false  -> registry, identity, permissions, environment   (no app yet)
//   build + push the image to the registry
//   phase 2: deployApp=true   -> the container app itself, running that image

targetScope = 'resourceGroup'

@description('Environment name. Must match the environment main.bicep built (test, pr12, ...).')
param envName string

@description('Short suffix used in resource names (your initials). Must match main.bicep.')
param suffix string = 'ad'

@description('Azure region. Container Apps is not offered in every region on a free trial.')
param location string = resourceGroup().location

@description('Secret used to fingerprint visitor IPs. Use the same value as the Functions version of this environment.')
@secure()
param hashSalt string

@description('Object (principal) ID of the pipeline identity (id-github-crc-test). It gets AcrPush so the workflow can push images.')
param pipelinePrincipalId string

@description('Phase 1 = false (no app yet). Phase 2 = true.')
param deployApp bool = false

@description('Full image reference, e.g. acrcrcadtest01.azurecr.io/crc-api:abc123. Required when deployApp is true.')
param image string = ''

// ---------- Built-in role IDs (the same in every tenant) ----------
var acrPullRoleId = '7f951dda-4ed3-4680-a7ca-43fe172d538d'
var acrPushRoleId = '8311e382-0749-4cb8-b61a-304f252e45ec'
var storageTableDataContributorRoleId = '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3'
var cosmosDataContributorRoleId = '00000000-0000-0000-0000-000000000002' // Cosmos data-plane role

// ---------- Things main.bicep already built (referenced, never changed) ----------
resource swa 'Microsoft.Web/staticSites@2023-12-01' existing = {
  name: 'swa-crc-${suffix}-${envName}'
}

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' existing = {
  name: 'cosmos-crc-${suffix}-${envName}'
}

resource dataStorage 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: 'stdata${suffix}${envName}01'
}

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' existing = {
  name: 'log-crc-${suffix}-${envName}'
}

// ---------- Registry: where the image is stored ----------
// Basic is the cheapest tier (about $5 a month). No admin user: access is by role only.
resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: 'acrcrc${suffix}${envName}01' // letters and numbers only, globally unique
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
  }
}

// ---------- The container's identity ----------
// USER-assigned (we create it, it has its own lifetime), unlike the Function App's system-assigned one.
// Why here: it must hold AcrPull BEFORE the app first starts, otherwise the first image pull fails.
resource appIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-ca-crc-${suffix}-${envName}'
  location: location
}

// Identity -> registry (pull the image)
resource pullAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: acr
  name: guid(acr.id, appIdentity.id, acrPullRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPullRoleId)
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Pipeline -> registry (push the image)
resource pushAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: acr
  name: guid(acr.id, pipelinePrincipalId, acrPushRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', acrPushRoleId)
    principalId: pipelinePrincipalId
    principalType: 'ServicePrincipal'
  }
}

// Identity -> analytics tables (Azure RBAC)
resource tableAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: dataStorage
  name: guid(dataStorage.id, appIdentity.id, storageTableDataContributorRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageTableDataContributorRoleId)
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Identity -> Cosmos data (Cosmos's own role system, separate from Azure RBAC)
resource cosmosAccess 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2024-05-15' = {
  parent: cosmos
  name: guid(cosmos.id, appIdentity.id, cosmosDataContributorRoleId)
  properties: {
    roleDefinitionId: '${cosmos.id}/sqlRoleDefinitions/${cosmosDataContributorRoleId}'
    principalId: appIdentity.properties.principalId
    scope: cosmos.id
  }
}

// ---------- The Container Apps environment ----------
// The shared "neighbourhood" for container apps: networking, logging, scaling machinery.
// Consumption workload profile = pay only for what runs (and there is a monthly free grant).
resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'cae-crc-${suffix}-${envName}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logs.properties.customerId
        sharedKey: logs.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  }
}

// ---------- The container app (phase 2 only) ----------
resource app 'Microsoft.App/containerApps@2024-03-01' = if (deployApp) {
  name: 'ca-crc-${suffix}-${envName}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${appIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerEnv.id
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Single' // one live version at a time; the portal can switch to Multiple to split traffic
      ingress: {
        external: true
        targetPort: 8080
        transport: 'auto'
        allowInsecure: false // HTTP is redirected to HTTPS
      }
      registries: [
        {
          server: acr.properties.loginServer
          identity: appIdentity.id // pull with the identity: no registry password anywhere
        }
      ]
      secrets: [
        {
          name: 'hash-salt'
          value: hashSalt
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: image
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '8080'
            }
            {
              // Tells DefaultAzureCredential WHICH identity to use (the container has only one, but be explicit).
              name: 'AZURE_CLIENT_ID'
              value: appIdentity.properties.clientId
            }
            {
              name: 'CosmosDbConnection__accountEndpoint'
              value: cosmos.properties.documentEndpoint
            }
            {
              name: 'TABLES_ACCOUNT_URL'
              value: 'https://${dataStorage.name}.table.${environment().suffixes.storage}'
            }
            {
              name: 'ALLOWED_ORIGINS'
              value: 'https://${swa.properties.defaultHostname}'
            }
            {
              name: 'VISITOR_HASH_SALT'
              secretRef: 'hash-salt'
            }
          ]
          probes: [
            {
              // Liveness: "is the process stuck?" If this fails, the replica is restarted.
              type: 'Liveness'
              httpGet: {
                path: '/healthz'
                port: 8080
              }
              initialDelaySeconds: 5
              periodSeconds: 30
            }
            {
              // Readiness: "can it take traffic yet?" No traffic is sent until this passes.
              type: 'Readiness'
              httpGet: {
                path: '/healthz'
                port: 8080
              }
              initialDelaySeconds: 3
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0 // scale to zero: nobody visiting = nothing running = nothing billed
        maxReplicas: 2 // same cap as the Functions version (Wall of Fire lite)
        rules: [
          {
            name: 'http-load'
            http: {
              metadata: {
                concurrentRequests: '20' // add a replica when one has about 20 requests in flight
              }
            }
          }
        ]
      }
    }
  }
  dependsOn: [
    pullAccess
    tableAccess
    cosmosAccess
  ]
}

output acrName string = acr.name
output acrLoginServer string = acr.properties.loginServer
output appName string = 'ca-crc-${suffix}-${envName}'
output appUrl string = deployApp ? 'https://${app!.properties.configuration.ingress.fqdn}' : ''
