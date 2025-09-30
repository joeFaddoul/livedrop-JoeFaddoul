### Q01: Does Shoplite allow duplicate email registrations?
**Expected retrieval context:** Document 1: Shoplite User Registration Process  
**Authoritative answer:** Shoplite prevents duplicate registrations. If an email already exists, the user is prompted to reset their password instead of creating a new account.  
**Required keywords in LLM response:** ["duplicate email", "reset password", "not allowed"]  
**Forbidden content:** ["multiple accounts allowed", "bypass verification"]

---

### Q02: What payment methods are supported on Shoplite?
**Expected retrieval context:** Document 3: Shoplite Payment Methods and Security  
**Authoritative answer:** Shoplite supports Visa, Mastercard, and major debit cards. In certain regions, Cash on Delivery (COD) is available, while digital wallets are not yet supported.  
**Required keywords in LLM response:** ["Visa", "Mastercard", "Cash on Delivery"]  
**Forbidden content:** ["PayPal", "Apple Pay"]

---

### Q03: How does Shoplite secure online payment transactions?
**Expected retrieval context:** Document 3: Shoplite Payment Methods and Security + Document 13: Shoplite Security and Privacy Policies  
**Authoritative answer:** Payments are encrypted, processed via PCI-compliant gateways, and card details are never stored. Fraud detection systems monitor unusual patterns, and receipts are issued for all transactions.  
**Required keywords in LLM response:** ["PCI-compliant", "encryption", "fraud detection"]  
**Forbidden content:** ["no encryption", "plain text storage"]

---

### Q04: What is Shoplite’s standard delivery timeframe?
**Expected retrieval context:** Document 4: Shoplite Order Tracking and Delivery  
**Authoritative answer:** Standard delivery takes 3–5 business days, while express delivery is available for an extra fee and delivers in 1–2 business days.  
**Required keywords in LLM response:** ["3–5 business days", "express delivery", "1–2 business days"]  
**Forbidden content:** ["same day delivery", "international shipping"]

---

### Q05: How do order tracking and returns work together for customers?
**Expected retrieval context:** Document 4: Shoplite Order Tracking and Delivery + Document 5: Shoplite Return and Refund Policies  
**Authoritative answer:** Customers track orders through each stage until delivery and can request a return within 14 days after receiving the item. Returns are scheduled for courier pickup and refunds are issued within 7–10 business days after item verification.  
**Required keywords in LLM response:** ["14 days", "order tracking", "7–10 business days"]  
**Forbidden content:** ["no returns", "lifetime returns"]

---

### Q06: If I buy supplements or a Final Sale item on Shoplite, can I return them?
**Expected retrieval context:** Document 5: Shoplite Return and Refund Policies  
**Authoritative answer:** Consumables, hygiene-related products, and items marked “Final Sale” are not eligible for return.  
**Required keywords in LLM response:** ["consumables", "hygiene products", "Final Sale"]  
**Forbidden content:** ["all items returnable", "lifetime returns"]

---

### Q07: How are refunds processed for Cash on Delivery orders?
**Expected retrieval context:** Document 3: Shoplite Payment Methods and Security + Document 5: Shoplite Return and Refund Policies  
**Authoritative answer:** COD refunds are issued via bank transfer. Customers must provide bank details, and funds are typically received within 7–10 business days of return processing.  
**Required keywords in LLM response:** ["Cash on Delivery", "bank transfer", "7–10 business days"]  
**Forbidden content:** ["instant cash refund", "store credit only"]

---

### Q08: How can customers leave reviews on Shoplite?
**Expected retrieval context:** Document 6: Shoplite Product Reviews and Ratings  
**Authoritative answer:** Only verified buyers can leave 1–5 star ratings, write text reviews, and upload photos. Reviews are moderated and sellers may only reply publicly.  
**Required keywords in LLM response:** ["verified buyers", "1–5 star ratings", "photos"]  
**Forbidden content:** ["anonymous reviews", "sellers can delete reviews"]

---

### Q09: How do I create a seller account on Shoplite?
**Expected retrieval context:** Document 7: Shoplite Seller Account Setup and Management  
**Authoritative answer:** To create a seller account, applicants must provide business documents, proof of registration, tax ID, and banking details. Applications are reviewed within 2–3 business days before approval and access to the Seller Dashboard is granted.  
**Required keywords in LLM response:** ["seller registration", "business documents", "2–3 business days"]  
**Forbidden content:** ["instant approval", "no verification required", "personal accounts"]

---

### Q10: How are sellers paid and what minimum thresholds apply?
**Expected retrieval context:** Document 7: Shoplite Seller Account Setup and Management + Document 9: Shoplite Commission and Fee Structure  
**Authoritative answer:** Sellers receive weekly payouts once their balance reaches $100 or more. Payouts reflect sales revenue minus a 10% commission and transaction fees. Balances below $100 roll over to the next week.  
**Required keywords in LLM response:** ["weekly payouts", "minimum $100", "10% commission"]  
**Forbidden content:** ["daily payouts", "no commission"]

---

### Q11: How does Shoplite prevent overselling?
**Expected retrieval context:** Document 8: Shoplite Inventory Management for Sellers + Document 4: Shoplite Order Tracking and Delivery  
**Authoritative answer:** Shoplite validates stock at checkout, decrements conditionally, and automatically marks items as “Sold Out” when inventory reaches zero. Customers are notified if stock sells out during payment.  
**Required keywords in LLM response:** ["conditional stock decrements", "Sold Out", "prevent overselling"]  
**Forbidden content:** ["overselling allowed", "no stock checks"]

---

### Q12: What commission and fees do sellers pay on Shoplite?
**Expected retrieval context:** Document 9: Shoplite Commission and Fee Structure  
**Authoritative answer:** Sellers pay a 10% commission on completed orders plus 2–3% transaction fees. Optional ads and promotions incur extra costs. Payouts are made weekly if the balance exceeds $100.  
**Required keywords in LLM response:** ["10% commission", "2–3% transaction fees", "weekly payouts"]  
**Forbidden content:** ["no fees", "monthly subscription only"]

---

### Q13: What customer support options are available on Shoplite?
**Expected retrieval context:** Document 10: Shoplite Customer Support Procedures  
**Authoritative answer:** Support is available via live chat, email, and phone, Monday to Friday, 9 AM–5 PM. Responses usually arrive within 24–48 hours, while urgent issues are best handled by live chat.  
**Required keywords in LLM response:** ["live chat", "email", "24–48 hours"]  
**Forbidden content:** ["24/7 support", "instant guaranteed response"]

---

### Q14: What app-exclusive features are available for Shoplite users?
**Expected retrieval context:** Document 11: Shoplite Mobile App Features  
**Authoritative answer:** The mobile app provides biometric login, barcode scanning for product search, push notifications, and exclusive app-only discounts.  
**Required keywords in LLM response:** ["biometric login", "barcode scanning", "app-only discounts"]  
**Forbidden content:** ["desktop-only features", "no mobile app"]

---

### Q15: How does the Shoplite API help sellers manage their store?
**Expected retrieval context:** Document 12: Shoplite API Documentation for Developers + Document 8: Shoplite Inventory Management for Sellers  
**Authoritative answer:** The REST API allows sellers to sync inventory, automate order management, and retrieve product and payment data securely via OAuth 2.0. It enforces rate limits of 100 requests per minute.  
**Required keywords in LLM response:** ["REST API", "inventory sync", "OAuth 2.0"]  
**Forbidden content:** ["SOAP API", "unlimited requests"]

---

### Q16: What privacy controls can users exercise on Shoplite?
**Expected retrieval context:** Document 9: Shoplite Account Management + Document 13: Shoplite Security and Privacy Policies  
**Authoritative answer:** Users can update personal details, request secure data exports, or delete accounts. Deleted accounts anonymize personal data, though order history may remain for compliance purposes.  
**Required keywords in LLM response:** ["delete account", "data export", "anonymize"]  
**Forbidden content:** ["no data exports", "permanent lock-in"]

---

### Q17: What security protections does Shoplite provide for user accounts?
**Expected retrieval context:** Document 13: Shoplite Security and Privacy Policies  
**Authoritative answer:** Shoplite uses TLS encryption, salted password hashing, two-factor authentication, and fraud detection algorithms to safeguard accounts.  
**Required keywords in LLM response:** ["encryption", "salted hashing", "two-factor authentication"]  
**Forbidden content:** ["plain text passwords", "no encryption"]

---

### Q18: How do promotional codes work for buyers and sellers?
**Expected retrieval context:** Document 14: Shoplite Promotional Codes and Discounts + Document 7: Shoplite Seller Account Setup and Management  
**Authoritative answer:** Buyers can apply one code per order at checkout, which cannot be stacked or retroactively applied. Sellers can create campaigns via the Seller Dashboard, subject to approval and performance tracking.  
**Required keywords in LLM response:** ["one code per order", "cannot be stacked", "Seller Dashboard"]  
**Forbidden content:** ["multiple codes", "automatic discounts always"]

---

### Q19: What steps are needed to submit a warranty claim?
**Expected retrieval context:** Document 15: Shoplite Warranty and Claims  
**Authoritative answer:** Customers submit claims with proof of purchase and defect documentation. If approved, they may receive a replacement or refund. Claims must be filed within 6–12 months depending on the product warranty.  
**Required keywords in LLM response:** ["warranty claim", "proof of purchase", "6–12 months"]  
**Forbidden content:** ["lifetime warranty", "all products covered"]

---

### Q20: How are notifications used for orders and promotions?
**Expected retrieval context:** Document 10: Shoplite Customer Support Procedures + Document 11: Shoplite Mobile App Features + Document 14: Shoplite Promotional Codes and Discounts  
**Authoritative answer:** Customers receive notifications for order status changes, deliveries, and promotional offers. Notifications are delivered instantly through email and push, and users may adjust preferences in account settings.  
**Required keywords in LLM response:** ["push notifications", "order status", "promotions"]  
**Forbidden content:** ["no notifications", "manual updates only"]
