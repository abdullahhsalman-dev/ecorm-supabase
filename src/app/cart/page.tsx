"use client";

import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/src/app/components/cart-provider";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Separator } from "@/src/app/components/ui/separator";
import { calculateOrderTotals } from "@/src/app/lib/order-totals";
import { formatCurrency, safeImageSrc } from "@/src/app/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function CartPage() {
  const { items, cartTotal, updateItemQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  /* Same rules the checkout and the order row use. */
  const totals = useMemo(() => calculateOrderTotals(cartTotal), [cartTotal]);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;

    const item = items.find((line) => line.id === id);

    /*
     * The provider caps this anyway; saying so here is what stops the click
     * looking like it did nothing.
     */
    if (item && item.maxQuantity !== null && quantity > item.maxQuantity) {
      toast({
        title: "Limited stock",
        description: `Only ${item.maxQuantity} of ${item.name} ${
          item.maxQuantity === 1 ? "is" : "are"
        } available.`,
        variant: "destructive",
      });
      return;
    }

    updateItemQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id);
    toast({
      title: "Item removed",
      description: `${name} has been removed from your cart.`,
    });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Invalid coupon",
        description: "The coupon code you entered is invalid or expired.",
        variant: "destructive",
      });
      setIsApplyingCoupon(false);
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
        <p className="mb-8 text-gray-600">Your cart is currently empty.</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="hidden border-b pb-4 md:grid md:grid-cols-12">
                <div className="col-span-6 font-medium">Product</div>
                <div className="col-span-2 text-center font-medium">Price</div>
                <div className="col-span-2 text-center font-medium">Quantity</div>
                <div className="col-span-2 text-right font-medium">Total</div>
              </div>

              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 md:grid md:grid-cols-12 md:items-center md:gap-4"
                  >
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={safeImageSrc(item.image)}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-auto p-0 text-sm text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="col-span-2 mt-4 text-center md:mt-0">
                      <div className="text-sm font-medium text-muted-foreground md:hidden">
                        Price:
                      </div>
                      {formatCurrency(item.price)}
                    </div>

                    <div className="col-span-2 mt-4 flex items-center justify-center md:mt-0">
                      <div className="mr-2 text-sm font-medium text-muted-foreground md:hidden">
                        Quantity:
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <div className="flex h-8 w-10 items-center justify-center border-y border-input bg-background text-sm">
                          {item.quantity}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.maxQuantity !== null && item.quantity >= item.maxQuantity}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>

                      {item.maxQuantity !== null && item.quantity >= item.maxQuantity ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Max {item.maxQuantity} available
                        </p>
                      ) : null}
                    </div>

                    <div className="col-span-2 mt-4 text-right md:mt-0">
                      <div className="text-sm font-medium text-muted-foreground md:hidden">
                        Total:
                      </div>
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              {/*
                Delivery is a flat charge, so the cart can show the
                real total rather than deferring it to checkout and
                surprising the shopper there.
              */}
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>{formatCurrency(totals.shipping)}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleApplyCoupon} disabled={isApplyingCoupon}>
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </Button>
                </div>
              </div>

              <Button asChild variant="brand" className="w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Secure checkout powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
