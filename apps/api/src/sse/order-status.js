import { ORDER_STATUS_SEQUENCE, Order } from '../db.js';

const clientsByOrder = new Map(); // orderId -> Set<res>
const timersByOrder = new Map(); // orderId -> NodeJS.Timeout[]

function writeEvent(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export function registerOrderStatusStream(app) {
  app.get('/api/sse/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders?.();

    const existing = await Order.findById(orderId).lean();
    if (existing) {
      writeEvent(res, { type: 'snapshot', order: existing });
    } else {
      writeEvent(res, { type: 'error', message: 'Order not found' });
      res.end();
      return;
    }

    if (!clientsByOrder.has(orderId)) {
      clientsByOrder.set(orderId, new Set());
    }
    clientsByOrder.get(orderId).add(res);

    req.on('close', () => {
      const clients = clientsByOrder.get(orderId);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) {
          clientsByOrder.delete(orderId);
        }
      }
    });
  });
}

export function broadcastOrderStatus(order) {
  const orderId = order._id.toString();
  const clients = clientsByOrder.get(orderId);
  if (!clients || clients.size === 0) {
    return;
  }

  for (const res of clients) {
    writeEvent(res, { type: 'update', order });
  }
}

function scheduleTransition(orderId, nextStatus, delayMs) {
  const timer = setTimeout(async () => {
    const order = await Order.findById(orderId);
    if (!order) return;

    order.status = nextStatus;
    order.history.push({ status: nextStatus, timestamp: new Date(), note: 'Auto progression' });
    if (nextStatus === 'Delivered') {
      order.estimatedDelivery = new Date();
    }
    await order.save();

    broadcastOrderStatus(order.toObject());

    const remainingSequence = ORDER_STATUS_SEQUENCE;
    const currentIndex = remainingSequence.indexOf(nextStatus);
    if (currentIndex < remainingSequence.length - 1) {
      const followingStatus = remainingSequence[currentIndex + 1];
      scheduleTransition(orderId, followingStatus, delayMs);
    }
  }, delayMs);

  if (!timersByOrder.has(orderId)) {
    timersByOrder.set(orderId, []);
  }
  timersByOrder.get(orderId).push(timer);
}

export function scheduleOrderProgression(order) {
  const orderId = order._id.toString();
  if (timersByOrder.has(orderId)) {
    return;
  }

  const currentStatus = order.status;
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === ORDER_STATUS_SEQUENCE.length - 1) {
    return;
  }

  const baseDelay = 4000;
  const nextStatus = ORDER_STATUS_SEQUENCE[currentIndex + 1];
  scheduleTransition(orderId, nextStatus, baseDelay);
}

export function clearOrderTimers(orderId) {
  const timers = timersByOrder.get(orderId);
  if (timers) {
    timers.forEach((timer) => clearTimeout(timer));
    timersByOrder.delete(orderId);
  }
}

export function getActiveSseConnections() {
  let total = 0;
  for (const clients of clientsByOrder.values()) {
    total += clients.size;
  }
  return total;
}
