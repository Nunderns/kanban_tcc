/* eslint-disable @typescript-eslint/no-unused-vars */

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: "google" | "credentials";
      rememberMe?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    name?: string | null;
    rememberMe?: boolean;
    exp?: number;
  }
}
