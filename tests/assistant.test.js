import { describe, it, expect, beforeEach, vi, afterAll } from 'vitest';

import { classifyIntent } from '../apps/api/src/assistant/intent-classifier.js';
import {
  clearAssistantFunctions,
  assistantFunction,
  listAssistantFunctions,
  invokeAssistantFunction,
} from '../apps/api/src/assistant/function-registry.js';

vi.stubGlobal(
  'fetch',
  vi.fn(async () => ({
    ok: true,
    json: async () => ({ text: 'Assistant reply' }),
  })),
);

describe('assistant intent classifier (root tests)', () => {
  it('classifies order tracking queries', () => {
    const result = classifyIntent('Can you track order ORD-123?');
    expect(result.intent).toBe('order_status');
  });

  it('detects casual greetings as chitchat', () => {
    const greetings = ['Hello there', 'hi team', 'Thanks so much', 'cool, bye!'];
    greetings.forEach((utterance) => {
      const result = classifyIntent(utterance);
      expect(result.intent, `Expected chitchat for "${utterance}"`).toBe('chitchat');
    });
  });

  it('handles the full intent catalog', () => {
    const intentExamples = {
      order_status: [
        'Where is order ORD-0099 right now?',
        'Track package ORD-2024 please',
        'Tell me the status for ORD-DEV-7788',
      ],
      return_policy: [
        'Can I return headphones after 10 days?',
        'Explain the refund policy for damaged items',
        'What is the exchange window for apparel?',
      ],
      product_info: [
        'What product specs do you have for the smartwatch?',
        'Is the gaming laptop available in stock?',
        'Share product details for the Bluetooth speaker',
      ],
      account_help: [
        'Update my shipping address on file',
        'I need help changing my account email',
        'How do I edit my profile phone number?',
      ],
      promotion: [
        'Any coupon codes for today?',
        'Tell me about the winter discount',
        'Can I stack promo codes?',
      ],
      shipping: [
        'How long does express delivery take?',
        'What courier handles shipments to Beirut?',
        'When will the package arrive at my home address?',
      ],
      handoff: [
        'Connect me to a human agent please',
        'I want to speak with a representative',
        'Let me chat with a real support person',
      ],
      abusive: [
        'You are a stupid chatbot',
        'This service sucks',
        'Damn this thing',
      ],
    };

    Object.entries(intentExamples).forEach(([expectedIntent, utterances]) => {
      utterances.forEach((utterance) => {
        const result = classifyIntent(utterance);
        expect(
          result.intent,
          `Expected intent "${expectedIntent}" for utterance "${utterance}", but got "${result.intent}"`,
        ).toBe(expectedIntent);
      });
    });
  });
});

describe('assistant function registry (root tests)', () => {
  beforeEach(() => {
    clearAssistantFunctions();
  });

  it('registers and invokes functions', async () => {
    assistantFunction({
      name: 'demo',
      description: 'Demo function',
      parameters: { type: 'object', properties: {} },
    })(async () => ({ ok: true }));

    expect(listAssistantFunctions()).toHaveLength(1);
    const result = await invokeAssistantFunction('demo', {});
    expect(result).toEqual({ ok: true });
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});
