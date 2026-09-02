/*
 * ---------------------------------------------------------
 * USER PROFILE QUERIES
 * ---------------------------------------------------------
 *
 * The sign-in redirect, the admin role guard and the signup
 * profile sync each looked up `users` by email with their own
 * projection. One reader keeps the role check identical
 * everywhere.
 *
 * Mirrors schema.sql: users (email, full_name, phone,
 * user_type).
 */

import { createClient } from "@/src/app/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  user_type: string | null;
}

export const ADMIN_USER_TYPE = "admin";

/* Addresses are stored lowercased, so lookups must match. */
export const normaliseEmail = (email: string): string =>
  email.trim().toLowerCase();

export async function fetchUserProfileByEmail(
  email: string,
): Promise<UserProfile | null> {
  const { data, error } = await createClient()
    .from("users")
    .select("id, email, full_name, phone, user_type")
    .eq("email", normaliseEmail(email))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as UserProfile | null) ?? null;
}

export const isAdminProfile = (profile: UserProfile | null): boolean =>
  profile?.user_type === ADMIN_USER_TYPE;

export interface ProfileUpdate {
  fullName: string;
  phone: string | null;
}

/**
 * Saves the account page's profile form.
 *
 * Email is deliberately absent: it is the Auth identity, and the form shows it
 * disabled for that reason. `users_update_own` in schema.sql permits this write
 * but pins user_type, so a shopper cannot promote themselves here.
 */
export async function updateUserProfile(
  userId: string,
  { fullName, phone }: ProfileUpdate,
): Promise<void> {
  const { error } = await createClient()
    .from("users")
    .update({
      full_name: fullName.trim(),
      phone: phone?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}
