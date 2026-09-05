"use client";

import { ProductCard } from "@/src/app/components/product-card";
import { ProductSorting } from "@/src/app/components/product-sorting";
import { Skeleton } from "@/src/app/components/ui/skeleton";
import { InfiniteSentinel } from "@/src/app/components/infinite-sentinel";
import { useProductList, useProductPages } from "@/src/app/lib/use-product-list";
import { statsFor, useReviewStats } from "@/src/app/lib/use-review-stats";
import { PackageOpen } from "lucide-react";
import { useMemo } from "react";

interface ProductGridProps {
  categorySlug?: string;
  /* A department plus its subcategories. */
  categorySlugs?: string[];
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
  /* Only products created within the last N months. */
  newWithinMonths?: number;
  /* Renders the result count and the sort control above the grid. */
  showToolbar?: boolean;
  /*
   * Pages in more products as the shopper reaches the bottom.
   * Off for the fixed-size rails (a department preview wants
   * eight products, not the whole department).
   */
  infinite?: boolean;
}

export function ProductGrid({
  categorySlug,
  categorySlugs,
  categoryId,
  sale,
  sort,
  minPrice,
  maxPrice,
  limit = 24,
  variantValues,
  search,
  newWithinMonths,
  showToolbar = false,
  infinite = false,
}: ProductGridProps) {
  const query = {
    categorySlug,
    categorySlugs,
    categoryId,
    sale,
    /* No sort prop still means the featured-first default. */
    sort: sort ?? "featured",
    minPrice,
    maxPrice,
    variantValues,
    search,
    newWithinMonths,
  };

  /*
   * Both hooks are called every render - a hook cannot be
   * conditional - and the one that is not in use is disabled,
   * so it neither fetches nor holds a cache entry.
   */
  const single = useProductList({ ...query, limit, enabled: !infinite });

  const paged = useProductPages({ ...query, pageSize: limit, enabled: infinite });

  const { products, loading, error, reload } = infinite ? paged : single;

  const total = infinite ? paged.total : null;

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
      {/*
        With paging on, the count is the number of matching rows
        in the database rather than the number fetched so far -
        "Showing 24 products" used to be the length of the array,
        which said nothing about how many there were.
      */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{products.length}</span>
        {total !== null && total > products.length ? ` of ${total}` : ""}{" "}
        {(total ?? products.length) === 1 ? "product" : "products"}
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

      {infinite && (
        <InfiniteSentinel
          hasMore={paged.hasMore}
          loading={paged.loadingMore}
          onLoadMore={paged.loadMore}
          endLabel={products.length > limit ? "That's everything." : undefined}
        />
      )}
    </div>
  );
}
