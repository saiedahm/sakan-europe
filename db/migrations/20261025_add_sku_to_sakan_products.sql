-- SAKAN EUROPE: add supplier SKU field without deleting or rewriting existing products.
-- Safe to run repeatedly.
ALTER TABLE IF EXISTS public.sakan_products
  ADD COLUMN IF NOT EXISTS sku VARCHAR(255);

-- Optional lookup optimization; non-unique because supplier SKUs may not be globally unique.
CREATE INDEX IF NOT EXISTS idx_sakan_products_sku
  ON public.sakan_products (sku);
