// src/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
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
// No seu auth.tsx, modifique a parte do authorize para:
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("E-mail e senha são obrigatórios");
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
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

  // Verifica se a senha é uma string válida
  if (typeof user.password !== 'string') {
    console.error('Password is not a string:', user.password);
    throw new Error("Formato de senha inválido");
  }

  const isValid = await bcrypt.compare(credentials.password, user.password);

  if (!isValid) {
    throw new Error("Senha incorreta");
  }

  return {
    id: String(user.id), // Garante que o ID é uma string
    email: user.email,
    name: user.name
  };
}
    })
  ],
  session: {
    strategy: "jwt" as const, // Adicione 'as const' para o tipo literal
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/login",
    error: "/login"
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };