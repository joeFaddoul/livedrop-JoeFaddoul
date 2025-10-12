import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { askSupport } from '@/assistant/engine';
import { Button } from '../atoms/button';
const createMessageId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
};
export function SupportPanel({ isOpen, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef(null);
    const sendMessage = async () => {
        if (!input.trim())
            return;
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
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Transition.Root, { show: isOpen, as: Fragment, afterLeave: () => setInput(''), children: _jsxs(Dialog, { as: "div", className: "relative z-40", onClose: onClose, initialFocus: textareaRef, children: [_jsx(Transition.Child, { as: Fragment, enter: "ease-out duration-200", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-150", leaveFrom: "opacity-100", leaveTo: "opacity-0", children: _jsx("div", { className: "fixed inset-0 bg-slate-950/70 backdrop-blur-sm", "aria-hidden": "true" }) }), _jsx("div", { className: "fixed inset-0 overflow-hidden", children: _jsx("div", { className: "absolute inset-0 overflow-hidden", children: _jsx("div", { className: "pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10", children: _jsx(Transition.Child, { as: Fragment, enter: "transform transition ease-out duration-300", enterFrom: "translate-x-full", enterTo: "translate-x-0", leave: "transform transition ease-in duration-200", leaveFrom: "translate-x-0", leaveTo: "translate-x-full", children: _jsx(Dialog.Panel, { className: "pointer-events-auto w-screen max-w-lg bg-slate-950 shadow-xl shadow-brand/20", children: _jsxs("div", { className: "flex h-full flex-col border-l border-slate-800", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-slate-800 px-6 py-4", children: [_jsx(Dialog.Title, { className: "text-lg font-semibold text-slate-100", children: "Ask Support" }), _jsx(Button, { variant: "ghost", onClick: onClose, children: "Close" })] }), _jsx("div", { className: "flex-1 space-y-4 overflow-y-auto px-6 py-4", children: messages.length === 0 ? (_jsx("p", { className: "text-sm text-slate-400", children: "Ask about shipping, returns, or order status. I answer with verified policies only." })) : (_jsx("ul", { className: "space-y-4", children: messages.map((message) => (_jsx("li", { className: message.role === 'user' ? 'text-right' : 'text-left', children: _jsx("div", { className: `inline-block rounded-2xl px-4 py-2 text-sm leading-relaxed ${message.role === 'user'
                                                                ? 'bg-brand text-slate-900'
                                                                : 'bg-slate-800 text-slate-100'}`, children: message.content }) }, message.id))) })) }), _jsxs("form", { className: "border-t border-slate-800 px-6 py-4", onSubmit: (event) => {
                                                    event.preventDefault();
                                                    void sendMessage();
                                                }, children: [_jsx("label", { htmlFor: "support-input", className: "sr-only", children: "Ask a question" }), _jsx("textarea", { id: "support-input", ref: textareaRef, className: "h-24 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/40", placeholder: "Type your question\u2026", value: input, onChange: (event) => setInput(event.target.value) }), _jsxs("div", { className: "mt-3 flex items-center justify-between text-xs text-slate-500", children: [_jsx("span", { children: "Only official policy answers, no personal data." }), _jsx(Button, { type: "submit", size: "sm", isLoading: isLoading, disabled: !input.trim(), children: "Send" })] })] })] }) }) }) }) }) })] }) }));
}
