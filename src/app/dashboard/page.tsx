"use client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Bem-vindo ao Dashboard!</h1>
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Sair
      </button>
    </div>
  );
}
