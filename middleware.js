import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Deliberately built from the Edge-safe config only (no mongoose import
// anywhere in this chain) since Next.js middleware runs on the Edge runtime.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Page routes only. API routes protect themselves individually (see
  // middleware/requireAuth.js) since role checks there vary per-endpoint
  // and JSON 401/403 responses are more appropriate than redirects.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
