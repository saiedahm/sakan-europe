# SAKAN EUROPE — owner SMS alerts (Twilio)

## Endpoints
- Stripe's existing verified endpoint remains `POST /api/stripe-webhook`. The compatibility route `POST /api/webhooks/stripe` delegates to it and preserves raw-body signature verification.
- PayPal endpoint: `POST /api/webhooks/paypal`. It verifies incoming webhook signatures with PayPal before processing completed EUR captures.
- SMS dispatch uses Twilio's HTTPS API, so no extra SDK dependency is required. Notifications are de-duplicated by payment reference in PostgreSQL.

## Required Vercel environment variables
Set these in the Vercel project settings; never commit credentials:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER` — your Twilio-enabled sender number in E.164 format
- `OWNER_PHONE_NUMBER` — store owner's destination in E.164 format
- `DATABASE_URL` — PostgreSQL connection string
- For PayPal only: `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_WEBHOOK_ID`, and `PAYPAL_ENVIRONMENT=sandbox` or `live`.

## Required setup before live SMS
1. Apply `security/node/sms-notifications-schema.sql` to the same PostgreSQL database used by `DATABASE_URL`.
2. Configure the four Twilio/owner phone variables in Vercel Preview and Production environments.
3. For Stripe, set the webhook URL to `https://sakan-europe.vercel.app/api/webhooks/stripe` (or keep the existing `/api/stripe-webhook` URL; both resolve to the same handler). Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `payment_intent.succeeded`.
4. For PayPal, register `https://sakan-europe.vercel.app/api/webhooks/paypal` in the matching sandbox/live PayPal app, then save its webhook ID as `PAYPAL_WEBHOOK_ID`. Subscribe to `PAYMENT.CAPTURE.COMPLETED`.
5. Test with a sandbox payment first. Confirm Vercel logs report SMS queued/sent and confirm the actual handset receives it before switching to live.

## Message accuracy and resilience
- The notification is sent only after a verified paid Stripe Checkout Session or verified PayPal completed capture.
- Twilio requests time out after five seconds. Notification failures are logged and caught so they do not reverse a paid order or fail customer checkout.
- Database uniqueness prevents duplicate SMS sends for the same payment reference; failed sends may be retried by a later webhook delivery.
- Supplier fulfillment is reported as `Sent to Supplier` only when Stripe session metadata contains a supplier order ID. Otherwise the message says `Pending supplier confirmation`. The SMS module does not itself place supplier orders.
- SMS may contain customer name, city/country, purchased items and order amount. Confirm your privacy notice and legal basis cover sending these details to your store owner's phone.
