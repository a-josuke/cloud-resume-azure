// One place that knows how to reach Table Storage.
//  - In Azure: TABLES_ACCOUNT_URL is set (https://<account>.table.core.windows.net) and the
//    function's managed identity signs in. No keys anywhere.
//  - On your PC: no setting, so we use the Azurite emulator (Ctrl+Shift+P > Azurite: Start).
const { TableClient } = require('@azure/data-tables');
const { DefaultAzureCredential } = require('@azure/identity');

const cache = new Map();

function getTable(name) {
  if (!cache.has(name)) {
    const url = process.env.TABLES_ACCOUNT_URL;
    const client = url
      ? new TableClient(url, name, new DefaultAzureCredential())
      : TableClient.fromConnectionString('UseDevelopmentStorage=true', name, { allowInsecureConnection: true });
    cache.set(name, client);
  }
  return cache.get(name);
}

// createTable is safe to call again: it just says "already exists" (409), which we ignore.
// We remember which tables we've already checked, so this costs one call per table per server start.
const ensured = new Set();

async function ensureTable(name) {
  const t = getTable(name);
  if (!ensured.has(name)) {
    try {
      await t.createTable();
    } catch (err) {
      if (err.statusCode !== 409) throw err;
    }
    ensured.add(name);
  }
  return t;
}

module.exports = { getTable, ensureTable };
