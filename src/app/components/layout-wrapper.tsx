"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/src/app/components/header";
import Footer from "@/src/app/components/footer";
import type React from "react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname ? pathname.startsWith("/admin") : false;

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
