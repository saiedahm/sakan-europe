# SAKAN EUROPE catalog import

## Environment variables

Set these in Vercel Project → Settings → Environment Variables for the Preview/Production environment that will run the import:

- `DATABASE_URL`: PostgreSQL connection string for the catalog database.
- `CJ_ACCESS_TOKEN`: a valid CJ Dropshipping API 2.0 access token. Keep it private; never commit it to Git.
- `CRON_SECRET`: a long random secret. Vercel Cron sends this as `Authorization: Bearer <CRON_SECRET>`.
- Optional `DATABASE_SSL=false` only for a database that explicitly does not use TLS.

The import route is `GET /api/cron/sync-products`. It is protected by `CRON_SECRET`; a request without the correct bearer token returns 401. The configured Vercel cron currently runs daily at 00:00 UTC.

## First import

1. Configure the three required environment variables in Vercel.
2. Ensure the PostgreSQL database is reachable from the deployment.
3. Deploy this branch/merge the pull request, then trigger the protected route once using an authorized request with the configured bearer token.
4. Check the JSON response fields `fetched`, `importedOrUpdated`, and `skipped`, then visit `/api/products` and the storefront's Shop section.

The product sync is idempotent by supplier product ID and updates existing records rather than creating duplicates. It searches furniture/home keywords and maps matching products to Master Bedrooms, Kids Bedrooms, Luxury Furniture, and Bedding & Decor. Products outside these categories are skipped.

## Pricing and currency

Retail price is calculated as `floor(supplier price × 1.75) + 0.99`. CJ's supplier price is USD, so the catalog currently stores and displays USD. Do not label these prices as EUR unless a verified currency conversion is implemented.

## Important

This integration has not yet been verified against the live CJ account or deployed environment. Live import cannot work until the real CJ token and database URL are configured. Product API results can vary by CJ account, region, and supplier catalog.
