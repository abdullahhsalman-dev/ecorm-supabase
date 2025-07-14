// src/app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/src/app/index.css";
import { ThemeProvider } from "@/src/app/components/theme-provider";
import { Header } from "@/src/app/components/header";
import Footer from "@/src/app/components/footer";
import { Toaster } from "@/src/app/components/ui/toaster";
import { CartProvider } from "@/src/app/components/cart-provider";
import { AuthProvider } from "@/src/app/context/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Diners - Fashion E-commerce Store",
  description: "Shop the latest fashion trends for men, women, and kids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("RootLayout rendering with AuthProvider"); // Debug log
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
