// src/functions/visitorCount.js
// HTTP API for the Cloud Resume visitor counter.
// Reads the "visitors" item from Cosmos DB, adds 1, saves it, returns the new count.

const { app, input, output } = require('@azure/functions');
const { nextCount } = require('../counter');

// Input binding: Azure reads this item for us before our code runs.
const counterIn = input.cosmosDB({
  databaseName: 'crc',
  containerName: 'counter',
  id: 'visitors',
  partitionKey: 'visitors',
  connection: 'CosmosDbConnection', // name of the app setting, never the secret itself
});

// Output binding: whatever we set here gets saved (upserted) to Cosmos DB after our code runs.
const counterOut = output.cosmosDB({
  databaseName: 'crc',
  containerName: 'counter',
  connection: 'CosmosDbConnection',
});

app.http('visitorCount', {
  methods: ['GET'],
  authLevel: 'anonymous', // public: your website calls it from the browser
  extraInputs: [counterIn],
  extraOutputs: [counterOut],
  handler: async (request, context) => {
    const item = context.extraInputs.get(counterIn);
    const count = nextCount(item);

    context.extraOutputs.set(counterOut, { id: 'visitors', count });
    context.log(`Visitor count is now ${count}`);

    return { jsonBody: { count } };
  },
});

