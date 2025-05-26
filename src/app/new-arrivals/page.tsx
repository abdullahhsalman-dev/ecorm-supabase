import { Suspense } from "react";
import { ProductGrid } from "@/src/app/components/product-grid";
import { Skeleton } from "@/src/app/components/ui/skeleton";

export const metadata = {
  title: "New Arrivals | Diners",
  description: "Explore the latest products in our store",
};

export default function NewArrivalsPage() {
  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">New Arrivals</h1>
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
