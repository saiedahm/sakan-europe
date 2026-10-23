import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

const approvedOrigins = new Set(
  (process.env.CORS_ALLOWED_ORIGINS || "https://sakanapp.net,https://www.sakanapp.net")
    .split(",").map((s) => s.trim()).filter(Boolean),
);

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'", "https://checkout.stripe.com"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

export const strictCors = cors({
  origin(origin, callback) {
    // Server-to-server clients may omit Origin; browser origins must be allowlisted.
    if (!origin || approvedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("CORS origin denied"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  maxAge: 600,
});

export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
  // Use express-rate-limit default IP key generation; it handles missing IPs safely.
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Zu viele Anmeldeversuche. Bitte später erneut versuchen." },
  keyGenerator: (req) => req.ip,
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
}).strict();

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Ungültige Eingabedaten." });
    res.locals.validatedBody = parsed.data as z.infer<T>;
    next();
  };
}

export function requireSameOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.get("origin");
  if (origin && !approvedOrigins.has(origin)) return res.status(403).json({ error: "Origin nicht erlaubt." });
  next();
}
