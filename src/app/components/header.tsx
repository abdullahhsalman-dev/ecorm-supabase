"use client";

import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/src/app/components/cart-provider";
import { MegaMenu } from "@/src/app/components/mega-menu";
import MobileNav from "@/src/app/components/mobile-nav";
import { NavigationProvider } from "@/src/app/components/navigation-provider";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/app/components/ui/sheet";
import { useAuth } from "@/src/app/context/auth-context";
import { cn } from "@/src/app/lib/utils";

const topBarLinks = [
  { name: "PK", href: "#" },
  { name: "Returns & Exchanges", href: "/returns" },
  { name: "Store Locator", href: "/stores" },
  { name: "Order Tracking", href: "/track-order" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <NavigationProvider>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white">
        {/* Top bar */}
        <div className="hidden bg-neutral-950 sm:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-6">
              {topBarLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400 transition-colors hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile menu trigger */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 sm:w-[380px]">
                <SheetHeader className="sr-only">
                  <SheetTitle>Site menu</SheetTitle>
                </SheetHeader>
                <MobileNav onNavigate={() => setIsMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex-1 text-center lg:flex-none lg:text-left">
              <Link
                href="/"
                className="inline-flex flex-col items-center lg:items-start"
              >
                <span className="text-2xl font-bold uppercase tracking-[0.2em] text-neutral-900">
                  Lamees
                </span>
                <span className="mt-1 h-[2px] w-8 bg-[#FF3D6E]" />
              </Link>
            </div>

            {/* Search, account, wishlist, cart */}
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
                  isSearchOpen ? "w-40 sm:w-64" : "w-0",
                )}
              >
                <Input
                  type="search"
                  placeholder="Search..."
                  autoFocus={isSearchOpen}
                  className="h-9 w-full border-neutral-200 focus-visible:ring-[#FF3D6E]"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen((open) => !open)}
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                {isSearchOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
              {user ? (
                <Link href="/account">
                  <Button variant="ghost" size="icon" aria-label="Your account">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  {/* Signed out: an explicit way in, and a way to join. */}
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="text-sm">
                      Sign in
                    </Button>
                  </Link>

                  <Link href="/signup" className="hidden sm:block">
                    <Button size="sm" className="rounded-full text-sm">
                      Sign up
                    </Button>
                  </Link>

                  <Link href="/login" className="sm:hidden">
                    <Button variant="ghost" size="icon" aria-label="Sign in">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF3D6E] text-[10px] font-semibold text-white">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop navigation */}
        <div className="hidden border-t border-neutral-100 lg:block">
          <div className="mx-auto max-w-7xl px-4">
            <MegaMenu />
          </div>
        </div>
      </header>
    </NavigationProvider>
  );
}
