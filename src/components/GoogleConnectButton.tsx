"use client";

import { signIn } from "next-auth/react";

export function GoogleConnectButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm 
                 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
    >
      <svg
        className="w-5 h-5 mr-2 -ml-1 text-red-500"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.88-1.757-4.382-2.832-6.735-2.832-5.522 0-10 4.479-10 10s4.478 10 10 10c8.396 0 10-7.496 10-9.634 0-0.996-0.102-1.277-0.201-1.491h-9.8z" />
      </svg>
      Conectar com Google
    </button>
  );
}
