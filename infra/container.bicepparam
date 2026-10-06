// infra/container.bicepparam: settings for the container version of the "test" environment.
// Safe to commit: secrets and per-run values are read from environment variables at deploy time.
using './container.bicep'

param envName = 'test'
param suffix = 'ad'
param hashSalt = readEnvironmentVariable('HASH_SALT')
param pipelinePrincipalId = readEnvironmentVariable('PIPELINE_PRINCIPAL_ID')
param deployApp = readEnvironmentVariable('DEPLOY_APP', 'false') == 'true'
param image = readEnvironmentVariable('IMAGE', '')
