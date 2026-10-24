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

Verified retailer (`ORG`) payments are written to a durable PostgreSQL
WhatsApp outbox. A separate worker delivers the receipt through the configured
local bridge without blocking payment verification. The database outbox is the
source of truth; Redis, when configured, only wakes the worker early and the
worker's recovery scan handles missed wakeups.

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
```

The current schema has retailer phone numbers but no organization-owner phone
field, so the implementation queues retailer receipts only. Add and verify an
owner contact field before enabling owner receipt events. Self-hosted
WhatsApp Web bridges can be blocked by WhatsApp; the provider adapter should be
replaced with the official WhatsApp Business Cloud API for production use.

## Validation

```bash
npm run lint
npm run build
```
