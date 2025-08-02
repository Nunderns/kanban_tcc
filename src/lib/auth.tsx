import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const config = {
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
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("E-mail e senha são obrigatórios");
          }

          const { email, password } = credentials as { email: string; password: string };
          
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true
            }
          });

          if (!user || !user.password) {
            throw new Error("Usuário não encontrado");
          }

          // Ensure password is a string
          const userPassword = String(user.password);
          
          const isValid = await bcrypt.compare(password, userPassword);

          if (!isValid) {
            throw new Error("Senha incorreta");
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

export const authConfig = {
  ...config,
  // Export the auth configuration for use in API routes
  getServerSession: async () => {
    const session = await auth();
    return session;
  }
};