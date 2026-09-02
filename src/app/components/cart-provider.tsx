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
};

type CartContextType = {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  addItem: (item: CartItem) => void;
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
      typeof item.productId === "string" && item.productId
        ? item.productId
        : recovered.productId,
    variantIds: Array.isArray(item.variantIds)
      ? item.variantIds.filter(
          (variantId): variantId is string => typeof variantId === "string",
        )
      : recovered.variantIds,
    name: typeof item.name === "string" ? item.name : "",
    price: Number(item.price) || 0,
    image: typeof item.image === "string" ? item.image : "",
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on client side
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsed: unknown = JSON.parse(storedCart);

        setItems(
          Array.isArray(parsed)
            ? parsed
                .map(normaliseStoredItem)
                .filter((item): item is CartItem => item !== null)
            : [],
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

  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + newItem.quantity,
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add it
        return [...prevItems, newItem];
      }
    });
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems
        .map((item) => (item.id === id ? { ...item, quantity } : item))
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
