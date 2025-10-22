import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { askSupport } from '@/assistant/engine';
import { sendAssistantMessage } from '@/lib/api';
import { useCustomerStore } from '@/lib/store';
import { Button } from './atoms/button';
function randomId() {
    return Math.random().toString(36).slice(2);
}
function hasLiveBackend() {
    return Boolean(import.meta.env.VITE_APP_API_BASE);
}
export function SupportAssistant() {
    const profile = useCustomerStore((state) => state.profile);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSend = async () => {
        if (!input.trim())
            return;
        const userMessage = {
            id: randomId(),
            role: 'user',
            content: input.trim(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);
        try {
            let assistantMessage = null;
            if (hasLiveBackend()) {
                const reply = await sendAssistantMessage({
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
        }
        catch (err) {
            try {
                const fallback = await askSupport(userMessage.content);
                const assistantMessage = {
                    id: randomId(),
                    role: 'assistant',
                    content: fallback.message,
                    intent: fallback.refused ? 'fallback_refusal' : 'fallback_policy',
                    citations: fallback.citedQid ? [fallback.citedQid] : undefined,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
            catch (fallbackError) {
                setError(fallbackError instanceof Error
                    ? fallbackError.message
                    : 'Assistant unavailable. Please try again later.');
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex h-full flex-col", children: [_jsx("div", { className: "flex-1 space-y-4 overflow-y-auto px-1 py-2", children: messages.length === 0 ? (_jsx("p", { className: "text-sm text-slate-400", children: "Ask about returns, order status, payments, or promotions. The assistant cites official Shoplite policies and uses your saved email to personalize status updates." })) : (messages.map((message) => (_jsxs("article", { className: `flex flex-col gap-2 ${message.role === 'user' ? 'items-end text-right' : 'items-start text-left'}`, children: [_jsx("div", { className: `max-w-[90%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${message.role === 'user'
                                ? 'bg-brand text-slate-900'
                                : 'bg-slate-800 text-slate-100'}`, children: message.content }), message.role === 'assistant' && (_jsxs("div", { className: "max-w-[90%] space-y-1 text-xs text-slate-400", children: [message.intent && (_jsxs("p", { children: [_jsx("span", { className: "font-semibold text-slate-300", children: "Intent:" }), " ", message.intent] })), message.citations && message.citations.length > 0 && (_jsxs("p", { children: [_jsx("span", { className: "font-semibold text-slate-300", children: "Citations:" }), ' ', message.citations.join(', ')] })), message.citationReport && message.citationReport.invalidCitations.length > 0 && (_jsxs("p", { className: "text-amber-300", children: ["Invalid citations: ", message.citationReport.invalidCitations.join(', ')] })), message.citationReport && message.citationReport.invalidCitations.length === 0 &&
                                    message.citationReport.validCitations.length > 0 && (_jsx("p", { className: "text-emerald-300", children: "Citations validated." })), message.invocations && message.invocations.length > 0 && (_jsxs("details", { className: "rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2", children: [_jsx("summary", { className: "cursor-pointer text-slate-300", children: "Function log" }), _jsx("ul", { className: "mt-2 space-y-2", children: message.invocations.map((invocation) => (_jsxs("li", { className: "text-left", children: [_jsx("p", { className: "font-semibold text-slate-200", children: invocation.name }), _jsx("pre", { className: "mt-1 overflow-x-auto rounded bg-slate-950 px-2 py-1 text-[11px] text-slate-400", children: JSON.stringify(invocation.args, null, 2) })] }, `${message.id}-${invocation.name}`))) })] }))] }))] }, message.id)))) }), error && (_jsx("p", { className: "mb-2 rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200", children: error })), _jsxs("form", { className: "flex flex-col gap-3 border-t border-slate-800 pt-3", onSubmit: (event) => {
                    event.preventDefault();
                    void handleSend();
                }, children: [_jsx("label", { htmlFor: "support-input", className: "sr-only", children: "Ask a question" }), _jsx("textarea", { id: "support-input", className: "h-24 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40", placeholder: "Type your question...", value: input, onChange: (event) => setInput(event.target.value) }), _jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500", children: [_jsx("span", { children: profile
                                    ? `Responding as ${profile.email}`
                                    : 'Save your email above so I can personalize status updates.' }), _jsx(Button, { type: "submit", size: "sm", isLoading: isLoading, disabled: !input.trim(), children: "Send" })] }), !hasLiveBackend() && (_jsx("p", { className: "text-xs text-slate-500", children: "Live assistant unavailable. Falling back to local policy matcher." }))] })] }));
}
