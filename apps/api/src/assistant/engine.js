import { Router } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

import { env } from '../config/env.js';
import { classifyIntent } from './intent-classifier.js';
import {
  assistantFunction,
  listAssistantFunctions,
  invokeAssistantFunction,
} from './function-registry.js';
import { AssistantMetric, Order, Customer, Product } from '../db.js';
import { broadcastOrderStatus } from '../sse/order-status.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const groundTruthPath = path.resolve(__dirname, '../../../../docs/ground-truth.json');
let groundTruthEntries = [];
let groundTruthIndex = new Map();

try {
  const raw = readFileSync(groundTruthPath, 'utf-8');
  groundTruthEntries = JSON.parse(raw);
  groundTruthIndex = new Map(groundTruthEntries.map((entry) => [entry.qid, entry]));
} catch (error) {
  console.warn('Unable to load ground-truth.json. Assistant will operate in fallback mode.', error);
}

const messageSchema = z.object({
  message: z.string().min(1),
  customerEmail: z.string().email().optional(),
});

function scorePolicy(questionTokens, entry) {
  const docTokens = new Set(
    `${entry.question} ${entry.answer}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
  );
  let overlap = 0;
  questionTokens.forEach((token) => {
    if (docTokens.has(token)) {
      overlap += 1;
    }
  });
  if (overlap === 0) {
    return 0;
  }
  return overlap / Math.max(1, docTokens.size);
}

function retrievePolicies(message, limit = 3) {
  if (groundTruthEntries.length === 0) return [];
  const tokens = new Set(
    message
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2),
  );

  const scored = groundTruthEntries
    .map((entry) => ({
      entry,
      score: scorePolicy(tokens, entry),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);

  return scored;
}

async function callLlm(prompt) {
  try {
    const response = await fetch(`${env.LLM_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.LLM_API_KEY ? { Authorization: `Bearer ${env.LLM_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        prompt,
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LLM error: ${response.status} ${text}`);
    }

    const payload = await response.json();
    return payload.text || payload.answer || '';
  } catch (error) {
    console.error('LLM call failed', error); // eslint-disable-line no-console
    throw new Error('Assistant is unavailable right now');
  }
}

function buildPrompt({ persona, intent, message, policyContext, orderSummary, functionResults }) {
  const policyText =
    policyContext.length === 0
      ? 'No relevant policies were found.'
      : policyContext
          .map(
            (policy, index) =>
              `[${policy.qid}] ${policy.question}\nAnswer: ${policy.answer.trim()}`,
          )
          .join('\n\n');

  const functionText =
    functionResults.length === 0
      ? 'No assistant functions were invoked.'
      : functionResults
          .map(
            (fn) =>
              `Function ${fn.name}\nArgs: ${JSON.stringify(fn.args)}\nResult: ${JSON.stringify(
                fn.result,
              )}`,
          )
          .join('\n\n');

  return `
System persona: ${persona}
User intent: ${intent}

Policies:
${policyText}

Order summary:
${orderSummary || 'No order status available.'}

Function results:
${functionText}

User question: """${message.trim()}"""

Instructions:
- Answer concisely using the policies above.
- Cite policy IDs in square brackets, e.g., [Q01].
- If you do not find a relevant policy, politely refuse and explain what details you need.
- Never mention internal model names or training data.
- If an order summary is provided, include it in the reply before policy guidance.
`;
}

function validateCitationsFromAnswer(answer, fallbackCitations = []) {
  if (!answer) {
    return {
      isValid: fallbackCitations.length === 0,
      citedCitations: [],
      validCitations: [],
      invalidCitations: [],
    };
  }

  const citationRegex = /\[([A-Za-z0-9._-]+)\]/g;
  const citationsInAnswer = new Set();
  let match;
  while ((match = citationRegex.exec(answer)) !== null) {
    citationsInAnswer.add(match[1]);
  }

  // include citations the pipeline expected even if answer omitted them
  fallbackCitations.forEach((citation) => citationsInAnswer.add(citation));

  const citedList = Array.from(citationsInAnswer);
  const valid = citedList.filter((id) => groundTruthIndex.has(id));
  const invalid = citedList.filter((id) => !groundTruthIndex.has(id));

  return {
    isValid: invalid.length === 0,
    citedCitations: citedList,
    validCitations: valid,
    invalidCitations: invalid,
  };
}

// Assistant functions -------------------------------------------------------
assistantFunction({
  name: 'getOrderStatus',
  description: 'Retrieve status for a specific order ID.',
  parameters: {
    type: 'object',
    properties: {
      orderId: { type: 'string' },
    },
    required: ['orderId'],
  },
})(async ({ args }) => {
  const { orderId } = args;
  const order = await Order.findById(orderId).lean();
  if (!order) {
    return { found: false };
  }
  broadcastOrderStatus(order);
  return {
    found: true,
    order: {
      orderId: order._id.toString(),
      status: order.status,
      carrier: order.carrier,
      eta: order.estimatedDelivery,
    },
  };
});

assistantFunction({
  name: 'getCustomerOrders',
  description: 'List the latest orders for a customer email.',
  parameters: {
    type: 'object',
    properties: {
      customerEmail: { type: 'string' },
    },
    required: ['customerEmail'],
  },
})(async ({ args }) => {
  const customer = await Customer.findOne({ email: args.customerEmail.toLowerCase() });
  if (!customer) {
    return { found: false };
  }
  const orders = await Order.find({ customerId: customer._id })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  return {
    found: true,
    orders: orders.map((order) => ({
      orderId: order._id.toString(),
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
    })),
  };
});

assistantFunction({
  name: 'listAssistantFunctions',
  description: 'List the assistant functions available for debugging or introspection.',
  parameters: {
    type: 'object',
    properties: {},
  },
})(async () => ({
  functions: listAssistantFunctions(),
}));

assistantFunction({
  name: 'searchProducts',
  description: 'Search products by name, description, or tags.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      limit: { type: 'number', minimum: 1, maximum: 20 },
    },
    required: ['query'],
  },
})(async ({ args }) => {
  const query = (args.query ?? '').trim();
  const limit = Math.max(1, Math.min(Number(args.limit) || 5, 20));
  if (!query) {
    return { results: [] };
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const products = await Product.find({
    $or: [{ name: regex }, { description: regex }, { tags: regex }],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    results: products.map((product) => ({
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      tags: product.tags ?? [],
    })),
  };
});

// Routes --------------------------------------------------------------------
router.get('/functions', (_req, res) => {
  res.json({ functions: listAssistantFunctions() });
});

router.post('/chat', async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { message, customerEmail } = parsed.data;
  const intentResult = classifyIntent(message);
  if (intentResult.intent === 'chitchat') {
    const lowerMessage = message.toLowerCase();
    let friendlyReply =
      "Hi there! 👋 I'm AShop. Let me know if you need help with orders, returns, or anything else about Shoplite.";

    if (lowerMessage.includes('thank')) {
      friendlyReply =
        "You're very welcome! If there's anything else you need—order status, returns, or product info—just let me know.";
    } else if (lowerMessage.includes('bye') || lowerMessage.includes('see ya') || lowerMessage.includes('goodbye')) {
      friendlyReply =
        "Talk soon! If you need help tracking an order or checking policies later, just open the support panel again. 👋";
    } else if (lowerMessage.includes('morning') || lowerMessage.includes('evening')) {
      friendlyReply =
        "Greetings! I'm here to help with orders, shipping, returns, or any Shoplite questions whenever you need.";
    }

    await AssistantMetric.create({
      intent: intentResult.intent,
      success: true,
      citedPolicies: [],
      customerEmail: customerEmail?.toLowerCase(),
      metadata: { notes: 'Handled via canned chitchat response', messageVariant: friendlyReply },
    });
    return res.json({
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      answer: friendlyReply,
      citations: [],
      invocations: [],
      policies: [],
      citationReport: {
        isValid: true,
        citedCitations: [],
        validCitations: [],
        invalidCitations: [],
      },
    });
  }

  if (intentResult.intent === 'abusive') {
    const refusal =
      "I'm here to help with orders and policies, but I can't respond to abusive language. Please rephrase your request.";
    await AssistantMetric.create({
      intent: intentResult.intent,
      success: false,
      citedPolicies: [],
      customerEmail: customerEmail?.toLowerCase(),
      metadata: { notes: 'Automated refusal due to abusive language' },
    });
    return res.json({
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      answer: refusal,
      citations: [],
      invocations: [],
      policies: [],
      citationReport: {
        isValid: true,
        citedCitations: [],
        validCitations: [],
        invalidCitations: [],
      },
    });
  }

  const policyContext = retrievePolicies(message);
  const invocations = [];
  let orderSummary = '';

  const orderIdMatches = message.match(/\b[A-Z0-9-]{10,}\b/g) || [];

  if (intentResult.intent === 'order_status' && orderIdMatches.length > 0) {
    const orderId = orderIdMatches[0];
    const result = await invokeAssistantFunction('getOrderStatus', { orderId });
    invocations.push({ name: 'getOrderStatus', args: { orderId }, result });
    if (result.found) {
      const eta = result.order.eta ? new Date(result.order.eta).toLocaleDateString() : 'N/A';
      orderSummary = `Order ${result.order.orderId} is currently ${result.order.status}. Carrier: ${result.order.carrier}. ETA: ${eta}.`;
    } else {
      orderSummary = `Order ${orderId} was not found.`;
    }
  } else if (intentResult.intent === 'order_status' && customerEmail) {
    const result = await invokeAssistantFunction('getCustomerOrders', { customerEmail });
    invocations.push({ name: 'getCustomerOrders', args: { customerEmail }, result });
    if (result.found) {
      orderSummary = result.orders
        .map(
          (order) =>
            `Order ${order.orderId} placed on ${new Date(order.createdAt).toLocaleDateString()} is ${order.status}.`,
        )
        .join(' ');
    }
  } else if (intentResult.intent === 'product_info') {
    const result = await invokeAssistantFunction('searchProducts', {
      query: message,
      limit: 5,
    });
    invocations.push({ name: 'searchProducts', args: { query: message, limit: 5 }, result });
  }

  let answer = '';
  let citations = policyContext.map((policy) => policy.qid);
  const persona =
    'AShop, the cheerful yet precise Lightspeed assistant focused on policies, never breaking confidentiality.';

  if (policyContext.length === 0) {
    answer =
      "I couldn't find the exact policy for that in our knowledge base. Could you provide more details or rephrase?";
    citations = [];
  } else {
    try {
      const prompt = buildPrompt({
        persona,
        intent: intentResult.intent,
        message,
        policyContext,
        orderSummary,
        functionResults: invocations,
      });
      const llmText = await callLlm(prompt);
      answer = llmText.trim();
    } catch (error) {
      answer =
        'I am unable to reach the assistant service at the moment. Please try again shortly or contact a human agent.';
    }
  }

  const citationReport = validateCitationsFromAnswer(answer, citations);
  if (citationReport.validCitations.length > 0) {
    citations = citationReport.validCitations;
  } else if (citationReport.citedCitations.length === 0) {
    citations = [];
  }

  await AssistantMetric.create({
    intent: intentResult.intent,
    success: policyContext.length > 0,
    citedPolicies: citations,
    customerEmail: customerEmail?.toLowerCase(),
    metadata: { invocations },
  });

  res.json({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    answer,
    citations,
    invocations,
    policies: policyContext.map((policy) => ({ qid: policy.qid, question: policy.question })),
    citationReport,
  });
});

router.post('/functions/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await invokeAssistantFunction(name, req.body || {});
    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
