# SAKAN EUROPE — PDF invoice automation

## Runtime and flow
- Vercel Node.js serverless function: `POST /api/stripe-webhook`; raw request bytes are used for Stripe signature verification.
- Supported paid events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `payment_intent.succeeded` when a matching paid Checkout Session exists.
- Stripe Checkout Session line items are retrieved from Stripe, not trusted from browser input.
- PDF is generated with PDFKit and `public/europe-logo.svg`, stored as `BYTEA` in PostgreSQL, and emailed as an attachment through SMTP.
- Unique payment reference plus PostgreSQL advisory lock makes invoice creation idempotent. An unsent stored invoice is retried on webhook retry.
- Protected `POST /api/invoices/generate` accepts `{"checkoutSessionId":"cs_..."}` and requires `x-invoice-api-secret`; it only issues invoices for a paid Stripe session.

## Required before activation
1. Run `security/node/invoices-schema.sql` on the PostgreSQL database set as `DATABASE_URL`.
2. Set Vercel environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `INVOICE_API_SECRET` (at least 32 random characters), `INVOICE_VAT_RATE`, `INVOICE_SELLER_LEGAL_NAME`, `INVOICE_SELLER_ADDRESS`, `INVOICE_SELLER_REGISTRATION`, and `INVOICE_SUPPORT_EMAIL`.
3. In Stripe, configure the webhook destination to `https://sakan-europe.vercel.app/api/stripe-webhook` and subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `payment_intent.succeeded`.
4. Ensure Checkout Sessions use EUR and include product line items, customer email, and shipping address collection where required.
5. Deploy and run a Stripe test-mode payment before switching to live mode.

## Tax and seller details
`INVOICE_VAT_RATE` defaults to 19% for Germany but must be set to the legally applicable rate for the seller, product, customer location, and transaction. The invoice shows gross amount, the included VAT portion, and the net amount derived from the configured rate. Do not use this as a substitute for tax/accounting review. Populate the seller's actual legal name, postal address, registration/VAT IDs, and support email before issuing production invoices. No registration details are fabricated by this integration.

## Scope
This integration handles Stripe. PayPal needs its own verified capture/webhook flow before a PayPal payment can trigger an invoice. Email and database secrets must only be stored in Vercel environment settings, never in Git.
