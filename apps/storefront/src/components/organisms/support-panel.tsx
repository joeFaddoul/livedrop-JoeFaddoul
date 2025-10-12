import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { askSupport } from '@/assistant/engine';
import { Button } from '../atoms/button';

type SupportMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type SupportPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const createMessageId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export function SupportPanel({ isOpen, onClose }: SupportPanelProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { id: createMessageId(), role: 'user', content: question }]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await askSupport(question);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: 'assistant',
          content: response.message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={() => setInput('')}>
      <Dialog as="div" className="relative z-40" onClose={onClose} initialFocus={textareaRef}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg bg-slate-950 shadow-xl shadow-brand/20">
                  <div className="flex h-full flex-col border-l border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                      <Dialog.Title className="text-lg font-semibold text-slate-100">
                        Ask Support
                      </Dialog.Title>
                      <Button variant="ghost" onClick={onClose}>
                        Close
                      </Button>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                      {messages.length === 0 ? (
                        <p className="text-sm text-slate-400">
                          Ask about shipping, returns, or order status. I answer with verified policies only.
                        </p>
                      ) : (
                        <ul className="space-y-4">
                          {messages.map((message) => (
                            <li
                              key={message.id}
                              className={message.role === 'user' ? 'text-right' : 'text-left'}
                            >
                              <div
                                className={`inline-block rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                                  message.role === 'user'
                                    ? 'bg-brand text-slate-900'
                                    : 'bg-slate-800 text-slate-100'
                                }`}
                              >
                                {message.content}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <form
                      className="border-t border-slate-800 px-6 py-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void sendMessage();
                      }}
                    >
                      <label htmlFor="support-input" className="sr-only">
                        Ask a question
                      </label>
                      <textarea
                        id="support-input"
                        ref={textareaRef}
                        className="h-24 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40"
                        placeholder="Type your question…"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                      />
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Only official policy answers, no personal data.</span>
                        <Button type="submit" size="sm" isLoading={isLoading} disabled={!input.trim()}>
                          Send
                        </Button>
                      </div>
                    </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
