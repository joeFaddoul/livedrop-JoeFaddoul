# LiveDrop (Flash-Sale & Follow Platform)

## LINK

https://excalidraw.com/#json=xX7mqBkTfKIV3BdkDFXgz,SteSS6j74MPGaArO9WyPNg

## TL;DR

- Creators schedule **limited-inventory drops**.  
- Users **follow creators**, browse products & drops, get **near real-time notifications**, and place **idempotent orders with no oversell**.  
- A single **Public API** (endpoints listed below) serves both web and mobile clients through the API Gateway.

---

## System Architecture



**Main Layers:**
1. **Client Layer**  
   - Web & Mobile apps  
   - Real-time updates via SSE  
   - Static assets (images) fetched from CDN

2. **Gateway Layer**  
   - **API Gateway**: entry point for all requests  
   - **Rate Limiter**: protects system during spikes  
   - **Auth Service**: login, refresh, realtime token

3. **MicroService Layer**  
   - **Product / Drop Service**: manage product catalog and drop lifecycle  
   - **Order Service**: process orders with idempotency and atomic stock decrement  
   - **Follower Service**: manage follow/unfollow relationships  
   - **Notification Service**: push events to users (realtime + offline)  
   - **Browsing Service**: efficient queries across drops & products

4. **Infrastructure & Data Layer**  
   - **Primary SQL DB**: authoritative state (users, orders, drops, follows)  
   - **Read Replicas**: offload read-heavy queries  
   - **Redis**: cache, idempotency store, rate limiting counters  
   - **Kafka**: reliable event stream (drop.started, stock.low, sold_out, order.confirmed)  
   - **Database Updater**: invalidates caches, updates read models, logs audit trail  
   - **S3 + CDN**: image storage + delivery

---

## Data Model

| Entity       | Key Fields                                                                 |
|--------------|----------------------------------------------------------------------------|
| **User**     | id, email, name, created_at                                                |
| **Creator**  | id, display_name, handle, created_at                                       |
| **Follows**  | user_id, creator_id, created_at (sharded by creator_id)                    |
| **Product**  | id, creator_id, title, description, price_cents, currency_code, created_at |
| **Drop**     | id, product_id, start_at, end_at, status, initial_stock, low_stock_thr, created_at |
| **DropStock**| drop_id, available, updated_at                                             |
| **Order**    | id, user_id, drop_id, qty, status, idempotency_key, created_at             |

Indexes:  
- `follows(creator_id, user_id)` (sharded)  
- `orders(idempotency_key UNIQUE)`  
- `drop_stock(drop_id)`  

---


## Key Design Choices

- **Atomic stock decrement in DB**  
  - Prevents oversell using a conditional update query.

- **Idempotent orders**  
  - `Idempotency-Key` stored in Redis, retries return the same result.

- **Follower sharding**  
  - Shard by `creator_id` to distribute load for celebrity-scale follower lists.

- **Kafka event fan-out**  
  - One published event consumed by multiple services (notifications, cache invalidation, analytics) in parallel.

- **Cache invalidation strategy**  
  - Stock keys invalidated on order confirmation.  
  - Drop lists refreshed on status changes.  
  - Product/creator caches refreshed on edit.  
  - TTLs tuned (short for stock, longer for profiles).

- **Cursor-based pagination**  
  - Used in follower, product, and drop listing APIs.  
  - Provides consistent, scalable paging vs. offset-based pagination.

- **Rate limiting**  
  - Token-bucket algorithm backed by Redis counters.  
  - Protects APIs against celebrity spikes and abuse.

- **Audit trail**  
  - Append-only log table capturing who/what/when for critical actions (orders, drops, follows).  
  - Aids debugging, compliance, and security monitoring.

---

## Non-Functional Goals

- **Throughput:** 500–1500 RPS reads, 150 orders/sec *(caches + replicas)*  
- **Latency:** p95 reads ≤200ms; orders ≤500ms *(Redis + replicas; atomic SQL update)*  
- **Notifications:** <2s from event to delivery *(Kafka + WS/SSE)*  
- **Scalability:** stateless services + Kafka fan-out + sharded followers *(horizontal scale + partitioning)*  
- **Fault tolerance:** replicas, retry policies, Redis fallback *(redundancy)*  
- **Security:** JWT auth, only owners see their orders/follows *(auth + service auth)*  
- **Observability:** metrics (latency, cache hit ratio, Kafka lag, follower query perf), logs, tracing *(monitor + alerting)*


---

## Example Flows

- **User follows a creator** → API stores follow in Primary DB, updates follower count, invalidates related caches.  

- **Creator uploads product images** → Client requests signed URL → direct upload to S3 → images served via CDN.  

- **Drop goes live** → Scheduler flips status in DB → Kafka publishes `drop.started` → Notification Service fans out alerts → Database Updater refreshes caches.  

- **User places an order** → Order Service atomically decrements stock in DB → inserts order → publishes `order.confirmed` → Notification Service confirms to buyer → Database Updater clears stock caches.  

- **Stock runs low / sells out** → Order Service detects threshold → Kafka publishes `stock.low` / `drop.sold_out` → Notification Service alerts followers → caches invalidated for stock and drop lists.  

- **User browses live drops** → API Gateway → Browsing Service → Redis (cache hit) or DB replica (fallback) → results paginated with cursor.

---

 ## API

### Follow
- `POST /follow`  
- `DELETE /follow/:creatorId`  
- `GET /creators/:creatorId/followers?cursor&limit`  
- `GET /users/:userId/following?cursor&limit`  
- `GET /follow/check?userId&creatorId`

### Products & Drops
- `POST /products`  
- `POST /drops` { productId, startAt, endAt, initialStock, lowStockThreshold }  
- `GET /browse/products?...`  
- `GET /browse/drops?status=upcoming|live|ended&cursor&limit`

### Orders
- `POST /orders` (Idempotency-Key header)  
- `GET /drops/:id`

### Efficiency (cached)
- `GET /api/creators/:id`  
- `GET /api/products/:id`  
- `GET /api/drops/:id`

### Authentication & Realtime
- `GET /api/realtime/token`  
- `POST /api/auth/login`  
- `POST /api/auth/refresh`

---

