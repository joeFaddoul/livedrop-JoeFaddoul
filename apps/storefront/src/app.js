import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './lib/router';
export default function App() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "flex h-screen items-center justify-center bg-slate-950 text-slate-100", children: _jsx("span", { className: "animate-pulse text-lg font-semibold", children: "Loading storefront\u2026" }) }), children: _jsx(RouterProvider, { router: router }) }));
}
