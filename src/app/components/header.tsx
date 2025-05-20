"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/components/cart-provider";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const mainCategories = [
  { name: "GRAND FESTIVE SALE", href: "/sale" },
  { name: "NEW IN", href: "/new-arrivals" },
  { name: "MEN", href: "/men" },
  { name: "WOMEN", href: "/women" },
  { name: "KIDS", href: "/kids" },
  { name: "FRAGRANCE", href: "/fragrance" },
  { name: "FOOTWEAR", href: "/footwear" },
  { name: "WINTER WEAR", href: "/winter-wear" },
];

const topBarLinks = [
  { name: "PK", href: "#" },
  { name: "RETURN & EXCHANGES", href: "/returns" },
  { name: "STORE LOCATOR", href: "/stores" },
  { name: "ORDER TRACKING", href: "/track-order" },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      {/* Top Bar */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            {topBarLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <div className="py-4">
                <h2 className="mb-4 text-lg font-semibold">Menu</h2>
                <nav className="flex flex-col space-y-3">
                  {mainCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="text-sm font-medium hover:text-gray-900"
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex-1 text-center lg:flex-none lg:text-left">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold tracking-wider">DINERS</h1>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on Mobile */}
          <nav className="hidden lg:flex lg:flex-1 lg:justify-center">
            <ul className="flex space-x-8">
              {mainCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.href}
                    className="text-sm font-medium hover:text-gray-900"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search, Account, Wishlist, Cart */}
          <div className="flex items-center space-x-4">
            <div
              className={cn("transition-all", isSearchOpen ? "w-64" : "w-0")}
            >
              {isSearchOpen && (
                <Input
                  type="search"
                  placeholder="Search..."
                  className="h-9 w-full"
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Link href={user ? "/account" : "/login"}>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
