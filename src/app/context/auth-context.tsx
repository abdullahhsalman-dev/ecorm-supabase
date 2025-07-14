// src/app/context/auth-provider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/src/app/lib/supabase/client";
import type { User, AuthError } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";

// Type definitions
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: AuthError | PostgrestError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
};

// Create context with proper typing
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Session error:", error);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Auth signup
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (authError) return { error: authError };

      // Create user profile
      const { error: profileError } = await supabase
        .from("users")
        .insert([{ email, full_name: fullName }]);

      return { error: profileError };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error: error as PostgrestError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      return { error };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error: error as AuthError };
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
export { AuthContext };

// Export the hook directly from this file
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
