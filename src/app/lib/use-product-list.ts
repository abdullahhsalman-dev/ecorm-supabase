"use client";

/*
 * ---------------------------------------------------------
 * useProductList
 * ---------------------------------------------------------
 *
 * The featured strip, the related rail and the category grid
 * each held their own copy of "query products, map the rows,
 * swallow the error, clear the spinner". They now describe
 * what they want and let this hook run it.
 */

import {
  fetchStorefrontProducts,
  type ProductQuery,
  type StorefrontProduct,
} from "@/src/app/lib/products";
import { useAsyncData } from "@/src/app/lib/use-async-data";
import { useCallback } from "react";

const NO_PRODUCTS: StorefrontProduct[] = [];

interface UseProductListOptions extends ProductQuery {
  /* False keeps the hook idle, e.g. a rail with no category. */
  enabled?: boolean;
  /* Message prefix for the console when the query fails. */
  label?: string;
}

export function useProductList({
  enabled = true,
  label = "products",
  ...query
}: UseProductListOptions = {}) {
  /*
   * Serialising the filters keeps the fetcher stable across
   * renders that pass a fresh but equal options object.
   */
  const queryKey = JSON.stringify(query);

  const fetcher = useCallback(
    () => fetchStorefrontProducts(JSON.parse(queryKey) as ProductQuery),
    [queryKey],
  );

  const onError = useCallback(
    (error: unknown) => {
      console.error(`Error fetching ${label}:`, error);
    },
    [label],
  );

  const { data, loading, error, reload } = useAsyncData(fetcher, {
    fallback: NO_PRODUCTS,
    enabled,
    onError,
  });

  return { products: data, loading, error, reload };
}
