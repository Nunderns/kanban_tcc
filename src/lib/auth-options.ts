import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { Adapter } from "@auth/core/adapters";
import type { DefaultSession } from "next-auth";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// JWT type is now available from next-auth/jwt/types
// No need to declare module for JWT in v5

const prisma = new PrismaClient();

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password } = credentials as { email: string; password: string };
        
        try {
          await prisma.$connect();
          
          const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, password: true }
          });

          if (!user?.password) {
            return null;
          }

          const isValid = await bcrypt.compare(password, String(user.password));
          
          if (!isValid) {
            return null;
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") {
          session.user.id = token.id;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        if (typeof token.picture === "string") {
          session.user.image = token.picture;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Ensure we're not mutating the token directly
        return {
          ...token,
          id: String(user.id),
        };
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
