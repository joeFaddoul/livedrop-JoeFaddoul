const intentDefinitions = [
  {
    name: 'order_status',
    keywords: ['order', 'status', 'track', 'tracking', 'shipment', 'package'],
    description: 'Questions about tracking an existing order',
  },
  {
    name: 'return_policy',
    keywords: ['return', 'refund', 'exchange', 'warranty'],
    description: 'Questions about returning or refunding items',
  },
  {
    name: 'product_info',
    keywords: ['product', 'spec', 'details', 'size', 'color', 'fit', 'available'],
    description: 'Questions about product details or availability',
  },
  {
    name: 'account_help',
    keywords: ['account', 'email', 'update', 'profile', 'address', 'login'],
    description: 'Account or profile management inquiries',
  },
  {
    name: 'promotion',
    keywords: ['promo', 'discount', 'coupon', 'code', 'deal'],
    description: 'Requests about promotional codes and discounts',
  },
  {
    name: 'shipping',
    keywords: ['shipping', 'delivery', 'courier', 'eta', 'arrive'],
    description: 'Questions about shipping options or timelines',
  },
  {
    name: 'handoff',
    keywords: ['agent', 'representative', 'human', 'support'],
    description: 'Requests to escalate to a human agent',
  },
  {
    name: 'chitchat',
    keywords: ['hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye', 'cool', 'nice'],
    description: 'Small talk, greetings, or casual acknowledgements',
  },
  {
    name: 'abusive',
    keywords: ['damn', 'shit', 'fuck', 'idiot', 'stupid', 'suck', 'bitch'],
    description: 'Profanity or abusive language',
  },
];

export function classifyIntent(message) {
  const text = message.toLowerCase();
  const scores = intentDefinitions.map((intent) => {
    const matches = intent.keywords.reduce(
      (acc, keyword) => (text.includes(keyword) ? acc + 1 : acc),
      0,
    );
    const confidence =
      matches === 0 ? 0 : Math.min(1, matches / Math.max(2, intent.keywords.length / 2));
    return { intent: intent.name, confidence, description: intent.description };
  });

  scores.sort((a, b) => b.confidence - a.confidence);
  const [top] = scores;

  if (!top || top.confidence === 0) {
    return { intent: 'unknown', confidence: 0, description: 'No confident match' };
  }

  return top;
}
