// src/app/hooks/use-auth.ts
"use client";

import { useContext } from "react";
import { AuthContext } from "@/src/app/context/auth-context";
import type { AuthContextType } from "@/src/app/context/auth-context";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext); // Use AuthContext here

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
