"use client";

import { FaTimes, FaSpinner } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ visible, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  if (!visible) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("Digite seu email");
      return;
    }

    setSending(true);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Email enviado!");
      onClose();
    } else {
      toast.error(data.message || "Erro ao enviar email");
    }

    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">

        <button className="absolute top-4 right-4" onClick={onClose}>
          <FaTimes className="text-gray-500 dark:text-gray-300" />
        </button>

        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300">Recuperar Senha</h2>

        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Digite seu email para receber um link de recuperação.
        </p>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            className="w-full p-2 border rounded-md dark:bg-gray-700"
            placeholder="seu@email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-blue-600 text-white py-2 rounded-md flex justify-center"
          >
            {sending ? <FaSpinner className="animate-spin" /> : "Enviar link"}
          </button>
        </form>
      </div>
    </div>
  );
}
