// infra/main.bicep
// Cloud Resume Challenge infrastructure, defined as code.
// Step 3: website storage + Cosmos DB + the Function App stack.

@description('Azure region for all resources. Defaults to the resource group region.')
param location string = resourceGroup().location

@description('Short suffix used in resource names (your initials).')
param suffix string = 'ad'

@description('Websites allowed to call the API from a browser (CORS).')
param allowedOrigins array = [
  'https://cloud.ankit-dahal.com.np'
]

// ---------- Website storage ----------
// Storage account names: 3-24 chars, lowercase letters and numbers only, globally unique.
resource siteStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'stcrc${suffix}iac01'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'     // refuse old, insecure TLS
    supportsHttpsTrafficOnly: true  // no plain http
    allowBlobPublicAccess: false    // nothing public unless we say so
  }
}

// ---------- Cosmos DB ----------
// Serverless: pay per request, no fixed RU/s. The free tier is limited to ONE account
// per subscription (your live cosmos-crc-ad already has it), so this copy uses serverless.
resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: 'cosmos-crc-${suffix}-iac'
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
  }
}

// Child resources use "parent" so Bicep knows the hierarchy: account > database > container.
resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmos
  name: 'crc'
  properties: {
    resource: {
      id: 'crc'
    }
  }
}

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

// ---------- Function App stack ----------
// Dedicated storage for the Functions runtime (keys, locks, trigger state).
// Kept separate from website storage so the two never share keys or fate.
resource funcStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'stfunc${suffix}iac01'
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

// Log Analytics workspace: where Application Insights stores its logs (your KQL queries run here).
resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-crc-${suffix}-iac'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-crc-${suffix}-iac'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logs.id
  }
}

// Y1 / Dynamic = the Consumption plan (Windows), same as your live function app.
resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'asp-crc-${suffix}-iac'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {}
}

// Built at deploy time from the real account key. The secret never appears in this file or in Git.
var funcStorageConnection = 'DefaultEndpointsProtocol=https;AccountName=${funcStorage.name};AccountKey=${funcStorage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

resource funcApp 'Microsoft.Web/sites@2023-12-01' = {
  name: 'func-crc-${suffix}-iac'
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      cors: {
        allowedOrigins: allowedOrigins
      }
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: funcStorageConnection
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: funcStorageConnection
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: 'func-crc-${suffix}-iac'
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
          // Same name your code's bindings use. Value fetched from Cosmos at deploy time.
          name: 'CosmosDbConnection'
          value: cosmos.listConnectionStrings().connectionStrings[0].connectionString
        }
      ]
    }
  }
}

output storageAccountName string = siteStorage.name
output cosmosAccountName string = cosmos.name
output cosmosEndpoint string = cosmos.properties.documentEndpoint
output functionAppUrl string = 'https://${funcApp.properties.defaultHostName}'
