# RAG System Evaluation

## Retrieval Quality Tests (10)
| Test ID | Question | Expected Documents | Pass Criteria |
|---------|----------|-------------------|---------------|
| R01 | How do I create a seller account on Shoplite? | Document 7: Seller Account Setup and Management | Retrieved docs contain Document 7 |
| R02 | What payment methods are supported? | Document 3: Payment Methods and Security | Retrieved docs include Document 3 |
| R03 | What is Shoplite’s standard delivery timeframe? | Document 4: Order Tracking and Delivery | Retrieved docs include Document 4 |
| R04 | Which products are not eligible for return? | Document 5: Return and Refund Policies | Retrieved docs include Document 5 |
| R05 | Who can leave reviews on products? | Document 6: Product Reviews and Ratings | Retrieved docs include Document 6 |
| R06 | How are sellers paid? | Document 9: Commission and Fee Structure | Retrieved docs include Document 9 |
| R07 | What security protections does Shoplite provide? | Document 13: Security and Privacy Policies | Retrieved docs include Document 13 |
| R08 | How do promotional codes work? | Document 14: Promotional Codes and Discounts | Retrieved docs include Document 14 |
| R09 | How do I file a warranty claim? | Document 15: Warranty and Claims | Retrieved docs include Document 15 |
| R10 | What features are unique to the mobile app? | Document 11: Mobile App Features | Retrieved docs include Document 11 |

---

## Response Quality Tests (15)  
| Test ID | Question | Required Keywords | Forbidden Terms | Expected Behavior |
|---------|----------|-------------------|-----------------|-------------------|
| Q01 | How do I register a new Shoplite account? | ["email verification", "24 hours"] | ["no verification"] | Direct answer with steps |
| Q02 | What happens if I register with a duplicate email? | ["duplicate email", "reset password"] | ["multiple accounts allowed"] | Correct refusal of duplicate registration |
| Q03 | What payment methods are available? | ["Visa", "Mastercard", "Cash on Delivery"] | ["PayPal"] | Clear list with security note |
| Q04 | How are payments secured? | ["PCI-compliant", "encryption"] | ["plain text"] | Security details included |
| Q05 | How long does standard delivery take? | ["3–5 business days", "1–2 business days"] | ["same day"] | States both standard and express |
| Q06 | How do I request a return? | ["14 days", "courier pickup", "7–10 business days"] | ["no returns"] | Step-by-step guidance |
| Q07 | Who can leave reviews? | ["verified buyers", "1–5 star ratings"] | ["anonymous reviews"] | Review rules correctly stated |
| Q08 | How do sellers manage stock? | ["real time updates", "low-stock alerts"] | ["overselling allowed"] | Inventory procedures correct |
| Q09 | What commission do sellers pay? | ["10% commission", "2–3% transaction fees"] | ["no fees"] | Fee breakdown accurate |
| Q10 | When is customer support available? | ["Monday to Friday", "9 AM to 5 PM"] | ["24/7 support"] | Correct hours stated |
| Q11 | What features are exclusive to the mobile app? | ["biometric login", "barcode scanning"] | ["desktop-only features"] | Mobile-only functionality included |
| Q12 | How does the API support sellers? | ["REST API", "OAuth 2.0", "100 requests per minute"] | ["SOAP API"] | Technical response with limits |
| Q13 | What privacy controls exist for users? | ["delete account", "data export", "anonymize"] | ["permanent lock-in"] | Correct privacy options |
| Q14 | How do promotional codes work? | ["one code per order", "cannot be stacked"] | ["multiple codes allowed"] | Promo rules enforced |
| Q15 | How are warranty claims handled? | ["6–12 months", "proof of purchase"] | ["lifetime warranty"] | Warranty policy correctly explained |

---

## Edge Case Tests (5)
| Test ID | Scenario | Expected Response Type |
|---------|----------|------------------------|
| E01 | User asks about a feature not in docs (e.g., “international shipping”) | Refusal with explanation |
| E02 | Ambiguous question: “How long does it take?” (no context) | Clarification request |
| E03 | User asks for full credit card number | Privacy/safety refusal |
| E04 | Conflict between multiple retrieved docs | Multi-doc synthesis with conflict noted |
| E05 | User provides incomplete order ID | Clarification request with example of proper format |
