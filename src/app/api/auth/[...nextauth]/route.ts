import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        // Verifica as credenciais no banco de dados
        if (credentials?.email && credentials?.password) {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            throw new Error("Usuário não encontrado");
          }

          // Verifica a senha usando bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            throw new Error("Senha inválida");
          }

          return { id: user.id, email: user.email, name: user.name };
        }

        // Caso as credenciais não sejam válidas
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login", // Página de login personalizada
  },
  session: {
    strategy: "jwt", // Usa JWT para a autenticação
    maxAge: 30 * 24 * 60 * 60, // Tempo máximo de expiração do token (30 dias)
    updateAge: 24 * 60 * 60, // Renovação do token a cada 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true, // O cookie não é acessível via JavaScript
        secure: process.env.NODE_ENV === "production", // Só envia cookies em conexões seguras (https)
        sameSite: "lax", // Garante que o cookie seja enviado em todas as requisições cruzadas
        path: "/", // O cookie será enviado para toda a aplicação
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
