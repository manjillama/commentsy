import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { keys } from "@/config";
import authService from "@/services/authService";
import dbConnect from "@/lib/dbConnect";

export const options: NextAuthOptions = {
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if ((user as any).provider !== account?.provider)
        throw new Error("OAuthAccountNotLinked");
      return true;
    },
    async jwt({ token, user, account, profile }) {
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
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return url;
    },
  },
  providers: [
    GitHubProvider({
      clientId: keys.GITHUB_ID as string,
      clientSecret: keys.GITHUB_SECRET as string,
      async profile({ email, name, avatar_url }) {
        await dbConnect();
        const user = authService.handlePostOAuthUserSignIn(
          email,
          name,
          "github",
          avatar_url
        );
        return user;
      },
    }),
    GoogleProvider({
      clientId: keys.GOOGLE_CLIENT_ID as string,
      clientSecret: keys.GOOGLE_CLIENT_SECRET as string,
      async profile({ email, name, picture }) {
        await dbConnect();
        const user = authService.handlePostOAuthUserSignIn(
          email,
          name,
          "google",
          picture
        );
        return user;
      },
    }),
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
