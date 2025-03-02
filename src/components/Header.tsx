"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    const pagesWithHeader = ["/funcionalidades", "/planos", "/blog", "/cases", "/"];

    // A lógica para verificar se a página deve renderizar o header
    const shouldRenderHeader = pagesWithHeader.includes(pathname);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!shouldRenderHeader) {
        return null;
    }

    return (
        <header
            className={`fixed top-0 w-full flex justify-between p-5 transition-all duration-300 z-50 ${isScrolled ? "bg-white shadow-md" : "bg-transparent"
                }`}
        >
            <Link
                href="/"
                className={`text-3xl font-bold transition-colors duration-300 ${isScrolled ? "text-blue-600" : "text-white"
                    } cursor-pointer`}
            >
                TaskFlow
            </Link>
            <nav>
                <ul className="flex space-x-6 font-medium">
                    <li>
                        <Link
                            href="/funcionalidades"
                            className={`transition-colors duration-300 ${isScrolled ? "text-blue-600 hover:text-blue-800" : "text-white hover:text-gray-200"
                                }`}
                        >
                            Funcionalidades
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/planos"
                            className={`transition-colors duration-300 ${isScrolled ? "text-blue-600 hover:text-blue-800" : "text-white hover:text-gray-200"
                                }`}
                        >
                            Planos
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/blog"
                            className={`transition-colors duration-300 ${isScrolled ? "text-blue-600 hover:text-blue-800" : "text-white hover:text-gray-200"
                                }`}
                        >
                            Blog
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/cases"
                            className={`transition-colors duration-300 ${isScrolled ? "text-blue-600 hover:text-blue-800" : "text-white hover:text-gray-200"
                                }`}
                        >
                            Cases
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/login"
                            className={`px-4 py-2 rounded-md transition-colors duration-300 ${isScrolled
                                    ? "bg-blue-500 text-white hover:bg-blue-600"
                                    : "bg-white text-blue-600 hover:bg-gray-200"
                                }`}
                        >
                            Experimente
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
