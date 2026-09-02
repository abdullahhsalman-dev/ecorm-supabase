"use client";

/*
 * ---------------------------------------------------------
 * useCategories
 * ---------------------------------------------------------
 *
 * The categories list feeds the Categories screen, the product
 * form's picker and the bulk importer. All three read it
 * through this hook so there is one query and one error path.
 */

import { useToast } from "@/hooks/use-toast";
import {
  fetchCategories,
  type CategoryRecord,
} from "@/src/app/lib/categories";
import { useAsyncData } from "@/src/app/lib/use-async-data";
import { useCallback } from "react";
import { getErrorMessage } from "../components/admin-ui";

const NO_CATEGORIES: CategoryRecord[] = [];

export function useCategories() {
  const { toast } = useToast();

  const onError = useCallback(
    (error: unknown) => {
      console.error("Failed to load categories:", error);

      toast({
        title: "Failed to load categories",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
    [toast],
  );

  const {
    data: categories,
    loading,
    reload,
    setData,
  } = useAsyncData(fetchCategories, {
    fallback: NO_CATEGORIES,
    onError,
  });

  return { categories, loading, reload, setCategories: setData };
}

export type { CategoryRecord };
