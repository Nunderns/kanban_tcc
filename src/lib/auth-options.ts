import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Account, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { NextAuthConfig } from "next-auth";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

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

  session: { strategy: "jwt" as const },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user: User | undefined;
    }) {
      const tokenUserId = user?.id || token.sub;
      if (tokenUserId) {
        token.id = tokenUserId;

        // Ensure token always carries email information for OAuth flows
        // where the user object might not be sent in subsequent requests.
        if (!token.email && user?.email) {
          token.email = user.email;
        }
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (session.user && (token?.id || token?.sub || session.user.email)) {
        const userId = String(token.id || token.sub || session.user.id);
        session.user.id = userId;

        const dbUser = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            email: true,
            name: true,
          },
        });

        session.user.email = session.user.email || dbUser?.email || null;
        session.user.name = session.user.name || dbUser?.name || null;

        const accounts = await prisma.account.findMany({
          where: { userId },
        });

        const hasGoogle = accounts.some(
          (acc: Account) => acc.provider === "google"
        );

        session.user.provider = hasGoogle ? "google" : "credentials";
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
