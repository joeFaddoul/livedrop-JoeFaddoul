# AI Capability Map

| Capability | Intent (user) | Inputs (this sprint) | Risk 1–5 (tag) | p95 ms | Est. cost/action | Fallback | Selected |
|---|---|---|---|---:|---:|---|:---:|
| AI Typeahead Search | Find products quickly with smarter suggestions | SKU catalog, query logs | 2 | 300 | $0.01 | Keyword search | ✓ |
| Support Assistant | Get instant answers to FAQs & order status | FAQ markdown, order-status API | 3 | 1200 | $0.05 | Human agent escalation | ✓ |
| Personalized Recommendations | Discover relevant products based on history | Session history, SKU metadata | 4 | 800 | $0.03 | Popular items list |   |
| FAQ Summarizer | Summarize long FAQ/policy docs | FAQ markdown | 2 | 500 | $0.02 | Full FAQ page |   |
| Smart Product Tagging | Auto-generate tags for new SKUs | Product titles & descriptions | 3 | 1000 | $0.04 | Manual tagging |   |
| Review Sentiment Analyzer | Summarize customer reviews into pros/cons | Product reviews | 4 | 900 | $0.03 | Show raw reviews |   |

---

## Why these two

We selected Typeahead Search and Support Assistant as they directly correlate with business KPIs: faster product discovery increases conversion rate, and automated FAQ management decreases support contact rate. Both can be built on existing assets (SKU catalog, FAQ markdown, order API) with integration risk kept to a bare minimum. Latency expectations are achievable through caching, and fallback behaviors (keyword search, human escalation) ensure it is dependable
