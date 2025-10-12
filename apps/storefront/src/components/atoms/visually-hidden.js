import { jsx as _jsx } from "react/jsx-runtime";
export function VisuallyHidden({ children }) {
    return (_jsx("span", { className: "sr-only", children: children }));
}
