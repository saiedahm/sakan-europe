# SAKAN EUROPE — CJ product import

The protected cron endpoint is `/api/cron/sync-products`; Vercel schedules it every six hours. It accepts only a bearer token matching `CRON_SECRET`.

## Required Vercel environment variables

- `DATABASE_URL`: PostgreSQL connection string.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token.
- `CRON_SECRET`: a long random secret; call the endpoint with `Authorization: Bearer <secret>`.
- `CJ_ACCESS_TOKEN`: API access token issued for your CJ Dropshipping account.
- `CJ_API_BASE_URL`: optional; defaults to `https://developers.cjdropshipping.com/api2.0/v1`.
- `CJ_PRODUCTS_PATH`: optional; defaults to `/product/list`. Must match the product-list API enabled for the account.
- `CJ_PAGE_SIZE`: optional, defaults to 50 (max 100).
- `CJ_MAX_PAGES`: optional, defaults to 10 (max 100).
- `CJ_SYNC_CONCURRENCY`: optional, defaults to 3 (max 5).

The CJ API account must be authorized to list products. CJ changes endpoints and response shapes by API version/account; verify the product-list endpoint and access-token method in the CJ developer console. The adapter intentionally fails closed on an unexpected response rather than pretending a sync succeeded.

## Database setup

Run `security/node/cj-products-schema.sql` once against the same PostgreSQL database used by `DATABASE_URL`. Product data is stored in `sakan_products`; product images are copied to public Vercel Blob URLs.

## Pricing, categories, stock

Retail price is supplier cost × 1.75, rounded to EUR cents. Category mapping covers master bedrooms, kids bedrooms, luxury furniture, and bedding/decor. Unmatched items are retained with a null category for review. A successfully imported product with zero stock is marked `out_of_stock`. Products not seen for more than two hours are marked out of stock to avoid advertising stale inventory; investigate failed/partial supplier syncs before reactivating them.

## Test after configuration

```sh
curl -X POST https://sakan-europe.vercel.app/api/cron/sync-products \
  -H "Authorization: Bearer $CRON_SECRET"
```

Do not put CJ credentials, Blob tokens, database URLs, or cron secrets in client-side code or commit them to Git. Vercel Cron requires a deployment plan that supports Cron Jobs; confirm schedule support for the project plan.
