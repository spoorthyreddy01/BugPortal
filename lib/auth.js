import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config.js";
import { connectDB } from "./db.js";
import User from "@/models/User";
import { USER_STATUS } from "@/config/constants";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    // The authorization gate: Google only proves identity, this decides
    // whether that identity is allowed in. Denying here (returning false)
    // sends the user back to /login?error=AccessDenied.
    async signIn({ user }) {
      if (!user?.email) return false;

      await connectDB();
      const dbUser = await User.findOne({ email: user.email.toLowerCase() });

      if (!dbUser || dbUser.status !== USER_STATUS.ACTIVE) {
        return false;
      }

      return true;
    },

    // `user`/`account`/`profile` are only present on the initial sign-in
    // call, not on later token refreshes triggered by middleware/useSession
    // — so the DB is only hit once per login, not on every request.
    async jwt({ token, user, account, profile }) {
      if (user?.email) {
        await connectDB();
        const dbUser = await User.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          {
            $set: {
              name: profile?.name || user.name || "",
              image: profile?.picture || user.image || null,
              googleId: account?.providerAccountId || null,
              lastLogin: new Date(),
            },
          },
          { new: true }
        );

        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.status = dbUser.status;
        token.name = dbUser.name;
        token.picture = dbUser.image;
      }

      return token;
    },
  },
});
