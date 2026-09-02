"use client";

/*
 * ---------------------------------------------------------
 * useReviewStats
 * ---------------------------------------------------------
 *
 * The rating summary for a grid of products, fetched once for
 * the whole grid rather than once per card - a listing page
 * showing 24 products would otherwise open 24 connections to
 * say "no reviews yet" 24 times.
 *
 * Products with no reviews are absent from the map, so read it
 * through statsFor() below.
 */

import { useCallback, useMemo } from "react";

import {
  EMPTY_REVIEW_STATS,
  fetchReviewStatsByProduct,
  type ReviewStats,
} from "@/src/app/lib/reviews";
import { useAsyncData } from "@/src/app/lib/use-async-data";

export type ReviewStatsMap = ReadonlyMap<string, ReviewStats>;

/* One shared empty map, so the fallback never retriggers a render. */
const NO_STATS: ReviewStatsMap = new Map<string, ReviewStats>();

export function useReviewStats(productIds: string[]): ReviewStatsMap {
  /*
   * The array is rebuilt on every render by its caller, so the
   * fetcher keys off the ids themselves rather than the array
   * identity - otherwise the effect would loop.
   */
  const key = useMemo(() => productIds.join(","), [productIds]);

  const fetcher = useCallback(() => fetchReviewStatsByProduct(key ? key.split(",") : []), [key]);

  const { data } = useAsyncData<ReviewStatsMap>(fetcher, {
    fallback: NO_STATS,
    enabled: key.length > 0,
    /* A missing star row is not worth breaking a product grid over. */
    onError: (error) => console.error("Could not read review stats:", error),
  });

  return data;
}

/* Reads the map with "no reviews yet" as the default. */
export const statsFor = (stats: ReviewStatsMap | undefined, productId: string): ReviewStats =>
  stats?.get(productId) ?? EMPTY_REVIEW_STATS;
