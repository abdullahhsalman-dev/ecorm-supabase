import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";

export const metadata = {
  title: "Order Confirmation | Diners",
  description: "Your order has been successfully placed",
};

export default function OrderSuccessPage() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-3">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="mb-4 text-3xl font-bold">Order Placed Successfully!</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Thank you for your purchase. We've received your order and will begin
        processing it right away. You'll receive a confirmation email shortly.
      </p>
      <div className="mb-8 w-full max-w-md rounded-lg border bg-card p-6 text-left">
        <h2 className="mb-4 text-xl font-semibold">Order Details</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Number:</span>
            <span className="font-medium">
              #ORD-{Math.floor(100000 + Math.random() * 900000)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-medium">Credit Card</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping Method:</span>
            <span className="font-medium">Standard Delivery</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Button asChild>
          <Link href="/account/orders">View Order</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
