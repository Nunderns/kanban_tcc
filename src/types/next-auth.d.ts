import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider?: "google" | "credentials";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
