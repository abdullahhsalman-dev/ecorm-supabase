import { Button } from "@/src/app/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Order Confirmation | Lamees",
  description: "Your order has been successfully placed",
};

/*
 * Checkout hands the order id over in the query string. A guest cannot read
 * their own order back — the row is theirs but belongs to no account — so the
 * confirmation is rendered from what the browser already knows rather than
 * from a lookup that would fail for half of all shoppers.
 */
export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  /* The uuid's first block is short enough to read out over the phone. */
  const orderNumber = order ? order.split("-")[0].toUpperCase() : null;

  return (
    <div className=" flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-3">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="mb-4 text-3xl font-bold">Order Placed Successfully!</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Thank you for your order. We&apos;ve received it and will begin
        processing right away. Please have the cash ready for the courier when
        it arrives.
      </p>
      <div className="mb-8 w-full max-w-md rounded-lg border bg-card p-6 text-left">
        <h2 className="mb-4 text-xl font-semibold">Order Details</h2>
        <div className="space-y-2">
          {orderNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-medium">#{orderNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="font-medium">Cash on Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping Method:</span>
            <span className="font-medium">Standard Delivery</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Button asChild>
          <Link href="/account">View Order</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
