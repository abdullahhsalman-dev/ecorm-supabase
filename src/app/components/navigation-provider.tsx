"use client";

/**
 * Loads the `categories` table once per page and hands the built navigation
 * tree to both menus.
 *
 * The desktop mega menu and the mobile drawer are siblings under the header;
 * without this context each would run its own copy of the query.
 */

import {
  buildNavCategories,
  type NavCategory,
} from "@/src/app/lib/navigation";
import { fetchCategories, type CategoryRecord } from "@/src/app/lib/categories";
import { useAsyncData } from "@/src/app/lib/use-async-data";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";

interface NavigationState {
  categories: NavCategory[];
  loading: boolean;
}

const NO_CATEGORIES: CategoryRecord[] = [];

const NavigationContext = createContext<NavigationState>({
  categories: [],
  loading: false,
});

export function NavigationProvider({ children }: { children: ReactNode }) {
  const onError = useCallback((error: unknown) => {
    /* The header still renders; it just has no departments in it. */
    console.error("Could not load navigation categories:", error);
  }, []);

  const { data, loading } = useAsyncData(fetchCategories, {
    fallback: NO_CATEGORIES,
    onError,
  });

  const value = useMemo<NavigationState>(
    () => ({ categories: buildNavCategories(data), loading }),
    [data, loading],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationState {
  return useContext(NavigationContext);
}
