import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Utilize a mesma configuração de autenticação em todas as rotas
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
