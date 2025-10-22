import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

import { Customer, Order } from '../db.js';

const router = Router();

const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  preferences: z
    .object({
      favoriteCategories: z.array(z.string()).optional(),
      locale: z.string().optional(),
    })
    .optional(),
});

router.get('/', async (req, res) => {
  const email = req.query.email;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email query parameter is required' });
  }

  const customer = await Customer.findOne({ email: email.toLowerCase() }).lean();
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const recentOrders = await Order.find({ customerId: customer._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return res.json({
    customer,
    recentOrders: recentOrders.map((order) => ({
      orderId: order._id.toString(),
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.createdAt,
    })),
  });
});

router.post('/', async (req, res) => {
  const parsed = createCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const existing = await Customer.findOne({ email: payload.email.toLowerCase() }).lean();
  if (existing) {
    return res.status(409).json({ error: 'Customer already exists' });
  }

  const customer = await Customer.create({
    ...payload,
    email: payload.email.toLowerCase(),
  });

  return res.status(201).json(customer);
});

router.get('/:customerId/orders', async (req, res) => {
  const { customerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ error: 'Invalid customer id' });
  }

  const orders = await Order.find({
    customerId: new mongoose.Types.ObjectId(customerId),
  })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ orders });
});

router.get('/:customerId', async (req, res) => {
  const { customerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ error: 'Invalid customer id' });
  }

  const customer = await Customer.findById(customerId).lean();
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json({ customer });
});

export default router;
