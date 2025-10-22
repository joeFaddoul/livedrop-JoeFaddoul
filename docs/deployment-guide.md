# Deployment Guide (Week 5 MVP)

This guide walks through deploying the complete LiveDrop MVP: MongoDB Atlas, the Express API, Vercel storefront, and the Week 3 Colab LLM with the new `/generate` endpoint.

---

## 1. MongoDB Atlas (Database)

1. Sign up at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create an **M0 Free Tier** cluster.
2. In the Atlas UI:
   - Create a database user with read/write access.
   - Whitelist `0.0.0.0/0` under **Network Access** so the API and local dev can connect.
   - Obtain the connection string (`mongodb+srv://...`).
3. Copy `apps/api/.env.example` to `.env` and set:
   ```bash
   MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority"
   ALLOWED_ORIGINS="http://localhost:5173,https://<your-vercel-app>"
   LLM_BASE_URL="https://<your-ngrok-subdomain>.ngrok.io"
   ```
4. Seed the database once locally:
   ```bash
   cd apps/api
   npm install
   npm run seed
   ```
   > Seeds ~12 customers, 30 products, and 18 orders with staged statuses.

---

## 2. Backend API (Render.com or Railway)

1. Push the repo to GitHub if you haven’t already.
2. Create a new **Web Service** on Render (or Railway) pointing to `apps/api`.
3. Set the following environment variables in the dashboard:
   - `PORT=4000`
   - `MONGODB_URI=<Atlas connection string>`
   - `ALLOWED_ORIGINS=https://<your-vercel-app>,http://localhost:5173`
   - `LLM_BASE_URL=https://<your-ngrok-subdomain>.ngrok.io`
   - `LLM_API_KEY=<if your Colab endpoint expects one, else leave empty>`
4. Build & run command:
   ```bash
   npm install
   npm start
   ```
   Render automatically runs `npm install` and starts `npm start`.
5. After deploy, verify health:
   ```bash
   curl https://<api-host>/health
   ```

---

## 3. Frontend Storefront (Vercel)

1. From the repo root, ensure `apps/storefront/.env.example` exists. Create `.env` with:
   ```
   VITE_APP_API_BASE=https://<your-api-host>
   OPENAI_API_KEY=<optional>
   ```
2. Push latest changes to GitHub.
3. In Vercel:
   - Import the repository.
   - Set project root to `apps/storefront`.
   - Framework: `Vite`.
   - Environment variables: `VITE_APP_API_BASE`, `OPENAI_API_KEY` (optional), `NODE_VERSION=18`.
4. Deploy. After build, confirm storefront loads and the Ask Support panel hits your API.

---

## 4. LLM Endpoint (Week 3 Colab)

1. Open `notebooks/llm_deployment.ipynb` in Google Colab.
2. Add a new cell near the Flask routes:
   ```python
   @app.route('/generate', methods=['POST'])
   def generate():
       payload = request.get_json(force=True)
       prompt = payload.get("prompt", "")
       max_tokens = int(payload.get("max_tokens", 300))
       if not prompt:
           return jsonify({"error": "prompt required"}), 400

       output = model.generate(prompt, max_tokens=max_tokens)
       return jsonify({"text": output})
   ```
3. Run all cells, input your ngrok token when prompted, and copy the public HTTPS URL.
4. Update `LLM_BASE_URL` in both local `.env` (for testing) and the deployed API env vars.
5. Keep the notebook running during demos; restart ngrok/Colab if the URL changes.

---

## 5. Local Development Recap

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

Set corresponding `.env` files before running.

---

## 6. Smoke Tests Before Submission

- `npm run test` inside `apps/api` (runs Vitest suite plus `/tests`).
- `npm run test` inside `apps/storefront`.
- Manual checks:
  - `/api/customers?email=demo@example.com`
  - `/api/orders/:id`
  - `/api/assistant/chat` with an order question
  - SSE stream: open `/api/sse/orders/<orderId>` in browser and place a new order.
  - Frontend order placement + live tracking + admin dashboard metrics.

---

## Manual Follow-Ups

- Replace placeholder demo email/ids in documentation with real seeded values.
- Re-run `npm run seed` whenever you refresh the Atlas cluster.
- Each time ngrok restarts, update `LLM_BASE_URL` in the backend environment.
- Capture short demo videos/screenshots if required by your instructor.
