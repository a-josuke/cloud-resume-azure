// infra/test.bicepparam: the settings for the "test" environment.
// Safe to commit: secrets are read from environment variables at deploy time.
using './main.bicep'

param envName = 'test'
param suffix = 'ad'
param alertEmail = readEnvironmentVariable('ALERT_EMAIL')
param hashSalt = readEnvironmentVariable('HASH_SALT')
param deployAlerts = true
