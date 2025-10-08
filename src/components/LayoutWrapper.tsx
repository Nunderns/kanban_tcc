"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pagesWithFooter = ["/", "/funcionalidades", "/cases", "/sobre-taskflow"];
  const showFooter = pagesWithFooter.includes(pathname);

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
}
