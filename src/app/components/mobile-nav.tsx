"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    name: "GRAND FESTIVE SALE",
    href: "/sale",
  },
  {
    name: "NEW IN",
    href: "/new-arrivals",
  },
  {
    name: "MEN",
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
    name: "WOMEN",
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
    name: "KIDS",
    href: "/kids",
    subcategories: [
      { name: "Boys", href: "/kids/boys" },
      { name: "Girls", href: "/kids/girls" },
      { name: "Infants", href: "/kids/infants" },
      { name: "Teens", href: "/kids/teens" },
    ],
  },
  {
    name: "FRAGRANCE",
    href: "/fragrance",
    subcategories: [
      { name: "Men", href: "/fragrance/men" },
      { name: "Women", href: "/fragrance/women" },
      { name: "Unisex", href: "/fragrance/unisex" },
      { name: "Gift Sets", href: "/fragrance/gift-sets" },
    ],
  },
  {
    name: "FOOTWEAR",
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
    name: "WINTER WEAR",
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

export default function MobileNav() {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((current) =>
      current.includes(categoryName)
        ? current.filter((name) => name !== categoryName)
        : [...current, categoryName]
    );
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto py-6">
      <div className="px-4">
        <h2 className="mb-6 text-lg font-semibold">Menu</h2>
        <nav className="flex flex-col space-y-1">
          {categories.map((category) => (
            <div key={category.name} className="border-b border-gray-100 py-2">
              <div className="flex items-center justify-between">
                <Link
                  href={category.href}
                  className="text-sm font-medium hover:text-gray-900"
                >
                  {category.name}
                </Link>
                {category.subcategories && (
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="p-1"
                  >
                    {openCategories.includes(category.name) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              {category.subcategories && (
                <div
                  className={cn(
                    "ml-4 mt-2 space-y-1 transition-all",
                    openCategories.includes(category.name) ? "block" : "hidden"
                  )}
                >
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.name}
                      href={subcategory.href}
                      className="block py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-gray-100 px-4 pt-6">
        <div className="flex flex-col space-y-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-gray-900"
          >
            Login / Register
          </Link>
          <Link
            href="/track-order"
            className="text-sm font-medium hover:text-gray-900"
          >
            Track Order
          </Link>
          <Link
            href="/stores"
            className="text-sm font-medium hover:text-gray-900"
          >
            Store Locator
          </Link>
          <Link
            href="/returns"
            className="text-sm font-medium hover:text-gray-900"
          >
            Returns & Exchanges
          </Link>
        </div>
      </div>
    </div>
  );
}
