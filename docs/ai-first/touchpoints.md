## Touchpoint 1: AI Typeahead Search

### Problem statement
Users will abandon search if they cannot find products within a certain timeframe. AI-powered typeahead can predict intent and suggest related SKUs in real-time with a latency budget of ≤300ms.
### Happy path
1. User types in the search bar.  
2. Query fragment sent to backend.  
3. Backend checks cache for previous queries.  
4. On cache miss, AI model generates SKU suggestions.  
5. Suggestions ranked and filtered by availability.  
6. Suggestions displayed instantly in dropdown.  
7. User clicks on suggested product.  
8. Product page loads, continuing the shopping flow.  

### Grounding & guardrails
- Source of truth: SKU catalog, query logs.  
- Retrieval scope: only product metadata.  
- Max context: 50 characters per query.  
- Refuse unrelated or out-of-scope queries.  

### Human-in-the-loop
- Not applicable in real-time.  
- Offline: weekly QA review of search logs by product team.  

### Latency budget
- Cache lookup: 50ms  
- Retrieval + pre-processing: 100ms  
- Model inference: 100ms  
- Ranking/filtering: 50ms  
**Total ≤ 300ms**  

### Error & fallback behavior
- On model error → fall back to keyword search.  
- If cache fails → serve prefix matches from SKU database.  

### PII handling
- Only search queries processed; no user PII leaves the app.  
- Logs anonymized, truncated at 50 characters.  

### Success metrics
- Product metric: Query → click-through rate (CTR).  
- Product metric: Search success rate (% of sessions with ≥1 click).  
- Business metric: Conversion uplift (orders / sessions).  

### Feasibility note
SKU and query data already exist. Can use GPT-4o-mini or Llama 3.1 8B via OpenRouter. Next step: prototype endpoint with caching and measure latency against the 300ms budget.


---

## Touchpoint 2: Support Assistant

### Problem statement
High user volume ask about order status and FAQ. High human support load and delayed response time. An AI assistant can respond to common requests (order tracking, policy queries) instantly in 1200ms, escalating as needed.
### Happy path
1. User opens support chat.  
2. User types a question (e.g., “Where’s my order?”).  
3. Assistant retrieves info from FAQ or order API.  
4. AI model drafts a response.  
5. Guardrails check for accuracy & scope.  
6. If confident, assistant replies.  
7. If low confidence, escalate to human.  
8. User gets AI answer or agent handoff.  

### Grounding & guardrails
- Source of truth: FAQ markdown, order-status API.  
- Retrieval scope: support and order queries only.  
- Max context: 1,000 tokens.  
- Refuse out-of-scope queries (e.g., product search).  

### Human-in-the-loop
- Escalation triggers: model confidence <70% or unsupported request.  
- Escalation UI: “Hand off to agent” button.  
- SLA: agent responds within 5 minutes.  

### Latency budget
- Retrieval: 200ms  
- Model inference: 800ms  
- Guardrail checks: 100ms  
- Response rendering: 100ms  
**Total ≤ 1200ms**  

### Error & fallback behavior
- On model error → escalate directly to human agent.  
- On API error → retry once, then escalate.  

### PII handling
- Order IDs only; all sensitive user data redacted.  
- Logs stored without personal identifiers.  

### Success metrics
- Product metric: % of chats resolved without escalation.  
- Product metric: Average first-response time.  
- Business metric: Cost per resolved ticket.  

### Feasibility note
FAQ and order API already exist. GPT-4o-mini is suitable for accuracy. Next step: prototype retrieval wrapper combining FAQ + API, then run limited pilot with real user queries.
