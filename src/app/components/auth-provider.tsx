"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
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
        setUser(session?.user || null);
      });

      subscription = data.subscription;
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // If signup is successful, create a user record in the users table
    if (!error) {
      // This would typically be handled by a Supabase function trigger
      // But we'll include the logic here for completeness
      const { error: profileError } = await supabase.from("users").insert([
        {
          email,
          full_name: fullName,
          // Note: We don't store the password here as it's handled by Supabase Auth
          password_hash: "managed_by_supabase_auth",
        },
      ]);

      if (profileError) {
        return { error: profileError };
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
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
// export { AuthProvider };
