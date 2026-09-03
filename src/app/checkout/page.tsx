"use client";

import type React from "react";

import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/src/app/components/cart-provider";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Separator } from "@/src/app/components/ui/separator";
import { Textarea } from "@/src/app/components/ui/textarea";
import { useAuth } from "@/src/app/context/auth-context";
import { calculateOrderTotals } from "@/src/app/lib/order-totals";
import { formatCurrency, safeImageSrc } from "@/src/app/lib/utils";
import { Banknote } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PAYMENT_METHOD, placeOrder, StockError } from "./queries";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* The summary below and the order row are priced from the same call. */
  const totals = useMemo(() => calculateOrderTotals(cartTotal), [cartTotal]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      /*
       * A guest order carries no user_id. It still reaches the admin Orders
       * screen, where it shows as a Guest customer.
       */
      const orderId = await placeOrder({
        userId: user?.id ?? null,
        customer: formData,
        items,
        paymentMethod: PAYMENT_METHOD,
        totals,
      });

      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. Your order has been received.",
      });

      clearCart();

      /*
       * The id travels in the URL because a guest cannot read their own order
       * back — the confirmation page has no other way to name it.
       */
      router.push(`/checkout/success?order=${orderId}`);
    } catch (error: unknown) {
      console.error("Failed to place order:", error);

      /*
       * Stock ran out between filling the cart and paying. The cart is left
       * alone so the shopper can adjust the lines themselves.
       */
      if (error instanceof StockError) {
        toast({
          title: "Some items are no longer available",
          description: `${error.message.replace(/\.$/, "")}. Please update your cart and try again.`,
          variant: "destructive",
        });

        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Order could not be placed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Your cart has been kept — please try again.",
        variant: "destructive",
      });

      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
        <p className="mb-8 text-gray-600">
          Your cart is empty. Please add items to your cart before checking out.
        </p>
        <Button onClick={() => router.push("/products")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 lg:pr-8">
            <div className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">Contact Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>

                {/*
                  Cash on delivery is the only way to pay, so this
                  states it rather than offering a choice of one.
                  Card and PayPal used to be listed here and were
                  never wired to a processor - every order they
                  produced was unpaid, which is a promise the shop
                  could not keep.
                */}
                <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-4">
                  <Banknote
                    className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="font-medium">Cash on Delivery</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Pay the courier in cash when your order arrives. Please have the exact amount
                      ready.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <Label htmlFor="notes" className="mb-4 block text-xl font-semibold">
                  Order Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Special instructions for delivery or any other notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="h-24"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

              <div className="max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={safeImageSrc(item.image, "/assets/kids.webp")}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>{formatCurrency(totals.shipping)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
