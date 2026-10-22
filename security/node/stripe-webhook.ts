import express, { Router } from "express";
import Stripe from "stripe";
import { Pool } from "pg";

const router = Router();
const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const databaseUrl = process.env.DATABASE_URL;

if (!stripeKey || !webhookSecret || !databaseUrl) {
  // Fail fast when this route is mounted in production without required secrets.
  if (process.env.NODE_ENV === "production") throw new Error("Stripe/PostgreSQL security environment is incomplete.");
}

const stripe = stripeKey ? new Stripe(stripeKey) : null;
const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined,
  max: 10,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
}) : null;

/**
 * Mount this route BEFORE express.json(): app.use("/api/stripe-webhook", stripeWebhookRouter)
 * The route needs the exact raw request bytes to verify Stripe's signature.
 * Persist events with a unique event_id; never trust a client-provided payment status.
 */
router.post("/", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
  if (!stripe || !webhookSecret || !pool) return res.status(503).json({ error: "Payment service unavailable" });
  const signature = req.header("stripe-signature");
  if (!signature || !Buffer.isBuffer(req.body)) return res.status(400).json({ error: "Invalid webhook request" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret, 300);
  } catch {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      "INSERT INTO stripe_webhook_events (event_id, event_type, received_at) VALUES ($1, $2, NOW()) ON CONFLICT (event_id) DO NOTHING RETURNING event_id",
      [event.id, event.type],
    );
    if (inserted.rowCount === 0) {
      await client.query("COMMIT");
      return res.status(200).json({ received: true, duplicate: true });
    }

    // TODO: Add explicit, reviewed handlers for the event types your checkout uses.
    // For payment completion, verify session/payment intent IDs against a pending local order,
    // compare amount + currency + customer, then update order and enqueue fulfillment transactionally.
    // Never ship goods based only on an event type or metadata supplied by the browser.
    await client.query("COMMIT");
    return res.status(200).json({ received: true });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    // 5xx tells Stripe to retry; do not acknowledge an event that was not durably recorded.
    return res.status(500).json({ error: "Webhook processing failed" });
  } finally {
    client.release();
  }
});

export const stripeWebhookRouter = router;
