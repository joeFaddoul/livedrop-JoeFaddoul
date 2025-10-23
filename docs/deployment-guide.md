# Deployment Guide

Use this guide to deploy LiveDrop for real-world use. It assumes familiarity with Node.js tooling and access to the third-party services referenced below.

---

## 1. Prerequisites

- GitHub repository access with build-ready code.
- Node.js 18+ and npm installed locally (for building and smoke tests).
- Accounts for: MongoDB Atlas, a Node-compatible hosting provider (Render, Railway, Fly.io, etc.), and Vercel (or another static hosting provider) for the storefront.
- Optional: Access to an internal or partner LLM API for the assistant features.

---

## 2. Environment Configuration

1. Copy each example environment file in the repo and provide real values:
   - `apps/api/.env.example -> apps/api/.env`
   - `apps/storefront/.env.example -> apps/storefront/.env`
2. Required API variables:
   ```bash
   PORT=4000
   MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority"
   ALLOWED_ORIGINS="https://<your-storefront-domain>,http://localhost:5173"
   LLM_BASE_URL="https://<llm-service>/generate" # optional but required for assistant features
   LLM_API_KEY="<token-if-required>"
   ```
3. Storefront variables:
   ```
   VITE_APP_API_BASE=https://<your-api-host>
   OPENAI_API_KEY=<optional>
   ```
   > Keep local `.env` files out of source control.

---

## 3. Provision MongoDB Atlas

1. Create an **M0 Free Tier** (or higher) cluster.
2. Add a database user with read/write to the desired database.
3. Allow connections from application hosts. For testing, `0.0.0.0/0` is acceptable; for production, restrict to specific IPs or VPC peering.
4. Record the connection string for `MONGODB_URI`.
5. Seed the database once from your local machine:
   ```bash
   cd apps/api
   npm install
   npm run seed
   ```
   This preloads sample customers, orders, and products that the storefront expects.

---

## 4. Deploy the Backend API

1. Push your code to a Git repository accessible by the hosting provider.
2. Create a new service pointing to `apps/api`. On Render/Railway, set:
   - Build command: `npm install`
   - Start command: `npm start`
   - Working directory: `apps/api`
3. Configure the environment variables listed in section 2.
4. Enable auto-deploy on main (or your chosen branch).
5. After deployment, verify the health endpoint:
   ```bash
   curl https://<api-host>/health
   ```
6. If using an external LLM service, confirm the `/api/assistant/chat` endpoint returns responses.

---

## 5. Deploy the Storefront

1. Ensure the storefront `.env` file is populated with production URLs.
2. Import the repository into Vercel (or your preferred static host).
3. Configure:
   - Project root: `apps/storefront`
   - Framework preset: `Vite`
   - Build command: `npm install && npm run build`
   - Output directory: `dist`
   - Environment variables: `VITE_APP_API_BASE`, `OPENAI_API_KEY` (optional), `NODE_VERSION=18`
4. Trigger a deploy and verify the storefront loads against the deployed API.
5. Check key flows: placing an order, viewing order history, admin dashboards, and the assistant sidebar.

---

## 6. LLM Service Options

LiveDrop can integrate with any endpoint compatible with the `/generate` contract:

```http
POST /generate
{
  "prompt": "...",
  "max_tokens": 300
}
```

- If you operate your own model, host it behind HTTPS and secure it with an API key.
- Update `LLM_BASE_URL` and `LLM_API_KEY` in both local and hosted environments.
- When the LLM is unavailable, the assistant UI will surface fallback messaging; monitor logs for repeated failures.

---

## 7. Local Verification Checklist

```bash
# API
cd apps/api
npm install
npm run dev

# Storefront
cd ../storefront
npm install
npm run dev
```

Smoke tests to run before every release:
- `npm run test` in `apps/api`
- `npm run test` in `apps/storefront`
- Manual API checks: `/api/customers`, `/api/orders/:id`, `/api/assistant/chat`, and `/api/sse/orders/<orderId>`
- Manual storefront journey: place a new order and confirm live tracking plus admin analytics updates.

---

## 8. Ongoing Operations

- Update environment variables in hosting dashboards whenever the database URI, API keys, or LLM endpoints change.
- Rerun `npm run seed` after refreshing Atlas or promoting a new database.
- Monitor logs and metrics from your hosting providers; set alerts on elevated error rates or response times.
- Keep Colab/ngrok-based endpoints for development only. For production, prefer a managed, persistent hosting solution.

Once these steps are complete, LiveDrop is live and ready for customers.
