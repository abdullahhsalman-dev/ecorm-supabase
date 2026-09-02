"use client";

/*
 * ---------------------------------------------------------
 * ADMIN / ORDERS
 * ---------------------------------------------------------
 *
 * Composition only. Fetching lives in use-orders, writes in
 * queries.ts, and the drawer owns its own edit state.
 */

import { ClipboardList } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  DataPanel,
  FILTER_BAR_CLASS,
  FilterSelect,
  ORDER_STATUSES,
  PageHeader,
  PAYMENT_STATUSES,
  RefreshButton,
  SearchInput,
} from "../components/admin-ui";
import { OrderDetailSheet } from "./order-detail-sheet";
import { OrderRow } from "./order-row";
import type { Order } from "./types";
import { useOrders } from "./use-orders";

const ORDER_COLUMNS = [
  { key: "id", label: "Order ID" },
  { key: "date", label: "Date" },
  { key: "customer", label: "Customer" },
  { key: "status", label: "Status" },
  { key: "payment", label: "Payment" },
  { key: "total", label: "Total" },
  { key: "actions", label: "Actions", align: "right" as const },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    orders,
    filteredOrders,
    loading,
    loadOrders,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = (order: Order): void => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean): void => {
    setIsDrawerOpen(open);

    if (!open) {
      setSelectedOrder(null);
    }
  };

  /* Deep link from the dashboard: /admin/orders?id=<uuid> */
  useEffect(() => {
    if (loading || orders.length === 0) {
      return;
    }

    const orderIdQuery = searchParams.get("id");

    if (!orderIdQuery) {
      return;
    }

    const matched = orders.find((order) => order.id === orderIdQuery);

    if (matched) {
      setSelectedOrder(matched);
      setIsDrawerOpen(true);
    }

    /* Clear the query so a refresh doesn't reopen the drawer. */
    router.replace("/admin/orders", { scroll: false });
  }, [searchParams, loading, orders, router]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Process purchases, track fulfillment statuses, and manage tracking numbers."
      >
        <RefreshButton onClick={loadOrders} loading={loading} />
      </PageHeader>

      <div className={FILTER_BAR_CLASS}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by order ID, customer or tracking number..."
        />

        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          allLabel="All Order Status"
          options={ORDER_STATUSES}
        />

        <FilterSelect
          value={paymentFilter}
          onChange={setPaymentFilter}
          allLabel="All Payments"
          options={PAYMENT_STATUSES}
        />
      </div>

      <DataPanel
        loading={loading}
        rows={filteredOrders}
        totalRows={orders.length}
        columns={ORDER_COLUMNS}
        emptyIcon={ClipboardList}
        emptyTitle="No orders yet."
        emptyDescription="Customers placing orders will appear here automatically."
        filteredTitle="No orders match your filters."
        filteredDescription="Try a different status or clear your search."
        renderRow={(order) => (
          <OrderRow key={order.id} order={order} onManage={openDrawer} />
        )}
      />

      <OrderDetailSheet
        open={isDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        order={selectedOrder}
        onSaved={loadOrders}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-9 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="h-40 w-full animate-pulse rounded-xl bg-neutral-200" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
