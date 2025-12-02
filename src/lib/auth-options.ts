// src/lib/auth-options.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // <-- IMPORTE O PRISMA CERTO
import bcrypt from "bcryptjs";
import type { Account, User, Session } from "next-auth";

export const authOptions = {
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, email: true, name: true, password: true }
        });

        if (!user?.password) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],

  session: { strategy: "jwt" as const },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account }: { user: User | any; account?: Account | null }) {
      if (account?.provider === "google") return true;
      return true;
    },

    async jwt({ token, user }: { token: any; user: User }) {
      if (user) token.id = String(user.id);
      return token;
    },

    async session({ session, token }: { session: Session; token: any }) {
      if (session.user && token?.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
