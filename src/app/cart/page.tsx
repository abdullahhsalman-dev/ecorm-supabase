"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, cartTotal, updateItemQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-3xl font-bold">Your Cart</h1>
        <p className="mb-8 text-gray-600">Your cart is currently empty.</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="hidden border-b pb-4 md:grid md:grid-cols-12">
                <div className="col-span-6 font-medium">Product</div>
                <div className="col-span-2 text-center font-medium">Price</div>
                <div className="col-span-2 text-center font-medium">
                  Quantity
                </div>
                <div className="col-span-2 text-right font-medium">Total</div>
              </div>

              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 md:grid md:grid-cols-12 md:items-center md:gap-4"
                  >
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-md bg-muted">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
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
                      <div className="md:hidden text-sm font-medium text-muted-foreground">
                        Price:
                      </div>
                      {formatCurrency(item.price)}
                    </div>

                    <div className="col-span-2 mt-4 flex items-center justify-center md:mt-0">
                      <div className="md:hidden mr-2 text-sm font-medium text-muted-foreground">
                        Quantity:
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
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
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>
                    </div>

                    <div className="col-span-2 mt-4 text-right md:mt-0">
                      <div className="md:hidden text-sm font-medium text-muted-foreground">
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

              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon}
                  >
                    {isApplyingCoupon ? "Applying..." : "Apply"}
                  </Button>
                </div>
              </div>

              <Button asChild className="w-full">
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
