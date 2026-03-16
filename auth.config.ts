import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname === "/posts/create" || nextUrl.pathname.includes("/edit");
      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  providers: [], // Empty providers array for now
  secret: "12345678901234567890123456789012", // Fixed 32-character secret
} satisfies NextAuthConfig;
