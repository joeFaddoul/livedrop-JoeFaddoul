# Shoplite

Live instances:
- Storefront (Vercel): https://livedrop-joe-faddoul.vercel.app/
- API (Render): https://livedrop-joefaddoul.onrender.com/
  
Shoplite is a flash-sale and creator follow platform that lets customers track limited inventory drops in real time while brands manage stock, orders, and engagement signals.


## Monorepo Layout

- `apps/api` Express API, queueless job runners, and MongoDB data access
- `apps/storefront` Vite storefront with customer and admin flows
- `docs` Product briefs, assistant prompts, and deployment guides
- `tests` Cross-app integration and contract tests
- `scripts` Tooling for seeding and maintenance tasks

## Key Features

- Real-time stock visibility with server-sent events for order progression
- Assistant endpoint that blends retrieval and LLM powered responses
- Idempotent ordering with atomic stock updates in MongoDB
- Admin dashboards summarizing order velocity and funnel analytics
- Seeded catalog with demo creators, products, and staged orders

## Prerequisites

- Node.js 18 and npm 9+
- MongoDB Atlas cluster (M0 or higher)
- Git and a terminal with basic UNIX tooling

## Quick Start

```bash
# install dependencies for both workspaces
npm install --workspaces

# copy environment templates
cp apps/api/.env.example apps/api/.env
cp apps/storefront/.env.example apps/storefront/.env

# seed demo data (customers, products, orders)
cd apps/api
npm run seed
```

Update both `.env` files with your Atlas connection string, allowed origins, and optional LLM settings before running locally.

## Test Data

- **Primary customer:** `demo@example.com`
- **How to verify:**
  - `GET /api/customers?email=demo@example.com` returns the profile and five recent orders.
  - Use the response's `customer._id` with `GET /api/customers/<customerId>/orders` to list the complete order history.
  - The storefront identity form accepts `demo@example.com` to hydrate the customer dashboard and support assistant.
- The seed script creates additional customers and thirty products; rerun `npm run seed` any time you refresh the Atlas cluster.

## Running the Apps

```bash
# API (Express + SSE)
cd apps/api
npm run dev

# Storefront (Vite + React)
cd ../storefront
npm run dev
```

The storefront expects `VITE_APP_API_BASE` to point at the API origin (for local dev: `http://localhost:4000`).

## Running Tests

```bash
cd apps/api
npm run test

cd ../storefront
npm run test
```

The root `tests` directory contains shared integration suites. To execute them:

```bash
npm run test --workspaces -- --runInBand
```

## API Surface Highlights

- `GET /health` service readiness probe
- `GET /api/customers?email=...` customer lookup with recent orders
- `GET /api/customers/:customerId/orders` full customer order history
- `POST /api/orders` creates an order (uses `Idempotency-Key` header)
- `GET /api/assistant/chat` assistant responses backed by the LLM proxy
- `GET /api/sse/orders/:orderId` server-sent events stream for order status

Refer to inline JSDoc comments inside `apps/api/src/routes` for request and response schemas.

## Deployment

The production deployment checklist, including hosting suggestions for the API, storefront, and LLM endpoint, lives in `docs/deployment-guide.md`.

## Troubleshooting

- **Mongo connection errors:** confirm the Atlas IP access list allows your current IP and that `MONGODB_URI` is correct.
- **CORS failures:** update `ALLOWED_ORIGINS` in the API `.env` to include the storefront URL.
- **Assistant timeouts:** ensure the `LLM_BASE_URL` is reachable and the upstream model is running.

Shoplite is built for fast iteration; run `npm run lint` or `npm run format` within each workspace to keep commits clean.


