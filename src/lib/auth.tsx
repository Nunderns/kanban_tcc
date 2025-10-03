import NextAuth from "next-auth";
import { authOptions } from "./auth-options";

const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export { handlers, auth, signIn, signOut };

export const getServerSession = async () => {
  return await auth();
};