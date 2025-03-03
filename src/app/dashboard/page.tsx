"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

interface DashboardLayoutProps{
  children: React.ReactNode;
};

const DashBoardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Você não está logado. Faça login para acessar o Dashboard.");
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="p-10 text-lg">Carregando...</p>;
  }

  return (
    <div className="min-h-screen">
      <div className="flex w-full h-full">
        <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
          <Sidebar/>
        </div>
        <div className="lg:pl-[264px]">
          <div className="mx-auto max-w-screen-2xl h-full">
            <main>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardLayout;