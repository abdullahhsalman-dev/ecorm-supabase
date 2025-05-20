import { Suspense } from "react";
import Link from "next/link";
import { MenHero } from "@/components/men-hero";
import { MenCategories } from "@/components/men-categories";
import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Men's Collection | Diners",
  description:
    "Discover our latest men's fashion collection for every occasion",
};

export default function MenPage() {
  return (
    <div>
      <MenHero />

      <div className="container px-4 py-12">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Shop by Category
        </h2>
        <MenCategories />
      </div>

      <div className="container px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">New Arrivals</h2>
          <Link
            href="/men/new-arrivals"
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
          <ProductGrid categorySlug="men" sort="newest" limit={4} />
        </Suspense>
      </div>

      <div className="bg-gray-100 py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/men-formal-wear.png"
                alt="Men's Formal Collection"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
                <h3 className="mb-2 text-3xl font-bold">Formal Collection</h3>
                <p className="mb-4 max-w-md">
                  Elevate your style with our premium formal wear collection.
                </p>
                <Button
                  asChild
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Link href="/men/formal">Shop Now</Link>
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/men-casual-wear.png"
                alt="Men's Casual Collection"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
                <h3 className="mb-2 text-3xl font-bold">Casual Collection</h3>
                <p className="mb-4 max-w-md">
                  Comfort meets style in our casual wear collection.
                </p>
                <Button
                  asChild
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Link href="/men/casual">Shop Now</Link>
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
            href="/men/best-sellers"
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
          <ProductGrid categorySlug="men" sort="best-selling" limit={4} />
        </Suspense>
      </div>
    </div>
  );
}
