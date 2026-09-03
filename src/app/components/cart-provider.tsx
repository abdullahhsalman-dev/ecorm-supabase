"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";

/**
 * A line in the cart.
 *
 * `id` is the line key: a product on its own uses the product uuid, and a
 * product configured with variants appends them ("<product>-<variant>-…") so
 * two sizes of the same shirt stay separate lines.
 *
 * `productId` and `variantIds` carry those uuids on their own because checkout
 * writes them to order_items.product_id / product_variant_id, and the composite
 * key cannot be split back apart reliably — uuids contain hyphens themselves.
 */
export type CartItem = {
  id: string;
  productId: string;
  variantIds: string[];
  name: string;
  price: number;
  image: string;
  quantity: number;
  /*
   * How many of this line the shop had when it was added: the variant stock
   * when one is configured, otherwise products.stock_quantity. null means a
   * cart saved before the field existed, where the ceiling is unknown.
   *
   * This is a convenience for the UI, never the authority - it is a snapshot
   * taken client-side, so checkout re-reads the real figure before writing
   * the order.
   */
  maxQuantity: number | null;
};

/* What addItem could take versus what it actually took. */
export type AddItemResult = {
  requested: number;
  added: number;
  /* True when stock is what stopped the rest going in. */
  capped: boolean;
};

type CartContextType = {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addItem: (item: CartItem) => AddItemResult;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const UUID_LENGTH = 36;

/**
 * Recovers the uuids from a line key, for carts saved before the line carried
 * them. The key is fixed-width segments joined by a hyphen, so it splits by
 * offset rather than by separator.
 */
function splitLineId(lineId: string): {
  productId: string;
  variantIds: string[];
} {
  const segments: string[] = [];

  for (let start = 0; start < lineId.length; start += UUID_LENGTH + 1) {
    segments.push(lineId.slice(start, start + UUID_LENGTH));
  }

  const [productId, ...variantIds] = segments;

  return { productId: productId ?? lineId, variantIds };
}

/**
 * A stored cart is whatever an older build of the site left in localStorage, so
 * it is treated as untrusted input: anything without a usable line key is
 * dropped, and the uuids are backfilled from the key when absent.
 */
function normaliseStoredItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Partial<CartItem>;

  if (typeof item.id !== "string" || !item.id) {
    return null;
  }

  const recovered = splitLineId(item.id);

  return {
    id: item.id,
    productId:
      typeof item.productId === "string" && item.productId ? item.productId : recovered.productId,
    variantIds: Array.isArray(item.variantIds)
      ? item.variantIds.filter((variantId): variantId is string => typeof variantId === "string")
      : recovered.variantIds,
    name: typeof item.name === "string" ? item.name : "",
    price: Number(item.price) || 0,
    image: typeof item.image === "string" ? item.image : "",
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    maxQuantity:
      typeof item.maxQuantity === "number" && Number.isFinite(item.maxQuantity)
        ? Math.max(0, Math.floor(item.maxQuantity))
        : null,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /*
   * Hydrate from localStorage on mount. This has to be an effect: the store
   * does not exist during the server render, so the first client render must
   * match the server's empty cart and adopt the saved one immediately after.
   */
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsed: unknown = JSON.parse(storedCart);

        /* eslint-disable-next-line react-hooks/set-state-in-effect */
        setItems(
          Array.isArray(parsed)
            ? parsed.map(normaliseStoredItem).filter((item): item is CartItem => item !== null)
            : []
        );
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      localStorage.removeItem("cart");
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items));
    } else {
      localStorage.removeItem("cart");
    }
  }, [items]);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  /*
   * Adds up to what stock allows and reports what happened, so the caller can
   * say "only 2 left" rather than silently banking a quantity that cannot be
   * fulfilled. The ceiling counts what is already in the cart: adding 3 twice
   * to a line with 4 in stock lands on 4, not 6.
   */
  const addItem = (newItem: CartItem): AddItemResult => {
    const requested = Math.max(1, Math.floor(newItem.quantity));
    const existing = items.find((item) => item.id === newItem.id);
    const inCart = existing?.quantity ?? 0;

    const limit = newItem.maxQuantity;
    const room = limit === null ? requested : Math.max(0, limit - inCart);
    const added = Math.min(requested, room);

    if (added > 0) {
      setItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);

        if (existingItemIndex > -1) {
          const updatedItems = [...prevItems];
          const current = updatedItems[existingItemIndex];

          /*
           * Clamped again against the state being updated, not the render
           * this handler closed over: two clicks in one tick both compute
           * their headroom from the same stale `items`.
           */
          const total = current.quantity + added;

          updatedItems[existingItemIndex] = {
            ...current,
            quantity: limit === null ? total : Math.min(total, limit),
            /* The fresher reading of stock wins. */
            maxQuantity: limit,
          };

          return updatedItems;
        }

        return [...prevItems, { ...newItem, quantity: added }];
      });
    }

    return { requested, added, capped: added < requested };
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          /* Never let the line exceed the stock it was added against. */
          const capped =
            item.maxQuantity === null ? quantity : Math.min(quantity, item.maxQuantity);

          return { ...item, quantity: capped };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export { CartContext };
