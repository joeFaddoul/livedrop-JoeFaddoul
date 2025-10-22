import express from 'express';
import cors from 'cors';
import 'express-async-errors';

import { env } from './config/env.js';
import { connectToDatabase } from './db.js';
import customersRouter from './routes/customers.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import analyticsRouter from './routes/analytics.js';
import dashboardRouter from './routes/dashboard.js';
import assistantRouter from './assistant/engine.js';
import { registerOrderStatusStream } from './sse/order-status.js';

const app = express();

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/assistant', assistantRouter);

registerOrderStatusStream(app);

app.use((error, _req, res, _next) => {
  console.error('Unhandled error', error); // eslint-disable-line no-console
  res.status(500).json({ error: 'Internal Server Error' });
});

async function start() {
  try {
    await connectToDatabase(env.MONGODB_URI);
    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error); // eslint-disable-line no-console
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { app, start };
