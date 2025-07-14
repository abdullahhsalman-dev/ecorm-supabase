import { Suspense } from "react";
import { ProductGrid } from "@/src/app/components/product-grid";
import { ProductFilters } from "@/src/app/components/product-filters";
import { ProductSorting } from "@/src/app/components/product-sorting";
import { Skeleton } from "@/src/app/components/ui/skeleton";

export const metadata = {
  title: "Products | Diners",
  description: "Browse our collection of products",
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const minPrice =
    typeof searchParams.minPrice === "string"
      ? Number.parseInt(searchParams.minPrice)
      : undefined;
  const maxPrice =
    typeof searchParams.maxPrice === "string"
      ? Number.parseInt(searchParams.maxPrice)
      : undefined;

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold">All Products</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ProductFilters />
        </div>
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">24</span> of{" "}
              <span className="font-medium text-foreground">100</span> products
            </p>
            <ProductSorting />
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {Array(9)
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
            <ProductGrid
              categorySlug={category}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
