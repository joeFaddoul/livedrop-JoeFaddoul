import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';

import { Product, Order } from '../db.js';

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url(),
  stock: z.number().int().min(0),
  creatorId: z.string().optional(),
});

router.get('/', async (req, res) => {
  const rawLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 100);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const skip = (page - 1) * limit;

  const tag = typeof req.query.tag === 'string' && req.query.tag.trim().length > 0 ? req.query.tag : null;
  const category =
    typeof req.query.category === 'string' && req.query.category.trim().length > 0 ? req.query.category : null;
  const search =
    typeof req.query.search === 'string' && req.query.search.trim().length > 0 ? req.query.search.trim() : null;
  const sortParam = typeof req.query.sort === 'string' ? req.query.sort : 'newest';

  const query = {};
  if (tag) {
    query.tags = tag;
  }
  if (category) {
    query.category = category;
  }
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ name: regex }, { description: regex }, { tags: regex }];
  }

  const sortMap = {
    'price:asc': { price: 1 },
    'price:desc': { price: -1 },
    'stock:asc': { stock: 1 },
    'stock:desc': { stock: -1 },
    'createdAt:asc': { createdAt: 1 },
    'createdAt:desc': { createdAt: -1 },
    newest: { createdAt: -1 },
  };
  const sort = sortMap[sortParam] || sortMap.newest;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const product = await Product.findById(id).lean();
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

router.get('/:id/related', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const product = await Product.findById(id).lean();
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    tags: { $in: product.tags },
  })
    .limit(6)
    .lean();

  res.json({ related });
});

router.post('/', async (req, res) => {
  const parsed = createProductSchema.safeParse({
    ...req.body,
    tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
  });

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const product = await Product.create(parsed.data);
  res.status(201).json(product);
});

router.get('/reports/top', async (_req, res) => {
  const pipeline = [
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: Product.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 0,
        productId: '$product._id',
        name: '$product.name',
        unitsSold: 1,
        revenue: 1,
      },
    },
  ];

  const results = await Order.aggregate(pipeline);
  res.json({ topSellers: results });
});

export default router;
