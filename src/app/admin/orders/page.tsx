"use client";

import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/src/app/components/ui/badge";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/app/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/app/components/ui/sheet";
import { createClient } from "@/src/app/lib/supabase/client";
import {
  ClipboardList,
  Eye,
  FileText,
  MapPin,
  Search,
  Truck,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface Order {
  id: string;
  user_id: string | null;
  status: string;
  total_amount: number;
  shipping_address: string;
  billing_address: string | null;
  payment_method: string | null;
  payment_status: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: {
    name: string;
    slug: string;
  } | null;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Manage Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form Fields for Editing Order
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const supabase = createClient();

  const loadOrders = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const { data: dbOrders, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (orderErr) throw orderErr;

      if (dbOrders && dbOrders.length > 0) {
        // 2. Fetch User profiles to append customer names
        const userIds = dbOrders.map((o) => o.user_id).filter(Boolean);
        const userMap: Record<
          string,
          { name: string; email: string; phone: string }
        > = {};

        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, full_name, email, phone")
            .in("id", userIds);

          usersData?.forEach((u) => {
            userMap[u.id as string] = {
              name: String(u.full_name || "Guest Customer"),
              email: String(u.email || ""),
              phone: String(u.phone || ""),
            };
          });
        }

        const formatted = dbOrders.map((o) => {
          const userId = o.user_id as string;

          return {
            ...o,
            total_amount: Number(o.total_amount),
            customer_name: userMap[userId]?.name || "Guest Customer",
            customer_email: userMap[userId]?.email || "guest@example.com",
            customer_phone: userMap[userId]?.phone || "N/A",
          };
        });

        setOrders(formatted);
      } else {
        throw new Error("No database orders found.");
      }
    } catch (err) {
      console.warn("Using sandbox mode for orders CRUD:", err);

      // Seed Mock Orders
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Fetch items for specific order
  const fetchOrderItems = async (order: Order) => {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products:product_id(name, slug)
          `,
        )
        .eq("order_id", order.id);

      if (error) throw error;

      const formattedItems = (data || []).map(
        (item: Record<string, unknown>) => ({
          ...item,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
        }),
      );
      setOrderItems(formattedItems);
    } catch (err: unknown) {
      console.error("Error fetching order items:", err);
      toast({
        title: "Load Items Failed",
        description: "Could not fetch items details.",
        variant: "destructive",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  // Open Drawer Manager
  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.status);
    setPaymentStatus(order.payment_status || "pending");
    setTrackingNumber(order.tracking_number || "");
    fetchOrderItems(order);
    setIsDrawerOpen(true);
  };

  // Check URL query parameters to deep-link straight to an order
  useEffect(() => {
    if (!loading && orders.length > 0) {
      const orderIdQuery = searchParams.get("id");
      if (orderIdQuery) {
        const matched = orders.find((o) => o.id === orderIdQuery);
        if (matched) {
          handleOpenDrawer(matched);
          // Clean the URL query params without reloading
          router.replace("/admin/orders", { scroll: false });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, orders]);

  // Save changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const payload = {
      status: orderStatus,
      payment_status: paymentStatus,
      tracking_number: trackingNumber || null,
    };

    try {
      const { error } = await supabase
        .from("orders")
        .update(payload)
        .eq("id", selectedOrder.id);

      if (error) throw error;
      toast({
        title: "Order Updated",
        description: `Order status saved successfully.`,
      });
      await loadOrders();

      setIsDrawerOpen(false);
    } catch (err: unknown) {
      console.error(err);
      toast({
        title: "Update Failed",
        description:
          err instanceof Error ? err.message : "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name &&
        order.customer_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (order.customer_email &&
        order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border border-green-200 gap-1 flex w-fit items-center text-[10px] font-bold">
            Delivered
          </Badge>
        );
      case "shipped":
        return (
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 gap-1 flex w-fit items-center text-[10px] font-bold">
            Shipped
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 gap-1 flex w-fit items-center text-[10px] font-bold">
            Processing
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-neutral-50 text-neutral-700 hover:bg-neutral-50 border border-neutral-200 gap-1 flex w-fit items-center text-[10px] font-bold">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 gap-1 flex w-fit items-center text-[10px] font-bold">
            Cancelled
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-250 font-bold text-[9px]">
            PAID
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-250 font-bold text-[9px]">
            FAILED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-neutral-50 text-neutral-500 hover:bg-neutral-50 border border-neutral-200 font-bold text-[9px]">
            UNPAID
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
          Orders
        </h1>
        <p className="text-sm text-neutral-500 font-medium mt-0.5">
          Process purchases, track fulfillment statuses, and manage tracking
          numbers.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by Order ID, customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-neutral-200"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-56">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-neutral-200">
              <SelectValue placeholder="All Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Order Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Grid Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center animate-pulse">
                  <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  <div className="h-4 w-40 bg-neutral-200 rounded"></div>
                  <div className="h-4 w-16 bg-neutral-200 rounded"></div>
                  <div className="h-4 w-20 bg-neutral-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-400">
              <ClipboardList className="h-12 w-12 text-neutral-300 mb-3" />
              <p className="text-sm font-semibold">
                No orders match your parameters.
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Customers placing orders will appear here automatically.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/55 text-xs font-bold uppercase tracking-wider text-neutral-400">
                  <th className="px-6 py-3 font-semibold">Order ID</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Payment</th>
                  <th className="px-6 py-3 font-semibold">Total</th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-neutral-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-neutral-800">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-700">
                          {order.customer_name}
                        </span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">
                          {order.customer_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td className="px-6 py-4 font-bold text-neutral-850">
                      Rs. {order.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => handleOpenDrawer(order)}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[#FF3D6E] hover:text-[#E0345F] hover:bg-neutral-50 font-semibold gap-1.5"
                      >
                        <Eye className="h-4 w-4" />
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-out Order Details Panel */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-white pr-2">
          {selectedOrder && (
            <>
              <SheetHeader className="border-b pb-4 mb-6">
                <SheetTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#FF3D6E]" />
                  Manage Order #{selectedOrder.id.slice(0, 8)}
                </SheetTitle>
                <SheetDescription className="text-xs text-neutral-400">
                  Configure delivery tracking and finalize financial statuses.
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSaveChanges} className="space-y-6">
                {/* 1. Status Adjustments Box */}
                <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 space-y-4">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Fulfillment Options
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Order Status */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="drawer-status"
                        className="text-xs font-bold text-neutral-700"
                      >
                        Order Status
                      </Label>
                      <Select
                        value={orderStatus}
                        onValueChange={setOrderStatus}
                      >
                        <SelectTrigger className="border-neutral-200 bg-white">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="drawer-payment"
                        className="text-xs font-bold text-neutral-700"
                      >
                        Payment Status
                      </Label>
                      <Select
                        value={paymentStatus}
                        onValueChange={setPaymentStatus}
                      >
                        <SelectTrigger className="border-neutral-200 bg-white">
                          <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            Unpaid / Pending
                          </SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tracking Number */}
                  <div className="space-y-1.5 pt-1">
                    <Label
                      htmlFor="drawer-tracking"
                      className="text-xs font-bold text-neutral-700 flex items-center gap-1"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      Tracking / Courier Reference
                    </Label>
                    <Input
                      id="drawer-tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. DHL992837 or TCS88493"
                      className="border-neutral-200 bg-white"
                    />
                  </div>
                </div>

                {/* 2. Customer and shipping info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Customer Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-xl p-4 text-xs space-y-1.5 sm:space-y-0 bg-white">
                    {/* General */}
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-neutral-600">
                        <User className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span className="font-semibold text-neutral-800">
                          {selectedOrder.customer_name}
                        </span>
                      </p>
                      <p className="text-neutral-500 pl-6 leading-none">
                        {selectedOrder.customer_email}
                      </p>
                      <p className="text-neutral-500 pl-6 leading-none">
                        Phone: {selectedOrder.customer_phone}
                      </p>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0">
                      <p className="flex items-start gap-2 text-neutral-600">
                        <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="font-semibold text-neutral-800">
                          Shipping Address
                        </span>
                      </p>
                      <p className="text-neutral-500 pl-6 leading-relaxed">
                        {selectedOrder.shipping_address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Items list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Order Items
                  </h3>
                  <div className="border rounded-xl bg-white overflow-hidden">
                    {loadingItems ? (
                      <div className="p-4 space-y-2">
                        <div className="h-4 w-full bg-neutral-100 rounded animate-pulse"></div>
                        <div className="h-4 w-2/3 bg-neutral-100 rounded animate-pulse"></div>
                      </div>
                    ) : orderItems.length === 0 ? (
                      <p className="p-4 text-xs text-neutral-400 italic">
                        No products registered in this order.
                      </p>
                    ) : (
                      <div className="divide-y text-xs">
                        {orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center p-3 hover:bg-neutral-50/50"
                          >
                            <div>
                              <p className="font-bold text-neutral-800">
                                {item.products?.name || "Deleted Product"}
                              </p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">
                                Qty: {item.quantity} × Rs.{" "}
                                {item.unit_price.toLocaleString()}
                              </p>
                            </div>
                            <span className="font-bold text-neutral-800">
                              Rs. {item.total_price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {/* Summary totals */}
                        <div className="bg-neutral-50/70 p-3 flex justify-between items-center font-bold text-sm border-t">
                          <span className="text-neutral-600">
                            Total Purchase Amount
                          </span>
                          <span className="text-[#FF3D6E]">
                            Rs. {selectedOrder.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Customer Notes
                    </h3>
                    <div className="p-3 border rounded-xl bg-neutral-50 text-xs text-neutral-600 leading-relaxed font-semibold">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t mt-8">
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-neutral-300 text-neutral-600"
                    >
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#FF3D6E] hover:bg-[#E0345F] text-white"
                  >
                    Save Order Status
                  </Button>
                </div>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-40 bg-neutral-200 rounded animate-pulse"></div>
          <div className="h-40 w-full bg-neutral-200 rounded animate-pulse"></div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
