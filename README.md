# PayCollect

PayCollect is a multi-tenant receivables and payment-recovery app for
wholesalers. Owners can create retailer accounts, share a tenant-specific
payment page, and review submitted payment proofs from the dashboard.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## PWA and push notifications

PayCollect includes an installable PWA manifest, a service worker for the app
shell, and web push notifications for authenticated dashboard users. Push
notifications require HTTPS in deployed environments; localhost is supported
for development.

Generate VAPID keys with the installed `web-push` package:

```bash
npx web-push generate-vapid-keys
```

Add the generated values to the deployment environment:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:you@example.com
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

Owners and admins can then use **Enable alerts** in the dashboard header.

## Retailer payment links

Each workspace has a secure tenant payment page:

```text
https://your-domain.example/pay/<organization-id>
```

The Retailers page provides **Copy link**, **WhatsApp**, and native **Share**
buttons. WhatsApp uses the free `wa.me` link flow; it does not require the
WhatsApp Business API or a paid messaging provider. The retailer still has to
verify the phone number registered for that workspace before submitting proof.
Submitted proofs create an owner notification and remain `PENDING` until
approved in the dashboard.

## WhatsApp verified-payment receipts

Verified payments are written to a durable PostgreSQL WhatsApp outbox. A
separate worker delivers messages through the configured local bridge without
blocking payment verification. The database outbox is the source of truth;
Redis, when configured, only wakes the worker early and the worker's recovery
scan handles missed wakeups.

Recipients are separate idempotent outbox events:

- Organization payment: retailer/customer and wholesaler owner.
- Platform subscription payment: wholesaler owner and platform admin.

The owner WhatsApp number is collected during account signup. The platform
admin number is configured on the worker/server and is never exposed to the
browser.

Apply the generated Drizzle migration before starting the worker:

```bash
npm run db:push
npm run worker:whatsapp
```

The local bridge should use a port different from Next.js (for example `3001`):

```env
WHATSAPP_PROVIDER=local
WHATSAPP_BASE_URL=http://localhost:3001
WHATSAPP_SEND_URL=http://localhost:3001/api/sendText
WHATSAPP_DEFAULT_COUNTRY_CODE=977
WHATSAPP_API_KEY=
WHATSAPP_REQUEST_TIMEOUT_MS=10000
WHATSAPP_POLL_INTERVAL_MS=5000
WHATSAPP_MIN_SEND_INTERVAL_MS=4000
WHATSAPP_BATCH_SIZE=5
WHATSAPP_MAX_ATTEMPTS=5
WHATSAPP_LOCK_TIMEOUT_MS=120000
WHATSAPP_PLATFORM_ADMIN_PHONE=+977 9812345678
```

### Local bridge setup

The local bridge must be running and already linked to the WhatsApp account
that should send the messages. The bridge must expose a compatible
`POST /api/sendText` endpoint accepting:

```json
{
  "chatId": "9779812345678@c.us",
  "text": "message text"
}
```

For a local WhatsApp Web bridge, start its session, open its dashboard, and
scan the QR code from WhatsApp on the sending phone under **Linked devices**.
Keep that phone connected and keep the bridge running. If the bridge supports
an API key, set the same value in `WHATSAPP_API_KEY` and the bridge's API-key
configuration; otherwise leave it empty.

The worker also needs the same `DATABASE_URL` and, if used, `REDIS_URL` as the
Next.js application. Start the application and worker in separate terminals:

```bash
npm run dev
npm run worker:whatsapp
```

Do not commit `.env` files or real credentials. Self-hosted WhatsApp Web
bridges can be blocked by WhatsApp; use the official WhatsApp Business Cloud
API adapter for production traffic.

## Validation

```bash
npm run lint
npm run build
```
