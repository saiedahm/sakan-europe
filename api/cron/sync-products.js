"use strict";
const { sync } = require("../../services/cjProductSync.cjs");
module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ error: "CRON_SECRET is not configured" });
  const supplied = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!supplied || supplied.length !== secret.length || !require("crypto").timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))) return res.status(401).json({ error: "Unauthorized" });
  try { const result = await sync(); return res.status(200).json({ ok: result.failed === 0, ...result }); }
  catch (error) { console.error("SAKAN CJ product sync failed:", error.message); return res.status(500).json({ error: "Product sync failed", message: error.message }); }
};
