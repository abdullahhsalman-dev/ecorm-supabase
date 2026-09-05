"use client";

/*
 * ---------------------------------------------------------
 * ORDER TRACKING
 * ---------------------------------------------------------
 *
 * Reads the status of one order for the person who placed it.
 *
 * Goes through the track_order function (migrations/002)
 * rather than the table: a guest order has no user_id, so
 * `orders_select_own_or_admin` makes it readable by staff
 * alone. The function checks the order id against the email it
 * was placed with, and returns status fields only.
 */

import { createClient } from "@/src/app/lib/supabase/client";

export { parseOrderReference, toOrderNumber } from "@/src/app/lib/order-number";

export interface TrackedOrder {
  id: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
  totalAmount: number;
  placedAt: string;
  updatedAt: string;
}

/*
 * PostgREST answers a missing function with its own PGRST202
 * rather than Postgres' 42883, so both are checked - the
 * former is what actually comes back over the REST API, the
 * latter is what surfaces if the call ever runs closer to the
 * database.
 */
const MISSING_FUNCTION_CODES = new Set(["PGRST202", "42883"]);

export class TrackingUnavailableError extends Error {
  constructor() {
    super("Order tracking is not set up yet. Please contact us and we will check for you.");
    this.name = "TrackingUnavailableError";
  }
}

/**
 * The order, or null when the reference and email do not go
 * together.
 *
 * `reference` is whatever parseOrderReference resolved: the
 * short number the customer was shown, or a full uuid.
 *
 * Null covers both "no such order" and "wrong email" on
 * purpose: telling them apart would confirm to a stranger that
 * an order number is real.
 */
export async function trackOrder(reference: string, email: string): Promise<TrackedOrder | null> {
  const { data, error } = await createClient().rpc("track_order", {
    p_reference: reference,
    p_email: email.trim(),
  });

  if (error) {
    if (MISSING_FUNCTION_CODES.has(error.code)) {
      throw new TrackingUnavailableError();
    }

    throw error;
  }

  const row = (data as unknown as Record<string, unknown>[] | null)?.[0];

  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    status: String(row.status ?? "pending"),
    paymentStatus: String(row.payment_status ?? "pending"),
    trackingNumber: (row.tracking_number as string | null) ?? null,
    totalAmount: Number(row.total_amount) || 0,
    placedAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
