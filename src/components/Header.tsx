"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    // Only render the theme toggle after mounting to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const pagesWithHeader = ["/funcionalidades", "/cases", "/"];

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
            className={`fixed top-0 w-full flex justify-between p-5 transition-all duration-300 z-50 ${isScrolled ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}
        >
            <Link
                href="/"
                className={`text-3xl font-bold transition-colors duration-300 ${isScrolled ? "text-primary dark:text-primary" : "text-white"
                    } cursor-pointer`}
            >
                TaskFlow
            </Link>
            <nav>
                <ul className="flex space-x-6 font-medium">
                    <li>
                        <Link
                            href="/funcionalidades"
                            className={`transition-text ${isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-primary-foreground/90"}`}
                        >
                            Funcionalidades
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/blog"
                            className={`transition-text ${isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-primary-foreground/90"}`}
                        >
                            Blog
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/cases"
                            className={`transition-text ${isScrolled ? "text-foreground hover:text-primary" : "text-white hover:text-primary-foreground/90"}`}
                        >
                            Cases
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/login"
                            className={`px-4 py-2 rounded-md transition-bg transition-text ${isScrolled
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-white text-primary hover:bg-gray-100"
                                }`}
                        >
                            Experimente
                        </Link>
                    </li>
                    <li>
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={`p-2 rounded-full transition-bg transition-text ${isScrolled ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                            aria-label="Toggle theme"
                        >
                            {!mounted ? (
                                <div className="w-5 h-5" /> // Empty div with same dimensions to prevent layout shift
                            ) : theme === 'dark' ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
