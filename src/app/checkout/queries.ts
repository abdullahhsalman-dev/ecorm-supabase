/*
 * ---------------------------------------------------------
 * CHECKOUT DATA ACCESS
 * ---------------------------------------------------------
 *
 * Turns a cart into rows in `orders` and `order_items` — the
 * same two tables the admin Orders screen reads back. Throws
 * on failure, returns the new order id. No React here.
 */

import { createClient } from "@/src/app/lib/supabase/client";
import type { CartItem } from "@/src/app/components/cart-provider";
import type { OrderTotals } from "@/src/app/lib/order-totals";

/** The delivery details collected by the checkout form. */
export interface CheckoutCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
}

/*
 * The only way to pay. This value is what lands in
 * orders.payment_method, and it deliberately matches the "cod"
 * option in the admin's PAYMENT_METHODS - checkout used to
 * write "cash-on-delivery", which that dropdown did not
 * recognise, so every placed order showed a blank method.
 */
export const PAYMENT_METHOD = "cod";

export interface PlaceOrderInput {
  /** The signed-in shopper, or null for a guest order. */
  userId: string | null;
  customer: CheckoutCustomer;
  items: CartItem[];
  paymentMethod: string;
  totals: OrderTotals;
}

/*
 * shipping_address is a single TEXT column, and the admin drawer prints it
 * verbatim — so the parts are joined into an address block rather than a
 * one-line string.
 */
export function formatShippingAddress(customer: CheckoutCustomer): string {
  const name = `${customer.firstName} ${customer.lastName}`.trim();

  const region = [customer.city, customer.state, customer.postalCode]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  return [name, customer.address.trim(), region, customer.country.trim()]
    .filter(Boolean)
    .join("\n");
}

/*
 * A guest leaves no users row, so their contact details would otherwise be lost
 * with the form state. They ride along in `notes`, which is the only free-text
 * column on the order.
 */
function buildNotes(
  customer: CheckoutCustomer,
  userId: string | null,
): string | null {
  const lines: string[] = [];

  if (!userId) {
    lines.push(`Guest contact: ${customer.email} / ${customer.phone}`);
  }

  if (customer.notes.trim()) {
    lines.push(customer.notes.trim());
  }

  return lines.length > 0 ? lines.join("\n\n") : null;
}

export async function placeOrder({
  userId,
  customer,
  items,
  paymentMethod,
  totals,
}: PlaceOrderInput): Promise<string> {
  if (items.length === 0) {
    throw new Error("Cannot place an order with an empty cart.");
  }

  const supabase = createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pending",
      total_amount: totals.total,
      shipping_address: formatShippingAddress(customer),
      billing_address: null,
      payment_method: paymentMethod,
      /*
       * Nothing has been captured yet. Cash on delivery is settled by the
       * courier and the card flow is not wired to a processor, so every order
       * starts unpaid and the admin marks it paid.
       */
      payment_status: "pending",
      notes: buildNotes(customer, userId),
    })
    .select("id")
    .single();

  if (orderError) {
    throw orderError;
  }

  const orderId = order.id as string;

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      /*
       * order_items holds one variant per line while a cart line can carry
       * several (size *and* colour). The first is recorded; the full
       * configuration stays readable in the product name on the line.
       */
      product_variant_id: item.variantIds[0] ?? null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: Math.round(item.price * item.quantity * 100) / 100,
    })),
  );

  if (itemsError) {
    /*
     * An order with no lines is worse than no order: it shows up in admin as a
     * sale nobody can fulfil. Roll the header back before surfacing the error.
     */
    await supabase.from("orders").delete().eq("id", orderId);

    throw itemsError;
  }

  return orderId;
}
