const crypto = require("node:crypto");
function safeEqual(a, b) {
  const aa = Buffer.from(a); const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
module.exports = function handler(req, res) {
  if (req.method !== "GET") return res.status(405).send("Method not allowed");
  const secret = process.env.AUTH_TOKEN_SECRET;
  const token = String(req.query && req.query.token || "");
  if (!secret || secret.length < 32 || !token || token.length > 4096) return res.status(400).send("Ungültiger oder abgelaufener Bestätigungslink.");
  const parts = token.split(".");
  if (parts.length !== 2) return res.status(400).send("Ungültiger oder abgelaufener Bestätigungslink.");
  const expected = crypto.createHmac("sha256", secret).update(parts[0]).digest("base64url");
  if (!safeEqual(parts[1], expected)) return res.status(400).send("Ungültiger Bestätigungslink.");
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (!payload.email || !Number.isFinite(payload.expires) || payload.expires < Date.now()) return res.status(400).send("Der Bestätigungslink ist abgelaufen.");
    // This endpoint confirms possession of the mailbox only. A persistent user/account
    // record and authenticated VIP session require a database/auth provider integration.
    const base = process.env.APP_BASE_URL || ("https://" + (req.headers.host || ""));
    return res.redirect(302, new URL("/?verified=1", base).toString());
  } catch (_) {
    return res.status(400).send("Ungültiger Bestätigungslink.");
  }
};
