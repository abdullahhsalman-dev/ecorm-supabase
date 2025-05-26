// src/app/context/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/src/app/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  console.log("AuthProvider rendering"); // Debug log

  useEffect(() => {
    console.log("AuthProvider useEffect running"); // Debug log
    let subscription: ReturnType<
      typeof supabase.auth.onAuthStateChange
    >["data"]["subscription"];

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Auth state changed:", session?.user?.email || "null"); // Debug log
        setUser(session?.user || null);
      });

      subscription = data.subscription;
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (!error) {
      const { error: profileError } = await supabase.from("users").insert([
        {
          email,
          full_name: fullName,
          password_hash: "managed_by_supabase_auth",
        },
      ]);

      if (profileError) return { error: profileError };
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthContext };
