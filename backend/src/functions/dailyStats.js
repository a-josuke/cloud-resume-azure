// TRANSFORM + LOAD: every hour, recompute today's and yesterday's summary from the raw events
// and upsert it into the "dailystats" table. Also deletes raw events older than 90 days.
const { app } = require('@azure/functions');
const { ensureTable } = require('../tables');
const { aggregate, toStatsEntity, dayOf } = require('../events');

const RETENTION_DAYS = 90;

async function eventsOf(table, day) {
  const rows = [];
  const iter = table.listEntities({ queryOptions: { filter: `PartitionKey eq '${day}'` } });
  for await (const e of iter) rows.push(e);
  return rows;
}

async function buildDay(events, stats, day) {
  const rows = await eventsOf(events, day);
  const summary = aggregate(day, rows);
  // upsert = insert or replace: running this twice gives the same result (idempotent)
  await stats.upsertEntity(toStatsEntity(summary), 'Replace');
  return summary;
}

async function pruneOldEvents(events, now) {
  const cutoff = dayOf(new Date(now.getTime() - RETENTION_DAYS * 86400000));
  const iter = events.listEntities({
    queryOptions: { filter: `PartitionKey lt '${cutoff}'`, select: ['PartitionKey', 'RowKey'] },
  });
  let deleted = 0;
  for await (const e of iter) {
    await events.deleteEntity(e.partitionKey, e.rowKey);
    deleted += 1;
  }
  return deleted;
}

app.timer('dailyStats', {
  schedule: '0 10 * * * *', // second 0, minute 10, every hour (NCRONTAB: sec min hour day month weekday)
  handler: async (_timer, context) => {
    const now = new Date();
    const events = await ensureTable('visitevents');
    const stats = await ensureTable('dailystats');

    // Yesterday is rebuilt too, so late events and the midnight boundary are never lost.
    const yesterday = dayOf(new Date(now.getTime() - 86400000));
    const y = await buildDay(events, stats, yesterday);
    const t = await buildDay(events, stats, dayOf(now));
    context.log(`dailyStats: ${y.day} views=${y.views}, ${t.day} views=${t.views}`);

    if (now.getUTCHours() === 3) {
      context.log(`dailyStats: pruned ${await pruneOldEvents(events, now)} old events`);
    }
  },
});
