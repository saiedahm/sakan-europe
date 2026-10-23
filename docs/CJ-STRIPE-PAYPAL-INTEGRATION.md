# SAKAN EUROPE — CJ Dropshipping, Stripe and PayPal

## Scope and safety

- Supplier of record: **CJ Dropshipping only**. Do not route orders to VidaXL, BigBuy, or a generic supplier endpoint.
- Keep the existing index.html and blue/gold design unchanged.
- Store all provider secrets in Vercel Project Settings → Environment Variables. Never put secrets in browser JavaScript or Git.
- The repository currently has a static storefront and modular backend starter files. A file in GitHub is not necessarily deployed or mounted by Vercel.
- Do not enable live checkout or automated supplier fulfillment until trusted server-side orders, provider-verified payments, and idempotent persistence are configured.

## CJ credentials

Official API 2.0 documentation: https://developers.cjdropshipping.com/en/api/api2/

In Vercel, set one of the following:
- CJ_API_KEY: the API Key from CJ My CJ → Authorization → API. The backend exchanges it for an access token.
- CJ_ACCESS_TOKEN: an already-generated CJ Access Token.

Set CJ_REFRESH_TOKEN optionally if you have the refresh token. Never commit real values. CJ tokens expire, so test refresh behavior before production.

Also set:
- CJ_LOGISTIC_NAME: exact logistics name selected from CJ's available options for the destination.
- CJ_FROM_COUNTRY_CODE: origin warehouse country code; verify it against the selected warehouse.
- CJ_SANDBOX=1 while testing. Change to 0 only after explicit production approval and successful end-to-end tests.

## CJ adapter status

services/cjDropshipping.js provides server-side CJ API authentication, an API request helper, order lookup, and a guarded create-order function. It requires:
- A persisted SAKAN order ID;
- server-verified paymentStatus=paid and paymentVerified=true;
- actual CJ variant IDs (vid), quantities, complete shipping details, and a logistics service.

The create endpoint creates a CJ order but does not confirm it or pay its supplier balance. Do not describe this stage as shipment. Confirmation and supplier balance payment are separate money-moving operations and must be added only after the database schema, CJ balance/payment method, and current CJ API flow have been verified.

## Stripe / PayPal production gate

The existing security/node/stripe-webhook.ts verifies Stripe signatures and deduplicates event IDs, but currently has no order-payment handler or fulfillment dispatch. It expects an Express application and PostgreSQL; it is not active merely because it exists in GitHub.

Before production:
1. Create orders server-side with authoritative line-item prices, currency, quantities, CJ variant IDs, and shipping address.
2. Persist payment attempts and provider transaction IDs in PostgreSQL.
3. Verify Stripe webhook signatures using the raw request body; verify PayPal webhook signatures using PayPal's verification API.
4. In one database transaction, validate provider transaction, order ID, amount, currency, and order state; deduplicate event IDs; mark paid and enqueue a durable fulfillment job.
5. Process the outbox with idempotency and reconciliation. Webhook retries must never create duplicate CJ orders.
6. Test declined, pending, refunded, disputed, duplicate, malformed, and out-of-order payment events in sandbox.
7. Verify CJ order creation, confirmation, balance payment, warehouse/logistics selection, cancellation, and tracking before live fulfillment.

Never accept a browser redirect or client-supplied paid flag as payment proof.
