"use client"; // Torna o componente um Client Component

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Defina as páginas onde o Footer deve aparecer
  const pagesWithFooter = ["/", "/funcionalidades", "/planos", "/blog", "/cases", "/sobre-taskflow"];
  const showFooter = pagesWithFooter.includes(pathname);

  return (
    <>
      {children}
      {showFooter && <Footer />} {/* Renderiza o Footer apenas nas páginas definidas */}
    </>
  );
}
