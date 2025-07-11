declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      RESEND_API_KEY: string;
    }
  }
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
