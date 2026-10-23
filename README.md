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

## Validation

```bash
npm run lint
npm run build
```
