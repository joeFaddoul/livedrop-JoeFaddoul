# LiveDrop API (Week 5)

Express service (plain JavaScript) that connects the storefront to MongoDB Atlas, streams order status updates via Server-Sent Events, and brokers LLM-assisted support via a decorator-style function registry.

## Local Development

```bash
cd apps/api
npm install           # install dependencies
cp .env.example .env  # fill in real values
npm run dev           # start dev server with hot reload
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the API with `nodemon` |
| `npm start` | Run the API with Node |
| `npm run seed` | Seed MongoDB with demo data |
| `npm test` | Execute Vitest suite |

## Manual Prerequisites

- Create a MongoDB Atlas cluster (M0 free tier), whitelist IPs, and grab the connection string.
- Keep your Week 3 Colab notebook running and expose it via ngrok; set `LLM_BASE_URL`.
- Supply a real API key if your `/generate` endpoint requires one (the default sample does not).
