// Edge-safe NextAuth config shared by middleware.js (Edge runtime) and
// lib/auth.js (Node runtime). Must never import mongoose/models here —
// Edge middleware can't run the MongoDB driver.

const PUBLIC_PATHS = ["/login", "/unauthorized"];

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    // Shapes the session object available via useSession()/auth() everywhere.
    // Role/status/id are already embedded in the token by lib/auth.js's
    // jwt callback at sign-in time, so this is just a passthrough copy.
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
      }
      return session;
    },

    // Runs on every request that passes through middleware.js. Pure
    // token inspection — no DB access allowed (Edge runtime).
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
      const isLoggedIn = !!auth?.user;

      if (isPublic) {
        if (isLoggedIn && pathname === "/login") {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) return false;

      if (pathname.startsWith("/admin") && auth.user.role !== "admin") {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
  },
};
