/*
 * ---------------------------------------------------------
 * ORDER PRICING
 * ---------------------------------------------------------
 *
 * The storefront's money rules, in one place. The checkout
 * summary and the total_amount written to the orders table
 * both read from here, so the figure a shopper agrees to is
 * the figure that reaches the database and the admin screen.
 */

/** Flat delivery charge on every order, regardless of basket size. */
export const SHIPPING_FEE = 300;

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

/* total_amount is DECIMAL(10, 2), so nothing finer than a paisa survives. */
const toMoney = (amount: number): number => Math.round(amount * 100) / 100;

export function calculateOrderTotals(subtotal: number): OrderTotals {
  const roundedSubtotal = toMoney(subtotal);

  return {
    subtotal: roundedSubtotal,
    shipping: SHIPPING_FEE,
    total: toMoney(roundedSubtotal + SHIPPING_FEE),
  };
}
