-- Apply this migration to the PostgreSQL database configured by DATABASE_URL before enabling invoice webhooks.
CREATE SEQUENCE IF NOT EXISTS sakan_invoice_number_seq START WITH 1;
CREATE TABLE IF NOT EXISTS sakan_invoices (
 id BIGSERIAL PRIMARY KEY,
 payment_reference TEXT NOT NULL UNIQUE,
 invoice_number TEXT NOT NULL UNIQUE,
 stripe_session_id TEXT NOT NULL,
 customer_email TEXT NOT NULL,
 gross_cents BIGINT NOT NULL CHECK (gross_cents>=0),
 currency CHAR(3) NOT NULL CHECK (currency='eur'),
 pdf_bytes BYTEA NOT NULL,
 invoice_data JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 email_sent_at TIMESTAMPTZ NULL,
 email_sending_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS sakan_invoices_created_at_idx ON sakan_invoices(created_at DESC);

-- Safe to rerun on a database where the initial invoice table already exists.
ALTER TABLE sakan_invoices ADD COLUMN IF NOT EXISTS email_sending_at TIMESTAMPTZ NULL;
