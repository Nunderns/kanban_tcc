"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const pagesWithHeader = ["/funcionalidades", "/cases", "/"];
  const shouldRenderHeader = pagesWithHeader.includes(pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!shouldRenderHeader) return null;

  const linkColor = isScrolled
    ? "text-foreground hover:text-primary"
    : "text-white hover:text-primary-foreground/90";

  const iconColor = isScrolled ? "text-foreground" : "text-white";

  return (
    <header
      className={`fixed top-0 w-full flex justify-between items-center p-5 transition-all duration-300 z-50 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
          isScrolled ? "text-primary dark:text-primary" : "text-white"
        } cursor-pointer`}
      >
        TaskFlow
      </Link>

      {/* Menu Mobile + botão de tema */}
      <div className="flex items-center gap-2 lg:hidden">
        {/* Botão de tema (mobile) */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`p-2 rounded-full transition-colors ${
            isScrolled
              ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
          aria-label="Toggle theme"
        >
          {!mounted ? (
            <div className="w-5 h-5" />
          ) : theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Botão de menu */}
        <motion.button
          onClick={() => setMenuOpen(!menuOpen)}
          initial={false}
          animate={{ rotate: menuOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {menuOpen ? (
            <X className={`w-6 h-6 ${iconColor}`} />
          ) : (
            <Menu className={`w-6 h-6 ${iconColor}`} />
          )}
        </motion.button>
      </div>

      {/* Menu Desktop */}
      <nav className="hidden lg:flex">
        <ul className="flex space-x-6 font-medium items-center">
          <li>
            <Link href="/funcionalidades" className={linkColor}>
              Funcionalidades
            </Link>
          </li>
          <li>
            <Link href="/cases" className={linkColor}>
              Cases
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className={`px-4 py-2 rounded-md transition-colors ${
                isScrolled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white text-primary hover:bg-gray-100"
              }`}
            >
              Experimente
            </Link>
          </li>
          <li>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-full transition-colors ${
                isScrolled
                  ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* Menu Mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg lg:hidden ${
              isScrolled ? "border-t border-gray-200 dark:border-gray-800" : ""
            }`}
          >
            <ul className="flex flex-col p-4 space-y-4 font-medium">
              <li>
                <Link
                  href="/funcionalidades"
                  className="block text-foreground hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link
                  href="/cases"
                  className="block text-foreground hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  Cases
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Experimente
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
