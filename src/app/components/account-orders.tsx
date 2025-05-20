"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { formatCurrency } from "@/lib/utils";
import { getDummyOrders } from "@/lib/dummy-data";

export function AccountOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        // Use dummy data if no user
        setOrders(getDummyOrders());
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          // Use dummy data on error
          setOrders(getDummyOrders());
          return;
        }

        if (data && data.length > 0) {
          setOrders(data);
        } else {
          // No data found, use dummy data
          setOrders(getDummyOrders());
        }
      } catch (error) {
        console.error("Error in fetchOrders:", error);
        // Use dummy data on error
        setOrders(getDummyOrders());
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-card p-6"
            >
              <div className="mb-4 h-6 w-1/4 rounded bg-muted"></div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-3/4 rounded bg-muted"></div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order: any) => (
        <div key={order.id} className="rounded-lg border bg-card">
          <div className="flex flex-col justify-between border-b p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">
                Order #
                {typeof order.id === "string"
                  ? order.id.substring(0, 8)
                  : order.id}
              </p>
              <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-2 flex items-center sm:mt-0">
              <Badge
                variant={
                  order.status === "delivered"
                    ? "success"
                    : order.status === "processing"
                    ? "default"
                    : order.status === "cancelled"
                    ? "destructive"
                    : "outline"
                }
                className="mr-2"
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/account/orders/${order.id}`}>
                  <Eye className="mr-1 h-4 w-4" />
                  View
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <span className="font-medium">{order.payment_status}</span>
            </div>
            {order.tracking_number && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking Number:</span>
                <span className="font-medium">{order.tracking_number}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
