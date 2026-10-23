import * as jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.NEXTAUTH_SECRET || (() => {
  throw new Error("NEXTAUTH_SECRET is required");
})();

/**
 * Verify JWT token (utility function - not a server action)
 */
export function verifyAdminToken(token: string): {
  valid: boolean;
  payload?: { id?: string; email?: string; isAdmin?: boolean };
  error?: string;
} {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "string") {
      return { valid: false, error: "Invalid token payload" };
    }
    return { valid: true, payload: { id: typeof payload.id === "string" ? payload.id : undefined, email: typeof payload.email === "string" ? payload.email : undefined, isAdmin: payload.isAdmin === true } };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
}
