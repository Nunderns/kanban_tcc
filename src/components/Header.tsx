"use client"; // <- Adicione esta linha no topo do arquivo

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full flex justify-between p-5 transition-all duration-300 z-50 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}`}>
      <Link href="/" className="text-3xl font-bold text-blue-600 cursor-pointer">
        TaskFlow
      </Link>
      <nav>
        <ul className="flex space-x-6 font-medium">
          <li><Link href="/funcionalidades" className="hover:text-blue-500">Funcionalidades</Link></li>
          <li><Link href="/planos" className="hover:text-blue-500">Planos</Link></li>
          <li><Link href="/blog" className="hover:text-blue-500">Blog</Link></li>
          <li><Link href="/cases" className="hover:text-blue-500">Cases</Link></li>
          <li>
            <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Experimente
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
