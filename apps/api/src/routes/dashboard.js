import { Router } from 'express';

import { Order, Product, Customer, AssistantMetric } from '../db.js';
import { getActiveSseConnections } from '../sse/order-status.js';

const router = Router();

async function loadBusinessMetrics() {
  const [summary] = await Order.aggregate([
    {
      $group: {
        _id: null,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
        averageOrderValue: { $avg: '$total' },
      },
    },
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalCustomers, activeCustomers] = await Promise.all([
    Customer.countDocuments(),
    Order.distinct('customerId', {
      createdAt: { $gte: sevenDaysAgo },
    }),
  ]);

  return {
    revenue: summary?.revenue ?? 0,
    orders: summary?.orders ?? 0,
    averageOrderValue: summary?.averageOrderValue ?? 0,
    activeCustomers: activeCustomers.length,
    totalCustomers,
  };
}

async function loadAssistantStats(windowDays = 30) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  return AssistantMetric.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: '$intent',
        total: { $sum: 1 },
        successRate: { $avg: { $cond: ['$success', 1, 0] } },
      },
    },
    { $sort: { total: -1 } },
  ]);
}

async function loadPerformanceMetrics() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [latencyAgg] = await AssistantMetric.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: null,
        avgLatency: { $avg: '$durationMs' },
        total: { $sum: 1 },
      },
    },
  ]);

  return {
    uptimeSeconds: Math.round(process.uptime()),
    assistantRequests30d: latencyAgg?.total ?? 0,
    assistantAvgLatencyMs: Math.round(latencyAgg?.avgLatency ?? 0),
    activeSseConnections: getActiveSseConnections(),
    sampledWindowDays: 30,
  };
}

router.get('/business-metrics', async (_req, res) => {
  const metrics = await loadBusinessMetrics();
  res.json(metrics);
});

router.get('/assistant-stats', async (_req, res) => {
  const assistantSummary = await loadAssistantStats();
  res.json({ intents: assistantSummary });
});

router.get('/performance', async (_req, res) => {
  const performance = await loadPerformanceMetrics();
  res.json(performance);
});

router.get('/', async (_req, res) => {
  const [latestOrders, lowStockProducts, businessMetrics, assistantSummary, performanceMetrics] =
    await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(10).lean(),
      Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(10).lean(),
      loadBusinessMetrics(),
      loadAssistantStats(),
      loadPerformanceMetrics(),
    ]);

  res.json({
    latestOrders,
    lowStockProducts,
    assistantSummary,
    ...businessMetrics,
    performance: performanceMetrics,
  });
});

export default router;
