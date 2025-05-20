import { Suspense } from "react";
import Link from "next/link";
import { FragranceHero } from "@/components/fragrance-hero";
import { FragranceCategories } from "@/components/fragrance-categories";
import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Fragrance Collection | Diners",
  description:
    "Discover our exclusive collection of fragrances for men and women",
};

export default function FragrancePage() {
  return (
    <div>
      <FragranceHero />

      <div className="container px-4 py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Shop by Category
        </h2>
        <FragranceCategories />
      </div>

      <div className="container px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">New Arrivals</h2>
          <Link
            href="/fragrance/new-arrivals"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
            </div>
          }
        >
          <ProductGrid categorySlug="fragrance" sort="newest" limit={4} />
        </Suspense>
      </div>

      <div className="bg-gray-100 py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/fragrance-men.png"
                alt="Men's Fragrances"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
                <h3 className="mb-2 text-3xl font-bold">Men's Fragrances</h3>
                <p className="mb-4 max-w-md">
                  Discover our collection of masculine scents.
                </p>
                <Button
                  asChild
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Link href="/fragrance/men">Shop Now</Link>
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/fragrance-women.png"
                alt="Women's Fragrances"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
                <h3 className="mb-2 text-3xl font-bold">Women's Fragrances</h3>
                <p className="mb-4 max-w-md">
                  Explore our collection of feminine scents.
                </p>
                <Button
                  asChild
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Link href="/fragrance/women">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Best Sellers</h2>
          <Link
            href="/fragrance/best-sellers"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
            </div>
          }
        >
          <ProductGrid categorySlug="fragrance" sort="best-selling" limit={4} />
        </Suspense>
      </div>
    </div>
  );
}
