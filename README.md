# Chat API (Express)

Integration/Webhook service for LINE, Facebook, and other third-party providers. Built with Express + TypeScript, opinionated for team scalability and production readiness.

## Quickstart

```bash
cd backend/chat-api
cp .env.example .env   # fill secrets
npm install
npm run start:dev      # or npm run build && npm start
```

Defaults: port `8082`, health at `/health`, routes under root (no prefix).

## Endpoints

- `POST /webhooks/line` — LINE webhook with HMAC validation (`X-Line-Signature`).
- `GET /webhooks/facebook` — FB Webhook verification (uses `FB_VERIFY_TOKEN`).
- `POST /webhooks/facebook` — FB webhook with `X-Hub-Signature-256` validation.
- `POST /webhooks/thirdparty` — Generic webhook with `X-Webhook-Signature` HMAC-SHA256.
- `GET /health` — service health probe.

## Flow & Structure

- Config validated via Joi (`src/config/env.ts`), logging via Pino with pretty output in dev.
- Signature middlewares in `src/middleware/signature.ts` for LINE/FB/third-party.
- Controllers in `src/controllers/webhook.controller.ts`; business logic in `src/services/*`.
- Clients for outbound calls: `LineClient`, `FacebookClient` with Axios. Kafka producer via `KafkaClient` (topic `integration.events`), RabbitMQ producer via `RabbitMQClient` (default routing `integration.tasks`), and Redis helper (`RedisClient`) for caching last messages.
- `body-parser` captures `rawBody` for signature verification; Helmet + Morgan for security/logging.

## Sample requests

- LINE: set webhook to `/webhooks/line`, send event; service replies "Acknowledged".
- FB: verify webhook `GET /webhooks/facebook?hub.mode=subscribe&hub.verify_token=$FB_VERIFY_TOKEN&hub.challenge=123`.
- Third-party: `curl -X POST http://localhost:8082/webhooks/thirdparty -H "X-Webhook-Signature: $(echo -n '{}' | openssl dgst -sha256 -hmac $THIRD_PARTY_WEBHOOK_SECRET -hex | cut -d ' ' -f2)" -d '{}'`.
