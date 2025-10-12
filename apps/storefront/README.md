# Storefront v1

Storefront v1 is a lightweight reference implementation that exercises the full catalog -> product -> cart -> checkout stub -> order status journey, supported by an Ask Support assistant that answers from curated ground truth.

## Prerequisites

- Node.js 18+
- npm 9+ (a `package-lock.json` is committed for reproducible installs)

## Getting Started

```bash
npm install            # install dependencies
npm run dev            # start the Vite development server
```

The development server runs on <http://localhost:5173>. Storybook runs on <http://localhost:6006> via `npm run storybook`.

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

The assistant can optionally call a live OpenAI model if `OPENAI_API_KEY` is provided. Copy `.env.example` to `.env` and set the key. Without the key, the assistant falls back to keyword matching over curated ground truth.

## Performance Notes

- Tailwind-powered utility classes ensure a consistent design system with minimal CSS output.
- Code splitting occurs at the router level; heavy modules (support engine, cart drawer) are loaded lazily.
- Image payloads use `loading="lazy"` attributes and placeholder SVGs.