# Storefront v1

Storefront v1 is a lightweight reference implementation that exercises the full catalog -> product -> cart -> checkout stub -> order status journey, supported by an Ask Support assistant that answers from curated ground truth. For the Week 5 MVP the app now talks to the real Express API (customers, orders, analytics), listens to SSE order updates, and relays support questions to the `/api/assistant` endpoint.

## Prerequisites

- Node.js 18+
- npm 9+ (a `package-lock.json` is committed for reproducible installs)

## Getting Started

```bash
cp .env.example .env   # set VITE_APP_API_BASE + optional OPENAI_API_KEY
npm install            # install dependencies
npm run dev            # start the Vite development server
```

The development server runs on <http://localhost:5173>. Storybook runs on <http://localhost:6006> via `npm run storybook`. When `VITE_APP_API_BASE` is not set the app falls back to mock catalog data, but customer lookup, SSE tracking, and the support assistant will prompt you to configure the live API.

### Available commands/scripts

```bash
npm install
npm run dev
npm run build
npm run test
npm run storybook 
```

## Project Structure

```
apps/storefront/
  src/
    app.tsx             # top-level routes & layout
    main.tsx            # React entry point
    pages/              # route-level views
    components/         # Atomic design (atoms + molecules + organisms + templates)
    lib/                # shared utilities, state, api
    assistant/          # support engine + artifacts
  public/               # static assets (logo, mock catalog)
  component-prompts.md  # prompt-to-component log
```

## Testing & Accessibility

- All components include colocated Vitest + Testing Library tests.
- Storybook stories provide interactive documentation and accessibility regression hooks.
- Keyboard, ARIA, and responsive behavior are validated via tests where practical; remaining scenarios are covered in Storybook docs and in-code comments.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_APP_API_BASE` | Base URL of the deployed Express API (e.g., `https://livedrop-api.onrender.com`). Required for live customer lookup, order placement, SSE tracking, admin dashboard, and the intelligent assistant. |
| `OPENAI_API_KEY` | Optional: forwarded to the assistant for live model calls (the API handles gating). |

Copy `.env.example` to `.env` and fill the values before running locally or deploying to Vercel.

## Performance Notes

- Tailwind-powered utility classes ensure a consistent design system with minimal CSS output.
- Code splitting occurs at the router level; heavy modules (support assistant, cart drawer) are loaded lazily.
- SSE connections are scoped per order and cleaned up automatically to avoid leaking browser resources.
- Image payloads use `loading="lazy"` attributes and placeholder SVGs.
