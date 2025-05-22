"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

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

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = false,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    defaultTheme === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    let initialTheme: Theme = storedTheme || defaultTheme;

    if (enableSystem && (!storedTheme || initialTheme === "system")) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      initialTheme = prefersDark ? "dark" : "light";
    }

    setTheme(initialTheme);

    const resolved: "light" | "dark" =
      initialTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : (initialTheme as "light" | "dark");

    setResolvedTheme(resolved);

    if (attribute === "class") {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolved);
    }
  }, [attribute, defaultTheme, enableSystem]);

  useEffect(() => {
    if (!enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newResolvedTheme: "light" | "dark" = mediaQuery.matches
        ? "dark"
        : "light";
      setResolvedTheme(newResolvedTheme);
      if (attribute === "class") {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(newResolvedTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, attribute]);

  const handleSetTheme = (newTheme: Theme) => {
    const resolved: "light" | "dark" =
      newTheme === "system" && enableSystem
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : (newTheme as "light" | "dark");

    setTheme(newTheme);
    setResolvedTheme(resolved);
    localStorage.setItem("theme", newTheme);

    if (attribute === "class") {
      if (disableTransitionOnChange) {
        document.documentElement.style.transition = "none";
      }
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolved);
      if (disableTransitionOnChange) {
        setTimeout(() => {
          document.documentElement.style.transition = "";
        }, 0);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme: handleSetTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
