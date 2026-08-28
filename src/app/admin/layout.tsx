"use client";

import { Button } from "@/src/app/components/ui/button";
import { useAuth } from "@/src/app/context/auth-context";
import { ArrowRight, Lock, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { AdminHeader } from "./components/admin-header";
import { AdminSidebar } from "./components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 1. Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="h-8 w-8 text-[#FF3D6E] animate-spin" />
          <p className="text-sm font-medium text-neutral-500">
            Checking credentials...
          </p>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate: If user is not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FF3D6E]/10 text-[#FF3D6E] mb-6">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Access Denied
          </h1>
          <p className="text-neutral-500 mb-6 text-sm">
            This portal is restricted to authorized personnel. Please sign in
            with an administrator account to continue.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center gap-2"
            >
              Sign In to Account
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full text-neutral-600 border-neutral-300 hover:bg-neutral-50"
            >
              Return to Storefront
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Dashboard Shell for Authenticated Admin Users
  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col">
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-neutral-800 bg-neutral-900 md:flex md:flex-col">
        <AdminSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top Header */}
        <AdminHeader />

        {/* Children Pages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
