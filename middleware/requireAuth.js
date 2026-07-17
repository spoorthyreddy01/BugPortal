import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Resolves the current session for use inside API route handlers and
 * Server Actions (Node runtime — DB-backed role/status already live on
 * the token from lib/auth.js's jwt callback, no extra query needed here).
 */
export async function getSessionUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Returns the current user, or a 401 NextResponse if there is no
 * authenticated session. Call sites should check `instanceof NextResponse`.
 */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

/**
 * Returns the current user if their role is in `allowedRoles`, otherwise
 * a 401 (not signed in) or 403 (signed in, wrong role) NextResponse.
 */
export async function requireRole(allowedRoles) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}
