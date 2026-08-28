"use client";

import { cn } from "@/src/app/lib/utils";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Subcategory = { name: string; href: string };
type Category = {
  name: string;
  href: string;
  accent?: boolean;
  subcategories?: Subcategory[];
};

const categories: Category[] = [
  { name: "Grand Festive Sale", href: "/sale", accent: true },
  { name: "New In", href: "/new-arrivals" },
  {
    name: "Men",
    href: "/men",
    subcategories: [
      { name: "T-Shirts", href: "/men/t-shirts" },
      { name: "Shirts", href: "/men/shirts" },
      { name: "Pants", href: "/men/pants" },
      { name: "Jeans", href: "/men/jeans" },
      { name: "Suits", href: "/men/suits" },
      { name: "Formal", href: "/men/formal" },
      { name: "Casual", href: "/men/casual" },
      { name: "Activewear", href: "/men/activewear" },
    ],
  },
  {
    name: "Women",
    href: "/women",
    subcategories: [
      { name: "Tops", href: "/women/tops" },
      { name: "Dresses", href: "/women/dresses" },
      { name: "Pants", href: "/women/pants" },
      { name: "Skirts", href: "/women/skirts" },
      { name: "Ethnic Wear", href: "/women/ethnic" },
      { name: "Western Wear", href: "/women/western" },
      { name: "Accessories", href: "/women/accessories" },
    ],
  },
  {
    name: "Kids",
    href: "/kids",
    subcategories: [
      { name: "Boys", href: "/kids/boys" },
      { name: "Girls", href: "/kids/girls" },
      { name: "Infants", href: "/kids/infants" },
      { name: "Teens", href: "/kids/teens" },
    ],
  },
  {
    name: "Fragrance",
    href: "/fragrance",
    subcategories: [
      { name: "Men", href: "/fragrance/men" },
      { name: "Women", href: "/fragrance/women" },
      { name: "Unisex", href: "/fragrance/unisex" },
      { name: "Gift Sets", href: "/fragrance/gift-sets" },
    ],
  },
  {
    name: "Footwear",
    href: "/footwear",
    subcategories: [
      { name: "Men", href: "/footwear/men" },
      { name: "Women", href: "/footwear/women" },
      { name: "Kids", href: "/footwear/kids" },
      { name: "Sports", href: "/footwear/sports" },
      { name: "Formal", href: "/footwear/formal" },
      { name: "Casual", href: "/footwear/casual" },
    ],
  },
  {
    name: "Winter Wear",
    href: "/winter-wear",
    subcategories: [
      { name: "Men", href: "/winter-wear/men" },
      { name: "Women", href: "/winter-wear/women" },
      { name: "Kids", href: "/winter-wear/kids" },
      { name: "Jackets", href: "/winter-wear/jackets" },
      { name: "Sweaters", href: "/winter-wear/sweaters" },
      { name: "Coats", href: "/winter-wear/coats" },
    ],
  },
];

const utilityLinks = [
  { name: "Login / Register", href: "/login" },
  { name: "Track Order", href: "/track-order" },
  { name: "Store Locator", href: "/stores" },
  { name: "Returns & Exchanges", href: "/returns" },
];

type MobileNavProps = {
  /** Called whenever a link inside the panel is tapped — use this to close the parent Sheet. */
  onNavigate?: () => void;
};

export default function MobileNav({ onNavigate }: MobileNavProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setOpenCategory((current) =>
      current === categoryName ? null : categoryName,
    );
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      <div className="border-b border-neutral-100 px-6 pb-5 pt-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-neutral-400">
          Menu
        </span>
      </div>

      <nav className="flex-1 px-6">
        {categories.map((category) => {
          const isOpen = openCategory === category.name;
          return (
            <div key={category.name} className="border-b border-neutral-100">
              <div className="flex items-center justify-between py-4">
                <Link
                  href={category.href}
                  onClick={onNavigate}
                  className={cn(
                    "text-[15px] font-semibold uppercase tracking-[0.08em] transition-colors",
                    category.accent
                      ? "text-[#FF3D6E]"
                      : "text-neutral-900 hover:text-neutral-500",
                  )}
                >
                  {category.name}
                </Link>

                {category.subcategories && (
                  <button
                    onClick={() => toggleCategory(category.name)}
                    aria-expanded={isOpen}
                    aria-label={`Toggle ${category.name} subcategories`}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                  >
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              {category.subcategories && (
                <div
                  className={cn(
                    "grid overflow-hidden transition-all duration-300 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="min-h-0">
                    <div className="flex flex-wrap gap-2 border-l-2 border-[#FF3D6E]/30 py-1 pb-5 pl-4">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.name}
                          href={subcategory.href}
                          onClick={onNavigate}
                          className="rounded-full border border-neutral-200 px-3.5 py-1.5 text-[13px] text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-neutral-100 bg-neutral-50 px-6 py-6">
        <div className="flex flex-col divide-y divide-neutral-200">
          {utilityLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={onNavigate}
              className="group flex items-center justify-between py-3 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
            >
              {link.name}
              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-900" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
