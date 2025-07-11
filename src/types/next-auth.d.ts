import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/react' {
  export function useSession(): {
    data: {
      session: Session | null;
    };
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  
  export function signIn(provider?: string, options?: { callbackUrl?: string; redirect?: boolean }): Promise<void>;
  export function signOut(options?: { callbackUrl?: string; redirect?: boolean }): Promise<void>;
}
