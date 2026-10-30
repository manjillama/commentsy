import { safeErrorDetails } from "@/utils/logContext";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { keys } from "@/config";
import authService from "@/services/authService";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sessionCookieOptions } from "@/utils/sessionCookie";
import logger from "@/utils/logger";
import { authRedirect } from "@/utils/authRedirect";

export const options: NextAuthOptions = {
  logger: {
    error(code, metadata) {
      logger.error("auth.error", { code, ...safeErrorDetails((metadata as any)?.error ?? metadata) });
    },
    warn(code) {
      logger.warn("auth.warning", { code });
    },
  },
  events: {
    async signIn({ account }) {
      logger.info("auth.signed_in", { provider: account?.provider });
    },
    async signOut() {
      logger.info("auth.signed_out");
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: sessionCookieOptions(process.env.NEXTAUTH_URL, process.env.NODE_ENV === "production"),
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if ((user as any).provider !== account?.provider) {
        logger.warn("auth.login.rejected", { reason: "provider_mismatch", provider: account?.provider });
        throw new Error("OAuthAccountNotLinked");
      }
      return true;
    },
    async jwt({ token, user, account, profile, trigger }) {
      if (token.sub) {
        await dbConnect();
        const accountState = await User.findById(token.sub)
          .select("name image avatarBackgroundColor +sessionVersion").lean();
        if (!accountState) return {};
        const version = accountState.sessionVersion ?? 0;
        if (user) token.sessionVersion = version;
        else if ((token.sessionVersion ?? 0) !== version) return {};
        if (trigger === "update") {
          token.name = accountState.name;
          token.picture = accountState.image;
          token.avatarBackgroundColor = accountState.avatarBackgroundColor;
        }
      }
      if (user) token.avatarBackgroundColor = user.avatarBackgroundColor;
      token.id = token.sub;

      return token;
    },
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.avatarBackgroundColor = token.avatarBackgroundColor;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return authRedirect(url, baseUrl);
    },
  },
  providers: [
    ...(keys.GITHUB_ID?.trim() && keys.GITHUB_SECRET?.trim() ? [GitHubProvider({
      clientId: keys.GITHUB_ID as string,
      clientSecret: keys.GITHUB_SECRET as string,
      issuer: "https://github.com/login/oauth",
      async profile({ email, name, avatar_url }) {
        if (!email) throw new Error("OAuthProfileMissingEmail");
        await dbConnect();
        const user = await authService.handlePostOAuthUserSignIn(
          email,
          name || "User",
          "github",
          avatar_url
        );
        return user;
      },
    })] : []),
    ...(keys.GOOGLE_CLIENT_ID?.trim() && keys.GOOGLE_CLIENT_SECRET?.trim() ? [GoogleProvider({
      clientId: keys.GOOGLE_CLIENT_ID as string,
      clientSecret: keys.GOOGLE_CLIENT_SECRET as string,
      async profile({ email, name, picture }) {
        await dbConnect();
        const user = await authService.handlePostOAuthUserSignIn(
          email,
          name,
          "google",
          picture
        );
        return user;
      },
    })] : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        await dbConnect();

        const { email, password } = credentials as any;
        const user = await authService.getLoginUserFromCredentials({
          email,
          password,
        });

        return user;
      },
    }),
  ],
};
