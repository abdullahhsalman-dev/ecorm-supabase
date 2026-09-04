"use client";

import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: string | null): value is Theme =>
  value === "light" || value === "dark" || value === "system";

/*
 * ---------------------------------------------------------
 * THE STORED PREFERENCE
 * ---------------------------------------------------------
 *
 * localStorage is external state: it exists only on the client, and a
 * second tab can change it underneath us. Reading it through
 * useSyncExternalStore is what lets the value arrive on mount without
 * an effect writing state - the server snapshot is null, so hydration
 * renders the default and React re-renders once with the real value.
 */

const listeners = new Set<() => void>();

/* Same-tab writes don't raise a storage event, so announce them. */
const announceThemeChange = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

const subscribeStoredTheme = (onChange: () => void): (() => void) => {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

/* Blocked storage (private mode, embedded webviews) reads as "unset". */
const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
};

const noStoredTheme = (): Theme | null => null;

const subscribeSystemTheme = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
};

const readSystemPrefersDark = (): boolean => window.matchMedia(DARK_QUERY).matches;

const noSystemPreference = (): boolean => false;

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = false,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const storedTheme = useSyncExternalStore(subscribeStoredTheme, readStoredTheme, noStoredTheme);

  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemTheme,
    enableSystem ? readSystemPrefersDark : noSystemPreference,
    noSystemPreference
  );

  /* A choice made this session outranks whatever was stored before it. */
  const [chosenTheme, setChosenTheme] = useState<Theme | null>(null);

  const theme: Theme = chosenTheme ?? storedTheme ?? defaultTheme;

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (enableSystem && systemPrefersDark ? "dark" : "light") : theme;

  /*
   * The class on <html> is the only real output here, and writing it is
   * a DOM side effect, so it stays in an effect - one place, rather than
   * the three the previous version kept in sync by hand.
   */
  useEffect(() => {
    if (attribute !== "class") {
      return;
    }

    const root = document.documentElement;

    if (disableTransitionOnChange) {
      root.style.transition = "none";
    }

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    if (!disableTransitionOnChange) {
      return;
    }

    /* Let the class land before transitions are allowed back. */
    const restore = window.setTimeout(() => {
      root.style.transition = "";
    }, 0);

    return () => window.clearTimeout(restore);
  }, [attribute, resolvedTheme, disableTransitionOnChange]);

  const setTheme = useCallback((next: Theme) => {
    setChosenTheme(next);

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* An unwritable store just means the choice lasts this session. */
    }

    announceThemeChange();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
