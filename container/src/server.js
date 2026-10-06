// The visitor-counter API as a plain Node HTTP server, packaged in a container.
// Same behaviour as the Azure Functions version, but it runs anywhere a container runs.
//
//   createApp(deps)  builds the request handler. All outside dependencies are passed in, so the
//                    tests can use fakes instead of real Azure services.
//   main()           wires the real Azure adapters and starts listening.
const http = require('node:http');
const { clientIp, visitorId } = require('../../backend/src/visitor');
const { buildEvent, fromStatsEntity, lastDays } = require('../../backend/src/events');

function createApp({ store, analytics, salt, allowedOrigins = [], now = () => new Date(), log = console, revision = 'local' }) {
  const json = (status, body, extra = {}) => ({ status, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...extra } });

  async function visitorCount(req, url) {
    const doc = (await store.getCounter()) ?? { id: 'visitors', count: 0 };
    doc.count = (doc.count ?? 0) + 1;
    doc.uniqueCount = doc.uniqueCount ?? 0;

    // Behind the Container Apps ingress the real client is the first x-forwarded-for entry.
    const ip = clientIp(req.headers['x-forwarded-for']) ?? 'local';
    const isUnique = await store.markVisit(visitorId(ip, salt, now()));
    if (isUnique) doc.uniqueCount += 1;
    await store.saveCounter(doc);

    // Analytics must never break the counter: log and carry on.
    try {
      await analytics.record(buildEvent({ now: now(), userAgent: req.headers['user-agent'], referrer: url.searchParams.get('ref'), isUnique }));
    } catch (err) {
      log.warn(`analytics write failed: ${err.message}`);
    }
    return json(200, { count: doc.count, uniqueCount: doc.uniqueCount }, { 'Cache-Control': 'no-store' });
  }

  async function stats(_req, url) {
    const asked = Number.parseInt(url.searchParams.get('days') ?? '30', 10);
    const days = Number.isInteger(asked) && asked >= 1 && asked <= 90 ? asked : 30;
    const wanted = lastDays(days, now());
    const found = new Map((await analytics.readDays(wanted[0])).map((d) => [d.day, d]));
    // Days without data still appear, as zeros, so charts have no gaps.
    const result = wanted.map((day) => found.get(day) ?? fromStatsEntity({ rowKey: day }));
    return json(200, { days: result }, { 'Cache-Control': 'public, max-age=300' });
  }

  const routes = {
    '/api/visitorCount': visitorCount,
    '/api/stats': stats,
    // Liveness/readiness probe target: answers instantly and touches no database.
    '/healthz': async () => json(200, { status: 'ok' }, { 'Cache-Control': 'no-store' }),
  };

  return async function handle(req) {
    const url = new URL(req.url, 'http://localhost');
    const origin = req.headers.origin;
    const cors = origin && allowedOrigins.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
      : {};
    const common = { ...cors, 'X-Content-Type-Options': 'nosniff', 'x-app-revision': revision };

    try {
      const route = routes[url.pathname];
      if (!route) return { status: 404, body: JSON.stringify({ error: 'not found' }), headers: { 'Content-Type': 'application/json', ...common } };
      if (req.method === 'OPTIONS') return { status: 204, body: '', headers: { ...common, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '600' } };
      if (req.method !== 'GET') return { status: 405, body: JSON.stringify({ error: 'method not allowed' }), headers: { 'Content-Type': 'application/json', Allow: 'GET', ...common } };
      const out = await route(req, url);
      return { ...out, headers: { ...out.headers, ...common } };
    } catch (err) {
      log.error(`request failed: ${err.stack ?? err}`); // full detail stays in the logs...
      return { status: 500, body: JSON.stringify({ error: 'internal error' }), headers: { 'Content-Type': 'application/json', ...common } }; // ...never in the response
    }
  };
}

// Adapts the handler to Node's http server.
function toServer(handle) {
  return http.createServer(async (req, res) => {
    const out = await handle(req);
    res.writeHead(out.status, out.headers);
    res.end(out.body);
  });
}

function main() {
  // Required here (not at the top) so tests can import this file without Azure libraries.
  const { createAzureDeps } = require('./adapters');
  const required = ['CosmosDbConnection__accountEndpoint', 'VISITOR_HASH_SALT'];
  const missing = required.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  const { store, analytics } = createAzureDeps(process.env);
  const handle = createApp({
    store,
    analytics,
    salt: process.env.VISITOR_HASH_SALT,
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    revision: process.env.CONTAINER_APP_REVISION ?? 'local', // Container Apps sets this
  });
  const server = toServer(handle);
  const port = Number(process.env.PORT ?? 8080);
  server.listen(port, () => console.log(`listening on ${port}`));

  // Container Apps sends SIGTERM before stopping a replica (scale-in, new revision).
  // Finish in-flight requests, then exit: no visitor gets a dropped connection.
  const stop = () => {
    console.log('SIGTERM received, shutting down');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}

module.exports = { createApp, toServer };
if (require.main === module) main();
