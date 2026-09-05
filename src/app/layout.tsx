// src/app/layout.tsx
import { CartProvider } from "@/src/app/components/cart-provider";
import { CategoryProvider } from "@/src/app/components/category-provider";
import { QueryProvider } from "@/src/app/components/query-provider";
import { ThemeProvider } from "@/src/app/components/theme-provider";
import { Toaster } from "@/src/app/components/ui/toaster";
import { AuthProvider } from "@/src/app/context/auth-context";
import { LayoutWrapper } from "@/src/app/components/layout-wrapper";
import "@/src/app/index.css";
import { Analytics } from "@vercel/analytics/next";
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
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {/* Outermost of the data providers: the others read through it. */}
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                {/*
                 * Above LayoutWrapper so the admin, which renders
                 * without the header, reads the same store the
                 * storefront does.
                 */}
                <CategoryProvider>
                  <div className="flex min-h-screen flex-col">
                    <LayoutWrapper>{children}</LayoutWrapper>
                  </div>
                </CategoryProvider>
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>

        {/*
         * Vercel Web Analytics: page views and visitors, no
         * cookies. Outside the providers because it renders
         * nothing and only reports the route it is on.
         */}
        <Analytics />
      </body>
    </html>
  );
}
