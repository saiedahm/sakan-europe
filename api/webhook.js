const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error("Stripe webhook is missing required environment variables.");
    return res.status(500).json({ error: "Webhook configuration is incomplete." });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).json({ error: "Missing Stripe signature." });
  }

  try {
    // Stripe signature verification requires the exact, unparsed request body.
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const rawBody = Buffer.concat(chunks);

    const stripe = new Stripe(secretKey);
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    // Acknowledge only verified events. These logs help with diagnostics;
    // persistent membership activation requires a database and is not done here.
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Verified Stripe Checkout completed", {
          eventId: event.id,
          sessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status,
          plan: session.metadata && session.metadata.sakan_plan
        });
        break;
      }
      case "checkout.session.async_payment_succeeded":
        console.log("Verified delayed Checkout payment succeeded", { eventId: event.id });
        break;
      case "checkout.session.async_payment_failed":
        console.log("Verified delayed Checkout payment failed", { eventId: event.id });
        break;
      case "invoice.paid":
        console.log("Verified subscription invoice paid", { eventId: event.id });
        break;
      case "invoice.payment_failed":
        console.log("Verified subscription invoice payment failed", { eventId: event.id });
        break;
      case "customer.subscription.updated":
        console.log("Verified subscription updated", { eventId: event.id });
        break;
      case "customer.subscription.deleted":
        console.log("Verified subscription cancelled/deleted", { eventId: event.id });
        break;
      default:
        console.log("Verified Stripe event received", { eventId: event.id, type: event.type });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook rejected or failed:", error && error.message);
    return res.status(400).json({ error: "Webhook signature verification failed or payload was invalid." });
  }
};

// Disable automatic JSON parsing so Stripe's original raw request body is preserved.
module.exports.config = {
  api: {
    bodyParser: false
  }
};
