import { Suspense } from "react";
import Link from "next/link";
import { WomenHero } from "@/src/app/components/women-hero";
import { WomenCategories } from "@/src/app/components/women-categories";
import { ProductGrid } from "@/src/app/components/product-grid";
import { Button } from "@/src/app/components/ui/button";
import { Skeleton } from "@/src/app/components/ui/skeleton";

export const metadata = {
  title: "Women's Collection | Diners",
  description:
    "Explore our stunning women's fashion collection for every style",
};

export default function WomenPage() {
  return (
    <div>
      <WomenHero />

      <div className="container px-4 py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Shop by Category
        </h2>
        <WomenCategories />
      </div>

      <div className="container px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">New Arrivals</h2>
          <Link
            href="/women/new-arrivals"
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
          <ProductGrid categorySlug="women" sort="newest" limit={4} />
        </Suspense>
      </div>

      <div className="bg-gray-100 py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/public/assets/kids.webp"
                alt="Women's Ethnic Collection"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
                <h3 className="mb-2 text-3xl font-bold">Ethnic Collection</h3>
                <p className="mb-4 max-w-md">
                  Celebrate tradition with our elegant ethnic wear collection.
                </p>
                <Button
                  asChild
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Link href="/women/ethnic">Shop Now</Link>
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/public/assets/kids.webp"
                alt="Women's Western Collection"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
                <h3 className="mb-2 text-3xl font-bold">Western Collection</h3>
                <p className="mb-4 max-w-md">
                  Modern styles for the contemporary woman.
                </p>
                <Button
                  asChild
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Link href="/women/western">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Trending Now</h2>
          <Link
            href="/women/trending"
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
          <ProductGrid categorySlug="women" sort="trending" limit={4} />
        </Suspense>
      </div>
    </div>
  );
}
