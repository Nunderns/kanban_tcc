"use client";

import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/post-login" });
  };

  return (
    <button
      onClick={handleGoogle}
      disabled={loading}
      className="w-full max-w-xs flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border 
      border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      <FaGoogle className="h-5 w-5 text-red-500" />
      {loading ? "Entrando..." : "Entrar com Google"}
    </button>
  );
}
