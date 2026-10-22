import bcrypt from "bcryptjs";

const cost = Math.min(15, Math.max(12, Number.parseInt(process.env.BCRYPT_COST || "12", 10) || 12));

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 128) throw new Error("Passwort muss 12 bis 128 Zeichen lang sein.");
  return bcrypt.hash(password, cost);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || password.length > 128 || !hash) return false;
  try { return await bcrypt.compare(password, hash); } catch { return false; }
}

/** Use with a cryptographically random opaque session ID stored server-side; rotate on login. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60 * 1000,
  // Do not set Domain: this keeps the cookie host-only.
};
