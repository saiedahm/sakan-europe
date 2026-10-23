-- Apply once to the PostgreSQL database configured by DATABASE_URL.
CREATE TABLE IF NOT EXISTS sakan_products (
  sku TEXT PRIMARY KEY,
  supplier_product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT CHECK (category IS NULL OR category IN ('master-bedrooms','kids-bedrooms','luxury-furniture','bedding-decor')),
  supplier_cost NUMERIC(12,2) NOT NULL CHECK (supplier_cost >= 0),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  supplier TEXT NOT NULL DEFAULT 'cj',
  sync_status TEXT NOT NULL DEFAULT 'active' CHECK (sync_status IN ('active','out_of_stock','error')),
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sakan_products_category_status_idx ON sakan_products(category, sync_status);
CREATE INDEX IF NOT EXISTS sakan_products_supplier_sync_idx ON sakan_products(supplier, synced_at);
