# SAKAN EUROPE Node.js security integration

The current repository's main application entry is a static `index.html`; it does not currently contain a Next.js app, API route tree, PostgreSQL ORM, or an existing Stripe webhook route. These are modular backend starter files and are **not active merely because they exist in GitHub**.

## Dependencies to install in the backend project
```sh
npm install express helmet cors express-rate-limit zod bcryptjs stripe pg
npm install -D typescript @types/express @types/cors @types/bcryptjs @types/pg
```

## Integration
1. Mount `securityHeaders`, `strictCors`, and `apiLimiter` on the Express app. Mount `authLimiter` specifically before every login/register/password-reset handler.
2. Configure Express `trust proxy` only to the known reverse proxy hops; otherwise clients may spoof forwarded IP headers. Rate limits are per-process unless the limiter is backed by shared storage. For multiple instances, configure a shared Redis store and edge/WAF protection.
3. Mount `stripeWebhookRouter` at `/api/stripe-webhook` **before** `express.json()` so signature verification receives raw bytes.
4. Apply `schema.sql` via a reviewed migration. Implement explicit order/payment event handlers before accepting live payments. The example records events idempotently but intentionally does not mark orders paid or trigger supplier fulfillment.
5. Use parameterized `pg` queries only. Do not concatenate user input into SQL. Validate every request body, path parameter, and query parameter with Zod.
6. Store secrets only in the hosting provider's environment settings: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, and `BCRYPT_COST`. Never commit real values.
7. Enable HTTPS, PostgreSQL TLS with certificate validation, managed encryption-at-rest for DB/backups/object storage, least-privilege DB credentials, automated backups, secret rotation, and provider WAF/DDoS protection.
8. Add CSRF defenses to cookie-authenticated state-changing routes. HttpOnly cookies alone do not prevent CSRF. Use opaque random sessions stored server-side; do not invent a JWT/session implementation without a signing-key and revocation plan.
9. Test CSP against real image/font/payment hosts and deploy in staging first. Strict CSP may need nonce-based script handling depending on the actual app.
10. Run build, integration tests, dependency audit, and a security review before production. No architecture can guarantee zero vulnerabilities.

The code deliberately avoids altering `index.html` or claiming that these server controls are live until an actual backend is deployed and configured.
