// src/app/layout.tsx
import { CartProvider } from "@/src/app/components/cart-provider";
import { ThemeProvider } from "@/src/app/components/theme-provider";
import { Toaster } from "@/src/app/components/ui/toaster";
import { AuthProvider } from "@/src/app/context/auth-context";
import { LayoutWrapper } from "@/src/app/components/layout-wrapper";
import "@/src/app/index.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lamees - Fashion E-commerce Store",
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
                <LayoutWrapper>{children}</LayoutWrapper>
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
