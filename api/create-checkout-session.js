const Stripe = require("stripe");

const PLANS = {
  basic: { name: "SAKAN EUROPE — الباقة الأساسية", amount: 900, mode: "subscription" },
  pro: { name: "SAKAN EUROPE — الباقة الاحترافية", amount: 2900, mode: "subscription" },
  business: { name: "SAKAN EUROPE — باقة الأعمال", amount: 7900, mode: "subscription" },
  "ad-featured": { name: "SAKAN EUROPE — إعلان عقاري مميز (7 أيام)", amount: 1900, mode: "payment" },
  "ad-company": { name: "SAKAN EUROPE — إعلان شركة (30 يومًا)", amount: 9900, mode: "payment" },
  "ad-developer": { name: "SAKAN EUROPE — حملة مطوّر عقاري (30 يومًا)", amount: 24900, mode: "payment" }
};

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "الطريقة غير مسموحة." });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "الدفع غير مفعّل بعد: أضف STRIPE_SECRET_KEY في إعدادات Vercel ثم أعد النشر." });
  }
  const planKey = req.body && req.body.plan;
  const plan = PLANS[planKey];
  if (!plan) return res.status(400).json({ error: "الباقة غير معروفة." });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const forwardedProto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const baseUrl = process.env.SITE_URL || (host ? forwardedProto + "://" + host : "");
    if (!baseUrl || !/^https:\/\//i.test(baseUrl)) {
      return res.status(500).json({ error: "عنوان الموقع الآمن غير مضبوط." });
    }
    const session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: plan.name },
          unit_amount: plan.amount,
          ...(plan.mode === "subscription" ? { recurring: { interval: "month" } } : {})
        },
        quantity: 1
      }],
      success_url: baseUrl + "/checkout-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: baseUrl + "/pricing.html?payment=cancelled",
      billing_address_collection: "required",
      allow_promotion_codes: true,
      metadata: { sakan_plan: planKey }
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout session creation failed:", error && error.message);
    return res.status(502).json({ error: "تعذّر إنشاء جلسة الدفع. راجع إعداد Stripe في الخادم." });
  }
};
