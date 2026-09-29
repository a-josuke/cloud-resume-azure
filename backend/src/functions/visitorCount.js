// HTTP API for the visitor counter: total views + daily unique visitors.
const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');
const { clientIp, visitorId } = require('../visitor');

// Created once per function instance and reused across requests (faster, fewer connections).
const client = new CosmosClient({
  endpoint: process.env.CosmosDbConnection__accountEndpoint,
  aadCredentials: new DefaultAzureCredential(), // keyless: managed identity in Azure, your login locally
});
const db = client.database('crc');
const counter = db.container('counter');
const visits = db.container('visits');

app.http('visitorCount', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const { resource } = await counter.item('visitors', 'visitors').read();
    const doc = resource ?? { id: 'visitors', count: 0 };
    doc.count = (doc.count ?? 0) + 1;
    doc.uniqueCount = doc.uniqueCount ?? 0;

    // Locally there is no x-forwarded-for header, so fall back to "local".
    const ip = clientIp(request.headers.get('x-forwarded-for')) ?? 'local';
    try {
      // create() fails with 409 if this fingerprint already exists = already counted today.
      await visits.items.create({ id: visitorId(ip, process.env.VISITOR_HASH_SALT) });
      doc.uniqueCount += 1;
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    await counter.items.upsert(doc);
    context.log(`views=${doc.count} unique=${doc.uniqueCount}`);
    return { jsonBody: { count: doc.count, uniqueCount: doc.uniqueCount } };
  },
});