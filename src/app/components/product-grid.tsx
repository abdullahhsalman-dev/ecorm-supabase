"use client";

import { ProductCard } from "@/src/app/components/product-card";
import { ProductSorting } from "@/src/app/components/product-sorting";
import { Skeleton } from "@/src/app/components/ui/skeleton";
import { useProductList } from "@/src/app/lib/use-product-list";
import { statsFor, useReviewStats } from "@/src/app/lib/use-review-stats";
import { PackageOpen } from "lucide-react";
import { useMemo } from "react";

interface ProductGridProps {
  categorySlug?: string;
  categoryId?: string;
  sale?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  /* Variant values to narrow by, e.g. ["M","L"] / ["black"]. */
  variantValues?: string[];
  /* Free text from the header search. */
  search?: string;
  /* Renders the result count and the sort control above the grid. */
  showToolbar?: boolean;
}

export function ProductGrid({
  categorySlug,
  categoryId,
  sale,
  sort,
  minPrice,
  maxPrice,
  limit = 24,
  variantValues,
  search,
  showToolbar = false,
}: ProductGridProps) {
  const { products, loading, error, reload } = useProductList({
    categorySlug,
    categoryId,
    sale,
    /* No sort prop still means the featured-first default. */
    sort: sort ?? "featured",
    minPrice,
    maxPrice,
    limit,
    variantValues,
    search,
  });

  /* One stats query for the whole grid, not one per card. */
  const stats = useReviewStats(useMemo(() => products.map((product) => product.id), [products]));

  const errorMessage =
    error === null
      ? null
      : error instanceof Error
        ? error.message
        : "Products could not be loaded.";

  const gridClass =
    "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4";

  if (loading) {
    return (
      <div className="space-y-6">
        {showToolbar && (
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-[220px]" />
          </div>
        )}

        <div className={gridClass}>
          {Array.from({ length: Math.min(limit, 8) }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-9 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const toolbar = showToolbar ? (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{products.length}</span>{" "}
        {products.length === 1 ? "product" : "products"}
      </p>

      <ProductSorting />
    </div>
  ) : null;

  if (errorMessage) {
    return (
      <div className="space-y-6">
        {toolbar}

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-medium text-destructive">
            We couldn&apos;t load products right now.
          </p>

          <p className="mt-1 text-xs text-muted-foreground">{errorMessage}</p>

          <button
            type="button"
            onClick={reload}
            className="mt-4 text-sm font-medium underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        {toolbar}

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <PackageOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />

          <p className="text-sm font-medium">
            {search ? `Nothing matched "${search}".` : "No products found."}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {search
              ? "Try a different word, or browse the full catalogue."
              : "Try widening your filters, or check back soon."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toolbar}

      <div className={gridClass}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} stats={statsFor(stats, product.id)} />
        ))}
      </div>
    </div>
  );
}
