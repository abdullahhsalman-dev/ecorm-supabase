"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/src/app/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/app/components/ui/sheet";
import { useAuth } from "@/src/app/context/auth-context";
import { createClient } from "@/src/app/lib/supabase/client";
import { Database, LogOut, Menu, User, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "./admin-sidebar";

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Check Supabase connection health
    async function checkConnection() {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("categories")
          .select("id")
          .limit(1);
        if (error) throw error;
        setDbConnected(true);
      } catch (err) {
        console.warn(
          "Database connection issue (likely empty categories or mock keys):",
          err,
        );
        setDbConnected(false);
      }
    }
    checkConnection();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
      toast({
        title: "Logged Out",
        description: "You have been logged out of the admin panel.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAdminDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split("@")[0];
    return "Administrator";
  };

  const getAdminRoleName = () => {
    const email = user?.email || "";
    if (email.endsWith("@admin.com") || email.includes("admin")) {
      return "Super Admin";
    }
    return "Store Manager (Sandbox)";
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6 shadow-sm">
      {/* Mobile Menu & Title */}
      <div className="flex items-center gap-4">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-neutral-600"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] p-0 bg-neutral-900 border-none text-white"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
            </SheetHeader>
            <AdminSidebar onClose={() => setIsMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <h2 className="text-lg font-semibold text-neutral-800 md:text-xl">
          Admin Portal
        </h2>
      </div>

      {/* Right Side: Status, Profile details, Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* DB Connection Badge */}
        <div className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-neutral-50 text-neutral-600 sm:flex">
          {dbConnected === true ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-500 animate-pulse" />
              <span className="text-green-700">Live Database</span>
            </>
          ) : dbConnected === false ? (
            <>
              <Database className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-amber-700">Sandbox Mode</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-neutral-300 animate-pulse" />
              <span>Connecting...</span>
            </>
          )}
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 border-l border-neutral-200 pl-3 md:pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF3D6E]/10 text-[#FF3D6E]">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden flex-col text-left lg:flex">
            <span className="text-sm font-semibold text-neutral-800 leading-none">
              {getAdminDisplayName()}
            </span>
            <span className="text-[10px] font-medium text-neutral-400 mt-0.5 uppercase tracking-wider">
              {getAdminRoleName()}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          title="Sign Out"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
