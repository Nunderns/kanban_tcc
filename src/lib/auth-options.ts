import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Account, User } from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, name: true, password: true },
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          String(credentials.password),
          String(user.password)
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name!,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const tokenUserId = user?.id || token.sub;
      if (tokenUserId) {
        token.id = tokenUserId;

        if (!token.email && user?.email) {
          token.email = user.email;
        }
      }
      if (trigger === "signIn" && session?.rememberMe !== undefined) {
        token.rememberMe = session.rememberMe;
      }
      if (token.rememberMe) {
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
      } else {
        token.exp = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && (token?.id || token?.sub || session.user.email)) {
        const userId = String(token.id || token.sub || session.user.id);
        session.user.id = userId;

        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

        session.user.email = session.user.email || dbUser?.email || null;
        session.user.name = session.user.name || dbUser?.name || null;

        const accounts = await prisma.account.findMany({ where: { userId } });

        const hasGoogle = accounts.some(
          (acc: Account) => acc.provider === "google"
        );

        session.user.provider = hasGoogle ? "google" : "credentials";
      }
      session.user.rememberMe = token.rememberMe ?? false;

      return session;
    },
  },


  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
