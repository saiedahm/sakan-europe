import { NextRequest, NextResponse } from "next/server";

/**
 * Global security boundary for the Next.js app.
 * Keep CSP aligned with the external providers actually used by the store.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  "img-src 'self' data: blob: https: https://*.supabase.co",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com",
  "connect-src 'self' https: wss: https://*.supabase.co https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "upgrade-insecure-requests",
].join("; ");

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const WEBHOOK_PATHS = new Set([
  "/api/webhooks/stripe",
  "/api/stripe/webhook",
  "/api/webhooks/stripe/",
]);

function allowedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>([request.nextUrl.origin]);
  const configured = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try { origins.add(new URL(configured).origin); } catch { /* invalid config is ignored */ }
  }
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  return origins;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Defense in depth against cross-site browser submissions to cookie-authenticated APIs.
  // Payment webhooks are excluded here because they must validate provider signatures instead.
  if (
    path.startsWith("/api/") &&
    MUTATING_METHODS.has(request.method) &&
    !WEBHOOK_PATHS.has(path)
  ) {
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");

    if (origin) {
      let parsedOrigin = "";
      try { parsedOrigin = new URL(origin).origin; } catch { /* reject malformed origin */ }
      if (!parsedOrigin || !allowedOrigins(request).has(parsedOrigin)) {
        return NextResponse.json({ error: "Forbidden: invalid request origin" }, { status: 403 });
      }
    } else if (fetchSite === "cross-site") {
      return NextResponse.json({ error: "Forbidden: cross-site request" }, { status: 403 });
    }
  }

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export const config = {
  matcher: [
    { source: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)" },
  ],
};
