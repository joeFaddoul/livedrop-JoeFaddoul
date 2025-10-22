import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import { Order, Product, Customer, ORDER_STATUS_SEQUENCE } from '../db.js';
import { scheduleOrderProgression, broadcastOrderStatus } from '../sse/order-status.js';

const router = Router();

const lineItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const createOrderSchema = z.object({
  customerEmail: z.string().email(),
  items: z.array(lineItemSchema).min(1),
});

function serializeOrder(order) {
  return {
    orderId: order._id.toString(),
    _id: order._id,
    customerId: order.customerId,
    email: order.email,
    status: order.status,
    items: order.items,
    total: order.total,
    currency: order.currency,
    idempotencyKey: order.idempotencyKey,
    carrier: order.carrier,
    estimatedDelivery: order.estimatedDelivery,
    history: order.history,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

router.get('/', async (req, res) => {
  const { customerId } = req.query;
  if (!customerId || typeof customerId !== 'string') {
    return res.status(400).json({ error: 'customerId query parameter is required' });
  }

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ error: 'Invalid customer id' });
  }

  const orders = await Order.find({ customerId }).sort({ createdAt: -1 }).lean();
  res.json({
    orders: orders.map((order) => serializeOrder(order)),
  });
});

router.post('/', async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const idempotencyKey =
    typeof req.headers['idempotency-key'] === 'string' ? req.headers['idempotency-key'] : null;

  if (idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey }).lean();
    if (existing) {
      return res.status(200).json({ orderId: existing._id, status: existing.status });
    }
  }

  const payload = parsed.data;
  const customer = await Customer.findOne({ email: payload.customerEmail.toLowerCase() });
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const productIds = parsed.data.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    return res.status(400).json({ error: 'One or more products not found' });
  }

  const itemsForOrder = [];
  let total = 0;
  for (const item of parsed.data.items) {
    const product = products.find((doc) => doc._id.toString() === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.productId} not found` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
    }
    product.stock -= item.quantity;
    await product.save();
    itemsForOrder.push({
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
    });
    total += product.price * item.quantity;
  }

  const order = await Order.create({
    customerId: customer._id,
    email: customer.email,
    status: 'Placed',
    items: itemsForOrder,
    total,
    currency: products[0]?.currency || 'USD',
    idempotencyKey,
    carrier: 'Lightspeed Logistics',
    history: [{ status: 'Placed' }],
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });

  scheduleOrderProgression(order);
  broadcastOrderStatus(order.toObject());

  return res.status(201).json({ orderId: order._id.toString(), status: order.status });
});

router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  const order = await Order.findById(orderId).lean();
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(serializeOrder(order));
});

router.get('/:orderId/history', async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  const order = await Order.findById(orderId, { history: 1, status: 1 }).lean();
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ status: order.status, history: order.history });
});

router.post('/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ error: 'Invalid order id' });
  }

  if (!ORDER_STATUS_SEQUENCE.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  order.history.push({ status, timestamp: new Date(), note: 'Manual update' });
  await order.save();

  broadcastOrderStatus(order.toObject());
  res.json({ status: order.status });
});

router.get('/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ error: 'Invalid customer id' });
  }

  const orders = await Order.find({ customerId }).sort({ createdAt: -1 }).lean();
  res.json({ orders });
});

export default router;
