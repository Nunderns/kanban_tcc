import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import TopProgressBar from "@/components/TopProgressBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow | A melhor ferramenta para gestão de tarefas",
  description: "Gerencie suas tarefas com eficiência e colaboração.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-100`}
      >
        <ThemeProvider>
          <SessionWrapper>
            <TopProgressBar />
            <Toaster position="top-right" />
            <Header />
            <LayoutWrapper>
              <main>{children}</main>
            </LayoutWrapper>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}