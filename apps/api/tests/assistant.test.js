import { describe, it, expect, beforeEach } from 'vitest';

import { classifyIntent } from '../src/assistant/intent-classifier.js';
import {
  clearAssistantFunctions,
  assistantFunction,
  listAssistantFunctions,
  invokeAssistantFunction,
} from '../src/assistant/function-registry.js';

describe('intent-classifier', () => {
  it('detects order status intent', () => {
    const result = classifyIntent('Where is my order ORD-1234?');
    expect(result.intent).toBe('order_status');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('falls back to unknown intent', () => {
    const result = classifyIntent('Sing me a song about the moon');
    expect(result.intent === 'unknown' || result.confidence === 0).toBe(true);
  });

  it('covers all supported intents', () => {
    const catalog = {
      order_status: [
        'Track order ORD-5566 for me',
        'Give me the status of package ORD-9876',
        'Is order ORD-1122 shipped yet?',
      ],
      return_policy: [
        'What is your return policy for shoes?',
        'Can I exchange this item after two weeks?',
        'How fast are refunds processed?',
      ],
      product_info: [
        'Tell me the product specs of the gaming laptop',
        'Is the red hoodie available in large?',
        'Do you have product details on the wireless earbuds?',
      ],
      account_help: [
        'Help me change the email on my account',
        'How do I update my address details?',
        'Reset my profile phone number please',
      ],
      promotion: [
        'Share active discount codes',
        'Do you have a coupon for the holidays?',
        'Any promo available for first-time buyers?',
      ],
      shipping: [
        'How long is standard shipping to Tripoli?',
        'Which courier handles express delivery?',
        'When will the package arrive at my apartment?',
      ],
      handoff: [
        'Let me speak with a human representative',
        'I want an agent to take over',
        'Please escalate this to support staff',
      ],
      chitchat: [
        'Hi there!',
        'Thanks!',
        'Bye for now',
      ],
      abusive: [
        'You stupid bot',
        'This service sucks',
        'Damn chatbot',
      ],
    };

    Object.entries(catalog).forEach(([intent, utterances]) => {
      utterances.forEach((utterance) => {
        const result = classifyIntent(utterance);
        expect(result.intent).toBe(intent);
      });
    });
  });
});

describe('function registry', () => {
  beforeEach(() => {
    clearAssistantFunctions();
  });

  it('registers and invokes assistant functions', async () => {
    assistantFunction(
      { name: 'echo', description: 'Echo values', parameters: { type: 'object', properties: {} } },
    )(async ({ args }) => ({ echoed: args }));

    const functions = listAssistantFunctions();
    expect(functions).toHaveLength(1);
    expect(functions[0].name).toBe('echo');

    const result = await invokeAssistantFunction('echo', { foo: 'bar' });
    expect(result).toEqual({ echoed: { foo: 'bar' } });
  });

  it('throws on unknown function', async () => {
    await expect(invokeAssistantFunction('missing', {})).rejects.toThrow(/Unknown assistant function/);
  });
});
