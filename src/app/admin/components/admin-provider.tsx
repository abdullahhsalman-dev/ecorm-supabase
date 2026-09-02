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
import {
  fetchUserProfileByEmail,
  isAdminProfile,
  type UserProfile,
} from "@/src/app/lib/users";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

const AdminProfileContext = createContext<AdminProfileState | undefined>(
  undefined,
);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    /*
     * The auth session is the source of identity; the users
     * table is the source of the role.
     */
    if (!user?.email) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    try {
      setProfile(await fetchUserProfileByEmail(user.email));
      setError(null);
    } catch (queryError: unknown) {
      console.error("Failed to load admin profile:", queryError);

      setProfile(null);
      setError(
        queryError instanceof Error
          ? queryError.message
          : "Could not verify your account role.",
      );
    } finally {
      setProfileLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const value = useMemo<AdminProfileState>(
    () => ({
      profile,
      loading: authLoading || profileLoading,
      error,
      isAdmin: isAdminProfile(profile),
    }),
    [profile, authLoading, profileLoading, error],
  );

  return (
    <AdminProfileContext.Provider value={value}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile(): AdminProfileState {
  const context = useContext(AdminProfileContext);

  if (context === undefined) {
    throw new Error("useAdminProfile must be used within an AdminProvider");
  }

  return context;
}
