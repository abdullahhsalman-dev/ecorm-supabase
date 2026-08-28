"use client";

import { cn } from "@/src/app/lib/utils";
import {
  ArrowLeft,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  Package,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export function AdminSidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Products",
      icon: Package,
      href: "/admin/products",
      active: pathname.startsWith("/admin/products"),
    },
    {
      label: "Categories",
      icon: FolderTree,
      href: "/admin/categories",
      active: pathname.startsWith("/admin/categories"),
    },
    {
      label: "Orders",
      icon: ClipboardList,
      href: "/admin/orders",
      active: pathname.startsWith("/admin/orders"),
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-neutral-900 text-white",
        className,
      )}
    >
      {/* Sidebar Brand */}
      <div className="flex h-16 items-center px-6 border-b border-neutral-800">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-bold text-lg tracking-wider text-white"
          onClick={onClose}
        >
          <ShieldCheck className="h-6 w-6 text-[#FF3D6E]" />
          <span>
            LAMEES{" "}
            <span className="text-[#FF3D6E] text-xs font-semibold px-1 py-0.5 rounded bg-neutral-800">
              ADMIN
            </span>
          </span>
        </Link>
      </div>

      {/* Sidebar Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {routes.map((route) => {
          const Icon = route.icon;
          return (
            <Link
              key={route.href}
              href={route.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                route.active
                  ? "bg-[#FF3D6E] text-white shadow-lg shadow-[#FF3D6E]/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  route.active ? "text-white" : "text-neutral-400",
                )}
              />
              {route.label}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-neutral-800 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Storefront
        </Link>
      </div>
    </div>
  );
}
