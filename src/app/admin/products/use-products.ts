"use client";

/*
 * ---------------------------------------------------------
 * PRODUCTS LIST STATE
 * ---------------------------------------------------------
 *
 * Fetching and cancellation come from useAsyncData; the
 * category list comes from the shared useCategories hook, so
 * this file is only filters and the delete path.
 */

import { useToast } from "@/hooks/use-toast";
import { useAsyncData } from "@/src/app/lib/use-async-data";
import { useCallback, useMemo, useState } from "react";
import { getErrorMessage, LOW_STOCK_THRESHOLD } from "../components/admin-ui";
import { useCategories } from "../lib/use-categories";
import { deleteProduct, fetchProducts } from "./queries";
import type { Product, StockFilter } from "./types";

const NO_PRODUCTS: Product[] = [];

const matchesStockFilter = (stock: number, filter: StockFilter): boolean => {
  switch (filter) {
    case "out":
      return stock === 0;
    case "low":
      return stock > 0 && stock < LOW_STOCK_THRESHOLD;
    case "in":
      return stock >= LOW_STOCK_THRESHOLD;
    default:
      return true;
  }
};

export function useProducts() {
  const { toast } = useToast();

  const {
    categories,
    loading: loadingCategories,
    reload: reloadCategories,
  } = useCategories();

  const onError = useCallback(
    (error: unknown) => {
      console.error("Failed to load products:", error);

      toast({
        title: "Failed to load products",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    [toast],
  );

  const {
    data: products,
    loading: loadingProducts,
    reload: reloadProducts,
    setData: setProducts,
  } = useAsyncData(fetchProducts, { fallback: NO_PRODUCTS, onError });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const loadData = useCallback((): void => {
    reloadCategories();
    reloadProducts();
  }, [reloadCategories, reloadProducts]);

  const removeProduct = useCallback(
    async (id: string, name: string): Promise<void> => {
      if (deletingId !== null) {
        return;
      }

      if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
      }

      setDeletingId(id);

      try {
        await deleteProduct(id);

        /* Drop the row locally rather than refetching the table. */
        setProducts((current) =>
          current.filter((product) => product.id !== id),
        );

        toast({
          title: "Product deleted",
          description: `"${name}" has been deleted successfully.`,
        });
      } catch (error: unknown) {
        console.error("Product delete error:", error);

        toast({
          title: "Delete failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, setProducts, toast],
  );

  const filteredProducts = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return products.filter(
      (product) =>
        (search === "" ||
          product.name.toLowerCase().includes(search) ||
          product.slug.toLowerCase().includes(search)) &&
        (categoryFilter === "all" || product.category_id === categoryFilter) &&
        matchesStockFilter(product.stock_quantity, stockFilter),
    );
  }, [products, searchQuery, categoryFilter, stockFilter]);

  return {
    products,
    categories,
    filteredProducts,
    loading: loadingProducts || loadingCategories,
    deletingId,
    loadData,
    removeProduct,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
  };
}
