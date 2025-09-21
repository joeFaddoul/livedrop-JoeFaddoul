# Cost Model

## Touchpoint 1: AI Typeahead Search

### Assumptions
- Model: Llama 3.1 8B Instruct via OpenRouter  
  - $0.05 / 1K prompt tokens  
  - $0.20 / 1K completion tokens  
- Avg tokens in: 20  
- Avg tokens out: 10  
- Requests/day: 50,000  
- Cache hit rate: 70%  

### Calculation
Cost/action = (20/1000 * 0.05) + (10/1000 * 0.20)  
= 0.001 + 0.002 = **$0.003**  

Daily cost = $0.003 * 50,000 * (1 - 0.70)  
= $0.003 * 15,000  
= **$45/day**

### Results
- Cost/action = **$0.003**  
- Daily cost = **$45**  

### Cost lever if over budget
- Increase cache hit rate to 80%+.  
- Limit output length to ≤5 tokens.  
- Use cheaper model variant for low-traffic queries.  


---

## Touchpoint 2: Support Assistant

### Assumptions
- Model: GPT-4o-mini  
  - $0.15 / 1K prompt tokens  
  - $0.60 / 1K completion tokens  
- Avg tokens in: 400  
- Avg tokens out: 150  
- Requests/day: 1,000  
- Cache hit rate: 30%  

### Calculation
Cost/action = (400/1000 * 0.15) + (150/1000 * 0.60)  
= 0.06 + 0.09  
= **$0.15**  

Daily cost = $0.15 * 1,000 * (1 - 0.30)  
= $0.15 * 700  
= **$105/day**

### Results
- Cost/action = **$0.15**  
- Daily cost = **$105**  

### Cost lever if over budget
- Reduce context size from 400 → 200 tokens.  
- Use a cheaper model for simple FAQs.  
- Cache repeated FAQ queries more aggressively.
