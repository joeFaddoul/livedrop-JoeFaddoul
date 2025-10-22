import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { lookupCustomer } from '@/lib/api';
import { useCustomerStore } from '@/lib/store';
import { Button } from './atoms/button';
import { TextInput } from './atoms/text-input';
export function UserLogin({ onAuthenticated }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState(null);
    const setCustomer = useCustomerStore((state) => state.setCustomer);
    const clearCustomer = useCustomerStore((state) => state.clearCustomer);
    const profile = useCustomerStore((state) => state.profile);
    const recentOrders = useCustomerStore((state) => state.recentOrders);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email)
            return;
        setStatus('loading');
        setErrorMessage(null);
        try {
            const response = await lookupCustomer(email);
            setCustomer(response.customer, response.recentOrders);
            setStatus('success');
            onAuthenticated?.(response.customer);
        }
        catch (error) {
            clearCustomer();
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Unable to find that email. Please try again.');
        }
    };
    return (_jsxs("section", { className: "rounded-2xl border border-slate-800 bg-slate-900/60 p-4", children: [_jsxs("header", { className: "mb-3 flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold text-slate-100", children: "Identify yourself" }), _jsx("p", { className: "text-sm text-slate-400", children: "Enter the email we have on file so orders and support responses stay personalized." })] }), profile && (_jsx("span", { className: "rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200", children: profile.email }))] }), _jsxs("form", { className: "flex flex-col gap-3", onSubmit: handleSubmit, children: [_jsx(TextInput, { label: "Email address", type: "email", placeholder: "you@example.com", value: email, onChange: (event) => setEmail(event.target.value), required: true, hint: "Used to fetch customer profile and recent orders." }), status === 'error' && errorMessage && (_jsx("p", { className: "rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200", children: errorMessage })), status === 'success' && profile && (_jsxs("p", { className: "rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200", children: ["Welcome back, ", profile.name.split(' ')[0], "! Recent orders loaded."] })), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { type: "submit", isLoading: status === 'loading', disabled: !email, children: "Save identity" }), profile && (_jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                    clearCustomer();
                                    setEmail('');
                                    setStatus('idle');
                                }, children: "Clear" }))] })] }), profile && recentOrders.length > 0 && (_jsxs("div", { className: "mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-100", children: "Recent orders" }), _jsx("ul", { className: "mt-2 space-y-2", children: recentOrders.map((order) => (_jsxs("li", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-mono text-xs text-slate-500", children: order.orderId }), _jsx("span", { className: "text-slate-200", children: order.status })] }, order.orderId))) })] }))] }));
}
