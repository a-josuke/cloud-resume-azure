// infra/main.bicep
// The whole Cloud Resume app as code: frontend, API, database, monitoring.
// One template, many environments: the envName parameter goes into every resource name.

targetScope = 'resourceGroup'

@description('Environment name (test, pr12, ...). Goes into every resource name so environments never collide.')
@minLength(2)
@maxLength(8)
param envName string

@description('Short suffix used in resource names (your initials).')
param suffix string = 'ad'

@description('Azure region for the API, database and monitoring.')
param location string = resourceGroup().location

@description('Azure region for the Static Web App (only a few regions exist: westus2, centralus, eastus2, westeurope, eastasia).')
param swaLocation string = 'eastasia'

@description('Extra websites allowed to call the API from a browser, e.g. your custom domain for prod. The environment\'s own site is added automatically.')
param extraAllowedOrigins array = []

@description('Email address that receives alerts.')
param alertEmail string

@description('Create the alert rules? (Handy to switch off for throwaway environments.)')
param deployAlerts bool = true

@description('Secret used to fingerprint visitor IPs. Passed in at deploy time, never stored in Git.')
@secure()
param hashSalt string

@description('Optional: your own Entra ID object ID, so you can use the data in Data Explorer. Leave empty to skip.')
param developerPrincipalId string = ''

// ---------- Fixed IDs of built-in roles (same in every tenant) ----------
var cosmosDataContributorRoleId = '00000000-0000-0000-0000-000000000002' // Cosmos DB data-plane role
var storageBlobDataOwnerRoleId = 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b'   // Azure RBAC role
var ownerRoleId = '8e3af657-a8ff-443c-a75c-2fe8c4bcb635'                  // Azure RBAC role

// ---------- Frontend: Static Web App ----------
// Created empty on purpose: the pipeline uploads the site with a deployment token.
// (Linking a GitHub repo from Bicep would need a personal access token stored somewhere.)
resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: 'swa-crc-${suffix}-${envName}'
  location: swaLocation
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

// ---------- Database: Cosmos DB ----------
// Serverless (pay per request). The free tier is allowed on ONE account per subscription
// and your live account already uses it, so every extra environment is serverless.
resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: 'cosmos-crc-${suffix}-${envName}'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
    minimalTlsVersion: 'Tls12'
    disableLocalAuth: true // keys are refused; only Entra ID identities can read or write data
  }
}

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmos
  name: 'crc'
  properties: {
    resource: {
      id: 'crc'
    }
  }
}

// Total views + unique count live here (one document, id "visitors").
resource counterContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'counter'
  properties: {
    resource: {
      id: 'counter'
      partitionKey: {
        paths: [
          '/id'
        ]
        kind: 'Hash'
      }
    }
  }
}

// The "guest list": one document per visitor fingerprint per day.
// defaultTtl = time to live in seconds; Cosmos deletes each document 24 hours after it was written.
resource visitsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: cosmosDb
  name: 'visits'
  properties: {
    resource: {
      id: 'visits'
      partitionKey: {
        paths: [
          '/id'
        ]
        kind: 'Hash'
      }
      defaultTtl: 86400
    }
  }
}

// ---------- Monitoring: logs + Application Insights ----------
resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-crc-${suffix}-${envName}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-crc-${suffix}-${envName}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logs.id
  }
}

// ---------- API: Function App ----------
// Dedicated storage for the Functions runtime, accessed with the app's identity (no keys in settings).
resource funcStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'stfunc${suffix}${envName}01'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
}

// Y1 / Dynamic = the Consumption plan (Windows), same as the live function app.
resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'asp-crc-${suffix}-${envName}'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {}
}

resource funcApp 'Microsoft.Web/sites@2023-12-01' = {
  name: 'func-crc-${suffix}-${envName}'
  location: location
  kind: 'functionapp'
  identity: {
    type: 'SystemAssigned' // the app's own "badge" in Entra ID
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      cors: {
        // This environment's own site + anything extra (custom domain in prod).
        allowedOrigins: concat(['https://${swa.properties.defaultHostname}'], extraAllowedOrigins)
      }
      appSettings: [
        {
          // "__accountName" = sign in with the app's identity instead of a storage key.
          name: 'AzureWebJobsStorage__accountName'
          value: funcStorage.name
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~22'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'CosmosDbConnection__accountEndpoint'
          value: cosmos.properties.documentEndpoint
        }
        {
          name: 'VISITOR_HASH_SALT'
          value: hashSalt
        }
      ]
    }
  }
}

// ---------- Access (RBAC) ----------
// Function identity -> its runtime storage (Azure RBAC).
resource funcStorageAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: funcStorage
  name: guid(funcStorage.id, funcApp.id, storageBlobDataOwnerRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataOwnerRoleId)
    principalId: funcApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Function identity -> Cosmos data (Cosmos data-plane RBAC, a separate system from Azure RBAC).
// guid() makes a stable name, so redeploying updates this assignment instead of duplicating it.
resource funcCosmosAccess 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2024-05-15' = {
  parent: cosmos
  name: guid(cosmos.id, funcApp.id, cosmosDataContributorRoleId)
  properties: {
    roleDefinitionId: '${cosmos.id}/sqlRoleDefinitions/${cosmosDataContributorRoleId}'
    principalId: funcApp.identity.principalId
    scope: cosmos.id
  }
}

resource devCosmosAccess 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2024-05-15' = if (!empty(developerPrincipalId)) {
  parent: cosmos
  name: guid(cosmos.id, developerPrincipalId, cosmosDataContributorRoleId)
  properties: {
    roleDefinitionId: '${cosmos.id}/sqlRoleDefinitions/${cosmosDataContributorRoleId}'
    principalId: developerPrincipalId
    scope: cosmos.id
  }
}

// ---------- Alerts ----------
// One shared "who to tell" list. Discord / PagerDuty webhooks hold secret URLs,
// so they are added by hand in the portal for prod (or via Key Vault later).
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-crc-${suffix}-${envName}'
  location: 'global'
  properties: {
    groupShortName: 'crc-${envName}' // max 12 characters
    enabled: true
    emailReceivers: [
      {
        name: 'email-owner-user'
        emailAddress: alertEmail
        useCommonAlertSchema: true
      }
    ]
    armRoleReceivers: [
      {
        name: 'email-subscription-owner'
        roleId: ownerRoleId
        useCommonAlertSchema: true
      }
    ]
  }
}

var alertRules = [
  {
    name: 'failures'
    description: 'Some requests failed (5xx).'
    severity: 1
    metricName: 'requests/failed'
    aggregation: 'Count'
    threshold: 0
    window: 'PT5M'
  }
  {
    name: 'slow'
    description: 'Average response time above 3 seconds.'
    severity: 2
    metricName: 'requests/duration' // milliseconds
    aggregation: 'Average'
    threshold: 3000
    window: 'PT15M'
  }
  {
    name: 'flood'
    description: 'More than 200 requests in 5 minutes: spam or a viral moment.'
    severity: 2
    metricName: 'requests/count'
    aggregation: 'Count'
    threshold: 200
    window: 'PT5M'
  }
]

// A loop: three rules from one block of code. Each rule is its own resource (and its own alert).
resource alerts 'Microsoft.Insights/metricAlerts@2018-03-01' = [for rule in alertRules: if (deployAlerts) {
  name: 'alert-crc-${suffix}-${envName}-${rule.name}'
  location: 'global'
  properties: {
    description: rule.description
    severity: rule.severity
    enabled: true
    scopes: [
      appInsights.id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: rule.window
    autoMitigate: true
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: rule.name
          criterionType: 'StaticThresholdCriterion'
          metricNamespace: 'microsoft.insights/components'
          metricName: rule.metricName
          operator: 'GreaterThan'
          threshold: rule.threshold
          timeAggregation: rule.aggregation
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
  }
}]

// ---------- Outputs (the pipeline reads these) ----------
output functionAppName string = funcApp.name
output apiUrl string = 'https://${funcApp.properties.defaultHostName}/api/visitorCount'
output swaName string = swa.name
output siteUrl string = 'https://${swa.properties.defaultHostname}'
output cosmosAccountName string = cosmos.name
