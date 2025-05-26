"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/app/components/ui/radio-group";
import { Separator } from "@/src/app/components/ui/separator";
import { Textarea } from "@/src/app/components/ui/textarea";
import { useCart } from "@/src/app/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/src/app/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call for order processing
    setTimeout(() => {
      toast({
        title: "Order placed successfully!",
        description:
          "Thank you for your purchase. Your order has been received.",
      });
      clearCart();
      router.push("/checkout/success");
      setIsSubmitting(false);
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
        <p className="mb-8 text-gray-600">
          Your cart is empty. Please add items to your cart before checking out.
        </p>
        <Button onClick={() => router.push("/products")}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 lg:pr-8">
            <div className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Contact Information
                </h2>
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
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label
                      htmlFor="credit-card"
                      className="flex-1 cursor-pointer"
                    >
                      Credit Card
                    </Label>
                    <div className="flex space-x-1">
                      <img
                        src="/public/assets/kids.webp"
                        alt="Visa"
                        className="h-6"
                      />
                      <img
                        src="/public/assets/kids.webp"
                        alt="Mastercard"
                        className="h-6"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      PayPal
                    </Label>
                    <img
                      src="/public/assets/kids.webp"
                      alt="PayPal"
                      className="h-6"
                    />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem
                      value="cash-on-delivery"
                      id="cash-on-delivery"
                    />
                    <Label
                      htmlFor="cash-on-delivery"
                      className="cursor-pointer"
                    >
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Order Notes */}
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Order Notes (Optional)
                </h2>
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
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center">
                      <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                        <img
                          src={item.image || "/public/assets/kids.webp"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(cartTotal > 5000 ? 0 : 500)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax (5%)</span>
                  <span>{formatCurrency(cartTotal * 0.05)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-medium">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      cartTotal +
                        (cartTotal > 5000 ? 0 : 500) +
                        cartTotal * 0.05
                    )}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="mt-6 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                By placing your order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
