import { Router } from 'express';

import { Order, Customer, AssistantMetric } from '../db.js';

const router = Router();

function buildDailyRevenuePipeline(startDate, endDate) {
  return [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        revenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: 1,
        orderCount: 1,
      },
    },
  ];
}

async function loadBusinessSummary({ windowDays = 30 } = {}) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const [orderStats] = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
        averageOrderValue: { $avg: '$total' },
      },
    },
  ]);

  const [customerCount, activeCustomers] = await Promise.all([
    Customer.countDocuments(),
    Order.distinct('customerId', {
      createdAt: { $gte: since },
    }),
  ]);

  return {
    revenue: orderStats?.revenue ?? 0,
    orders: orderStats?.orders ?? 0,
    averageOrderValue: orderStats?.averageOrderValue ?? 0,
    totalCustomers: customerCount,
    activeCustomers: activeCustomers.length,
  };
}

async function loadAssistantSummary({ windowDays = 30 } = {}) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  return AssistantMetric.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: '$intent',
        total: { $sum: 1 },
        successes: { $sum: { $cond: ['$success', 1, 0] } },
        avgDuration: { $avg: '$durationMs' },
      },
    },
    { $sort: { total: -1 } },
  ]);
}

router.get('/summary', async (_req, res) => {
  const summary = await loadBusinessSummary();
  res.json(summary);
});

router.get('/sales/trailing', async (_req, res) => {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const trend = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  res.json({ trend });
});

router.get('/assistant', async (_req, res) => {
  const intents = await loadAssistantSummary();
  res.json({ intents });
});

router.get('/sales/daily', async (req, res) => {
  const { startDate, endDate } = req.query;

  const now = new Date();
  const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days

  const start = startDate ? new Date(startDate) : defaultStart;
  const end = endDate ? new Date(endDate) : now;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid startDate or endDate. Use ISO date strings.' });
  }

  if (start > end) {
    return res.status(400).json({ error: 'startDate must be before endDate.' });
  }

  // include entire end day by moving to start of next day
  const inclusiveEnd = new Date(end);
  inclusiveEnd.setHours(23, 59, 59, 999);

  const points = await Order.aggregate(buildDailyRevenuePipeline(start, inclusiveEnd));

  res.json({
    range: {
      startDate: start.toISOString(),
      endDate: inclusiveEnd.toISOString(),
    },
    points,
  });
});

router.get('/daily-revenue', async (req, res) => {
  const { from, to } = req.query;
  const now = new Date();
  const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const start = from ? new Date(from) : defaultStart;
  const end = to ? new Date(to) : now;

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Invalid from/to parameters. Use ISO date strings.' });
  }
  if (start > end) {
    return res.status(400).json({ error: 'from must be before to.' });
  }

  const inclusiveEnd = new Date(end);
  inclusiveEnd.setHours(23, 59, 59, 999);

  const points = await Order.aggregate(buildDailyRevenuePipeline(start, inclusiveEnd));
  res.json({
    range: {
      startDate: start.toISOString(),
      endDate: inclusiveEnd.toISOString(),
    },
    points,
  });
});

router.get('/dashboard-metrics', async (_req, res) => {
  const [business, assistantIntents] = await Promise.all([
    loadBusinessSummary({ windowDays: 30 }),
    loadAssistantSummary({ windowDays: 30 }),
  ]);

  res.json({
    ...business,
    assistantIntents,
  });
});

export default router;
