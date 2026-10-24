import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z, type ZodType } from "zod";

/** Parse request data against an explicit schema before using it. */
export function parseInput<T>(schema: ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

function csrfSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("CSRF_SECRET must be configured with at least 32 characters");
  }
  return secret;
}

/** Bind a CSRF token to a verified server-side session ID. */
export function createCsrfToken(sessionId: string): string {
  if (!sessionId) throw new Error("A verified session ID is required");
  const nonce = randomBytes(32).toString("base64url");
  const signature = createHmac("sha256", csrfSecret()).update(`${sessionId}:${nonce}`).digest("base64url");
  return `${nonce}.${signature}`;
}

export function verifyCsrfToken(sessionId: string, token: string): boolean {
  if (!sessionId || !token || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [nonce, supplied] = parts;
  const expected = createHmac("sha256", csrfSecret()).update(`${sessionId}:${nonce}`).digest();
  const actual = Buffer.from(supplied, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Apply to authentication/session cookies. */
export const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

/** Call after loading the resource from the database and verifying its owner. */
export function assertOwner(
  authenticatedUserId: string | null | undefined,
  resourceOwnerId: string | null | undefined,
): void {
  if (!authenticatedUserId || !resourceOwnerId || authenticatedUserId !== resourceOwnerId) {
    throw new Error("FORBIDDEN_RESOURCE_ACCESS");
  }
}

/** Reusable baseline schema; prefer narrower per-field schemas for each endpoint. */
export const safeTextSchema = z.string().trim().max(2000);
