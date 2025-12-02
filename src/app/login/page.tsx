"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import LoginForm from "./components/LoginForm";
import GoogleLoginButton from "./components/GoogleLoginButton";
import Divider from "./components/Divider";
import LoginHero from "./components/LoginHero";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
import TermsModal from "./components/TermsModal";
import PrivacyModal from "./components/PrivacyModal";

export default function LoginPage() {
  const { status } = useSession();

  const [showForgot, setShowForgot] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>;
  }
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-semibold mb-6 text-black dark:text-white">
          TaskFlow
        </h1>
        <GoogleLoginButton />
        <Divider />
        <LoginForm
          onForgot={() => setShowForgot(true)}
          onTerms={() => setShowTerms(true)}
          onPrivacy={() => setShowPrivacy(true)}
        />
      </div>
      <LoginHero />
      <ForgotPasswordModal visible={showForgot} onClose={() => setShowForgot(false)} />
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
}
