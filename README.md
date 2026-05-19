# FoodBox — Smart Food Delivery (Monorepo)

## Services (Spring Boot)
- `discovery` (Eureka, 8761)
- `api-gateway` (Gateway, 8080)
- `auth-user` (JWT auth, profiles/addresses, 8081)
- `restaurant-menu` (restaurants/menus, 8082)
- `cart-order` (cart, orders, payment webhooks, 8083)
- `common-lib` (shared DTO/error)

## Frontend
- Vite + React app under `frontend/` (dev server 5173), targeting the gateway (`http://localhost:8080` by default, override `VITE_API_BASE`).

## Prereqs
- Java 17+
- Maven
- Node 18+
- Docker (optional for Postgres/Redis/Kafka)

## Quick start (H2 in-memory)
```bash
# each in its own terminal, from repo root
mvn -pl discovery spring-boot:run
mvn -pl api-gateway spring-boot:run
mvn -pl auth-user spring-boot:run
mvn -pl restaurant-menu spring-boot:run
mvn -pl cart-order spring-boot:run

# frontend
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Postgres profile
```bash
docker compose up -d postgres redis zookeeper kafka
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=foodbox
set DB_PASSWORD=foodbox
mvn -pl auth-user spring-boot:run -Dspring-boot.run.profiles=local
mvn -pl restaurant-menu spring-boot:run -Dspring-boot.run.profiles=local
mvn -pl cart-order spring-boot:run -Dspring-boot.run.profiles=local
```

## Dockerized (one command)
```
docker compose up --build
```
- Builds images for discovery, gateway, auth-user, restaurant-menu, cart-order.
- Runs Postgres/Redis/Kafka too.
- Gateway: http://localhost:8080, Eureka: http://localhost:8761.

## Key APIs
- Auth: `POST /auth/register`, `/auth/login`, `/auth/refresh`
- Menu: `GET /restaurants`, `/restaurants/{id}/menu`, `GET /foods/{id}`
- Cart: `POST /cart/add`, `GET /cart`, `DELETE /cart/remove/{itemId}`
- Orders: `POST /orders`, `GET /orders`, `GET /orders/{id}`, `PATCH /orders/{id}/status`
- Payment webhook: `POST /webhooks/payments` (`{ orderId, paymentStatus, transactionId, provider }`)

## Notes
- Gateway forwards JWT claims as headers `X-USER-ID`, `X-USER-ROLE` to downstream services.
- Order status transitions and payment status transitions are validated; payment SUCCEEDED auto-advances order to PREPARING.
- Frontend supports register/login, browse restaurants, add to cart, place order, and view orders.
