// Ref: https://next-auth.js.org/getting-started/typescript#module-augmentation

import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      avatarBackgroundColor?: string;
    } & DefaultSession["user"];
  }
  interface User {
    avatarBackgroundColor?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    avatarBackgroundColor?: string;
  }
}
