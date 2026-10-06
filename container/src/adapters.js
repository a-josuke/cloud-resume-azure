// The real Azure connections (kept apart from server.js so the server can be tested with fakes).
// Everything signs in with the container's managed identity: no keys, no connection strings.
const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');
const { ensureTable } = require('../../backend/src/tables');
const { fromStatsEntity } = require('../../backend/src/events');

function createAzureDeps(env) {
  // AZURE_CLIENT_ID (set in the container app) tells DefaultAzureCredential WHICH
  // user-assigned identity to use. Locally it falls back to your own az login.
  const client = new CosmosClient({
    endpoint: env.CosmosDbConnection__accountEndpoint,
    aadCredentials: new DefaultAzureCredential(),
  });
  const db = client.database('crc');
  const counter = db.container('counter');
  const visits = db.container('visits');

  const store = {
    async getCounter() {
      const { resource } = await counter.item('visitors', 'visitors').read();
      return resource ?? null;
    },
    async saveCounter(doc) {
      await counter.items.upsert(doc);
    },
    // create() fails with 409 if this fingerprint already exists = already counted today.
    async markVisit(id) {
      try {
        await visits.items.create({ id });
        return true;
      } catch (err) {
        if (err.code === 409) return false;
        throw err;
      }
    },
  };

  const analytics = {
    async record(event) {
      const table = await ensureTable('visitevents');
      await table.createEntity(event);
    },
    async readDays(fromDay) {
      const table = await ensureTable('dailystats');
      const out = [];
      const iter = table.listEntities({ queryOptions: { filter: `PartitionKey eq 'daily' and RowKey ge '${fromDay}'` } });
      for await (const e of iter) out.push(fromStatsEntity(e));
      return out;
    },
  };
  return { store, analytics };
}

module.exports = { createAzureDeps };
