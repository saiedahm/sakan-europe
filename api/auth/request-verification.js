const crypto = require("node:crypto");
const nodemailer = require("nodemailer");

function tokenFor(email, expires, secret) {
  const payload = Buffer.from(JSON.stringify({ email, expires })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return payload + "." + signature;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const origin = process.env.APP_BASE_URL || ("https://" + (req.headers.host || ""));
  const allowedHost = new URL(origin).host;
  if (req.headers.host && req.headers.host !== allowedHost) return res.status(400).json({ error: "Invalid host" });
  const { email, privacyConsent } = req.body || {};
  if (privacyConsent !== true) return res.status(400).json({ error: "Bitte stimmen Sie der Datenschutzhinweis-Verarbeitung zu." });
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." });
  }
  const secret = process.env.AUTH_TOKEN_SECRET;
  const user = process.env.SMTP_USER || process.env.SMTP_FROM;
  const pass = process.env.SMTP_PASS;
  if (!secret || secret.length < 32 || !user || !pass || !process.env.SMTP_FROM) {
    return res.status(503).json({ error: "E-Mail-Verifizierung ist noch nicht konfiguriert. Bitte versuchen Sie es später erneut." });
  }
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    const token = tokenFor(normalizedEmail, expires, secret);
    const verifyUrl = new URL("/api/auth/verify?token=" + encodeURIComponent(token), origin).toString();
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtps.udag.de",
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: normalizedEmail,
      subject: "Bitte bestätigen Sie Ihre SAKAN EUROPE Registrierung",
      text: "Willkommen bei SAKAN EUROPE. Bitte bestätigen Sie Ihre E-Mail-Adresse innerhalb von 24 Stunden: " + verifyUrl,
      html: '<div style="margin:0;background:#060B18;padding:36px 12px;font-family:Arial,sans-serif;color:#F8F9FA"><div style="max-width:560px;margin:auto;background:#0F182E;border:1px solid #D4AF37;border-radius:16px;padding:32px;text-align:center"><div style="width:64px;height:64px;line-height:64px;margin:0 auto 18px;border:2px solid #D4AF37;border-radius:50%;color:#D4AF37;font-size:30px">♛</div><p style="letter-spacing:4px;color:#D4AF37;font-size:12px">SAKAN EUROPE</p><h1 style="font-family:Georgia,serif;font-weight:normal">Bitte bestätigen Sie Ihre E-Mail</h1><p style="line-height:1.7;color:#F3E5AB">Vielen Dank für Ihr Interesse. Bestätigen Sie Ihre E-Mail-Adresse, um die Registrierung fortzusetzen. Der Link ist 24 Stunden gültig.</p><a href="' + escapeHtml(verifyUrl) + '" style="display:inline-block;margin:18px 0;padding:15px 24px;background:linear-gradient(135deg,#D4AF37,#AA7C11);border-radius:8px;color:#060B18;text-decoration:none;font-weight:bold">JETZT BESTÄTIGEN &amp; ZUM SHOP</a><p style="font-size:12px;color:#aeb6c7">Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.</p></div></div>'
    });
    return res.status(200).json({ ok: true, message: "Verification email requested" });
  } catch (error) {
    console.error("SMTP verification email failed", error && error.message);
    return res.status(502).json({ error: "Die Bestätigungs-E-Mail konnte nicht versendet werden." });
  }
};
