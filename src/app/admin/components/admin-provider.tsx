"use client";

/*
 * ---------------------------------------------------------
 * ADMIN PROFILE PROVIDER
 * ---------------------------------------------------------
 *
 * schema.sql defines the role on the users table:
 *
 *   ALTER TABLE users ADD COLUMN user_type VARCHAR(20)
 *     NOT NULL DEFAULT 'user';
 *   CHECK (user_type IN ('admin', 'user'));
 *
 * The admin area is gated on that column instead of guessing
 * a role from the email address. The lookup runs once here so
 * the layout and the header share a single query.
 */

import { useAuth } from "@/src/app/context/auth-context";
import { fetchUserProfileByEmail, isAdminProfile, type UserProfile } from "@/src/app/lib/users";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/* The admin panel reads the same row shape as the storefront. */
export type AdminProfile = UserProfile;

interface AdminProfileState {
  profile: AdminProfile | null;
  /* True while either the auth session or the profile is resolving. */
  loading: boolean;
  /* Set when the users table could not be reached at all. */
  error: string | null;
  isAdmin: boolean;
}

const AdminProfileContext = createContext<AdminProfileState | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  /* Read once, for the same reason as in the account page: reading
     `user?.email` inside the callback makes the compiler infer `user`. */
  const userEmail = user?.email ?? null;

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * Reset the moment the identity changes, during render rather than in
   * the effect below. Signing out has to drop the previous admin's row
   * immediately -- an effect runs after paint, which would leave one
   * frame where the old role still reads as authorised.
   */
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  if (userEmail !== loadedFor) {
    setLoadedFor(userEmail);
    setProfile(null);
    setError(null);
    /* No session means nothing to fetch, so nothing left to wait for. */
    setProfileLoading(userEmail !== null);
  }

  /*
   * The auth session is the source of identity; the users table is the
   * source of the role. Every setState sits behind the await, which is
   * what keeps this effect from cascading a render.
   */
  useEffect(() => {
    if (!userEmail) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const row = await fetchUserProfileByEmail(userEmail);

        if (!cancelled) {
          setProfile(row);
          setError(null);
        }
      } catch (queryError: unknown) {
        console.error("Failed to load admin profile:", queryError);

        if (cancelled) {
          return;
        }

        setProfile(null);
        setError(
          queryError instanceof Error ? queryError.message : "Could not verify your account role."
        );
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  const value = useMemo<AdminProfileState>(
    () => ({
      profile,
      loading: authLoading || profileLoading,
      error,
      isAdmin: isAdminProfile(profile),
    }),
    [profile, authLoading, profileLoading, error]
  );

  return <AdminProfileContext.Provider value={value}>{children}</AdminProfileContext.Provider>;
}

export function useAdminProfile(): AdminProfileState {
  const context = useContext(AdminProfileContext);

  if (context === undefined) {
    throw new Error("useAdminProfile must be used within an AdminProvider");
  }

  return context;
}
