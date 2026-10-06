// SERVE: GET /api/stats?days=30 returns the daily summaries for the dashboard.
const { app } = require('@azure/functions');
const { ensureTable } = require('../tables');
const { fromStatsEntity, lastDays } = require('../events');

app.http('stats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request) => {
    // Validate input: a whole number from 1 to 90, anything else falls back to 30.
    const asked = Number.parseInt(request.query.get('days') ?? '30', 10);
    const days = Number.isInteger(asked) && asked >= 1 && asked <= 90 ? asked : 30;

    const table = await ensureTable('dailystats');
    const wanted = lastDays(days);
    const byDay = new Map();
    const iter = table.listEntities({
      queryOptions: { filter: `PartitionKey eq 'daily' and RowKey ge '${wanted[0]}'` },
    });
    for await (const e of iter) byDay.set(e.rowKey, fromStatsEntity(e));

    // Days with no data still appear (as zeros), so the chart has no gaps.
    const result = wanted.map((day) => byDay.get(day) ?? fromStatsEntity({ rowKey: day }));
    return {
      jsonBody: { days: result },
      headers: { 'Cache-Control': 'public, max-age=300' },
    };
  },
});
