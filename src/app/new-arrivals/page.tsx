import { ProductGrid } from "@/src/app/components/product-grid";
import { Skeleton } from "@/src/app/components/ui/skeleton";
import { Suspense } from "react";

export const metadata = {
  title: "Ready to Wear New Arrivals - Latest Stitched Dresses in Pakistan",
  description:
    "The newest stitched dresses in the collection. Ready to wear summer and winter pieces " +
    "for women in Pakistan - lawn, cotton, chiffon and formal wear, with prices shown.",
  alternates: { canonical: "/new-arrivals" },
};

export default function NewArrivalsPage() {
  return (
    <div className="px-4 py-12">
      <h1 className="mb-3 text-3xl font-bold">Ready to Wear New Arrivals</h1>

      <p className="mb-8 max-w-2xl text-neutral-600">
        The latest additions to the collection, every one of them stitched and ready to wear.
        Nothing here is sold as unstitched fabric.
      </p>

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
        <ProductGrid sort="newest" />
      </Suspense>
    </div>
  );
}
