import groundTruth from './ground-truth.json';
import type { SupportQA } from '@/lib/types';
import { getOrderStatus } from '@/lib/api';
import { maskId } from '@/lib/format';

const ORDER_ID_REGEX = /\b[A-Z0-9-]{10,}\b/g;
const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'of',
  'to',
  'is',
  'in',
  'for',
  'with',
  'how',
  'what',
  'when',
  'do',
  'you',
  'i',
  'my',
  'can',
  'are',
]);

export type SupportEngineResult = {
  message: string;
  citedQid?: string;
  refused: boolean;
};

function tokenize(input: string) {
  return Array.from(
    new Set(
      input
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .filter((token) => token.length > 1 && !STOPWORDS.has(token)),
    ),
  );
}

function scoreQA(questionTokens: string[], qa: SupportQA) {
  if (questionTokens.length === 0) return 0;
  const qaTokens = tokenize(`${qa.question} ${qa.answer}`);
  if (qaTokens.length === 0) return 0;
  const overlap = questionTokens.filter((token) => qaTokens.includes(token));
  if (overlap.length === 0) return 0;
  if (questionTokens.length > 2 && overlap.length < 2) {
    return 0;
  }
  const precision = overlap.length / qaTokens.length;
  const recall = overlap.length / questionTokens.length;
  return (2 * precision * recall) / (precision + recall);
}

function extractOrderIds(message: string) {
  return message.match(ORDER_ID_REGEX) ?? [];
}

async function getOrderSummary(orderIds: string[]) {
  const summaries = [];
  for (const rawId of orderIds) {
    const status = await getOrderStatus(rawId);
    if (status) {
      const eta = status.eta ? new Date(status.eta).toLocaleDateString() : undefined;
      const maskedId = maskId(rawId);
      const parts = [`Order ${maskedId} is currently ${status.status}.`];
      if (status.carrier && (status.status === 'Shipped' || status.status === 'Delivered')) {
        parts.push(`Carrier: ${status.carrier}${eta ? `, ETA ${eta}` : ''}.`);
      }
      summaries.push(parts.join(' '));
    }
  }
  return summaries;
}

function rankAnswers(question: string) {
  const tokens = tokenize(question);
  const scored = groundTruth.map((qa) => ({
    qa,
    score: scoreQA(tokens, qa),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function buildRefusal(question: string) {
  const polite = [
    "I'm sorry, but I don't have enough verified info to answer that. Please reach out to a human specialist.",
    'I’m not able to help with that request. A human teammate can follow up shortly.',
  ];
  const index = question.length % polite.length;
  return polite[index];
}

async function useLocalMatcher(question: string): Promise<SupportEngineResult> {
  const rankings = rankAnswers(question);
  const [top] = rankings;
  const orderIds = extractOrderIds(question);
  const orderSummaries = await getOrderSummary(orderIds);

  const MIN_CONFIDENCE = 0.05;

  if (!top || top.score < MIN_CONFIDENCE) {
    return {
      message: buildRefusal(question),
      refused: true,
    };
  }

  const answerSegments = [top.qa.answer.trim(), `[${top.qa.qid}]`];

  if (orderSummaries.length > 0) {
    answerSegments.unshift(orderSummaries.join(' '));
  }

  return {
    message: answerSegments.join(' '),
    citedQid: top.qa.qid,
    refused: false,
  };
}

export async function askSupport(question: string): Promise<SupportEngineResult> {
  if (!question.trim()) {
    return {
      message: buildRefusal(question),
      refused: true,
    };
  }

  // Local matcher is the default path. We keep an OpenAI hook placeholder for future use.
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (apiKey && apiKey.length > 0) {
    // In restricted environments we fall back to local matcher while still supporting future expansion.
    // eslint-disable-next-line no-console
    console.debug('OPENAI_API_KEY provided; using local matcher fallback to respect offline mode.');
  }

  return useLocalMatcher(question);
}
