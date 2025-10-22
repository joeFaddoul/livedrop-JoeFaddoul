import { useState } from 'react';

import { askSupport } from '@/assistant/engine';
import { sendAssistantMessage } from '@/lib/api';
import { useCustomerStore } from '@/lib/store';
import type { AssistantInvocation, AssistantReply } from '@/lib/types';
import { Button } from './atoms/button';

type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  citations?: string[];
  invocations?: AssistantInvocation[];
  citationReport?: AssistantReply['citationReport'];
};

function randomId() {
  return Math.random().toString(36).slice(2);
}

function hasLiveBackend() {
  return Boolean(import.meta.env.VITE_APP_API_BASE);
}

export function SupportAssistant() {
  const profile = useCustomerStore((state) => state.profile);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ConversationMessage = {
      id: randomId(),
      role: 'user',
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      let assistantMessage: ConversationMessage | null = null;

      if (hasLiveBackend()) {
        const reply: AssistantReply = await sendAssistantMessage({
          message: userMessage.content,
          customerEmail: profile?.email,
        });

        assistantMessage = {
          id: randomId(),
          role: 'assistant',
          content: reply.answer,
          intent: reply.intent,
          citations: reply.citations,
          invocations: reply.invocations,
          citationReport: reply.citationReport,
        };
      }

      if (!assistantMessage) {
        const fallback = await askSupport(userMessage.content);
        assistantMessage = {
          id: randomId(),
          role: 'assistant',
          content: fallback.message,
          intent: fallback.refused ? 'fallback_refusal' : 'fallback_policy',
          citations: fallback.citedQid ? [fallback.citedQid] : undefined,
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      try {
        const fallback = await askSupport(userMessage.content);
        const assistantMessage: ConversationMessage = {
          id: randomId(),
          role: 'assistant',
          content: fallback.message,
          intent: fallback.refused ? 'fallback_refusal' : 'fallback_policy',
          citations: fallback.citedQid ? [fallback.citedQid] : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (fallbackError) {
        setError(
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Assistant unavailable. Please try again later.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-1 py-2">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">
            Ask about returns, order status, payments, or promotions. The assistant cites official Shoplite policies
            and uses your saved email to personalize status updates.
          </p>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`flex flex-col gap-2 ${
                message.role === 'user' ? 'items-end text-right' : 'items-start text-left'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-brand text-slate-900'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                {message.content}
              </div>
              {message.role === 'assistant' && (
                <div className="max-w-[90%] space-y-1 text-xs text-slate-400">
                  {message.intent && (
                    <p>
                      <span className="font-semibold text-slate-300">Intent:</span> {message.intent}
                    </p>
                  )}
                  {message.citations && message.citations.length > 0 && (
                    <p>
                      <span className="font-semibold text-slate-300">Citations:</span>{' '}
                      {message.citations.join(', ')}
                    </p>
                  )}
                  {message.citationReport && message.citationReport.invalidCitations.length > 0 && (
                    <p className="text-amber-300">
                      Invalid citations: {message.citationReport.invalidCitations.join(', ')}
                    </p>
                  )}
                  {message.citationReport && message.citationReport.invalidCitations.length === 0 &&
                    message.citationReport.validCitations.length > 0 && (
                      <p className="text-emerald-300">Citations validated.</p>
                    )}
                  {message.invocations && message.invocations.length > 0 && (
                    <details className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
                      <summary className="cursor-pointer text-slate-300">Function log</summary>
                      <ul className="mt-2 space-y-2">
                        {message.invocations.map((invocation) => (
                          <li key={`${message.id}-${invocation.name}`} className="text-left">
                            <p className="font-semibold text-slate-200">{invocation.name}</p>
                            <pre className="mt-1 overflow-x-auto rounded bg-slate-950 px-2 py-1 text-[11px] text-slate-400">
                              {JSON.stringify(invocation.args, null, 2)}
                            </pre>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>
      {error && (
        <p className="mb-2 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200">{error}</p>
      )}
      <form
        className="flex flex-col gap-3 border-t border-slate-800 pt-3"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <label htmlFor="support-input" className="sr-only">
          Ask a question
        </label>
        <textarea
          id="support-input"
          className="h-24 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40"
          placeholder="Type your question..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {profile
              ? `Responding as ${profile.email}`
              : 'Save your email above so I can personalize status updates.'}
          </span>
          <Button type="submit" size="sm" isLoading={isLoading} disabled={!input.trim()}>
            Send
          </Button>
        </div>
        {!hasLiveBackend() && (
          <p className="text-xs text-slate-500">
            Live assistant unavailable. Falling back to local policy matcher.
          </p>
        )}
      </form>
    </div>
  );
}
