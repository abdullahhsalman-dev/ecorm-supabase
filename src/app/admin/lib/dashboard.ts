/*
 * ---------------------------------------------------------
 * DASHBOARD DATA
 * ---------------------------------------------------------
 *
 * The dashboard did its own fetching, revenue filtering,
 * week-over-week arithmetic and 7-day bucketing inline in the
 * component, while Orders and Products each had a queries
 * module. This is the dashboard's.
 *
 * Throws on failure, returns finished figures. No React here,
 * which is what makes the money rules below testable.
 */

import { countCategories } from "@/src/app/lib/categories";
import { countProducts } from "@/src/app/lib/products";
import { createClient } from "@/src/app/lib/supabase/client";
import {
  customerIdsOf,
  fetchCustomerProfiles,
  GUEST_CUSTOMER,
} from "./customers";

export interface RecentOrder {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_status: string;
  customer_name: string;
}

export interface Trend {
  trend: string;
  trendPositive: boolean;
}

export interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  productCount: number;
  categoryCount: number;
  revenueTrend: Trend | null;
  orderTrend: Trend | null;
  chart: { label: string; value: number }[];
  recentOrders: RecentOrder[];
}

/* The orders columns the dashboard reads. */
interface OrderRow {
  id: string;
  user_id: string | null;
  created_at: string;
  status: string;
  total_amount: number | string;
  payment_status: string | null;
}

const ORDER_SELECT =
  "id, user_id, total_amount, created_at, status, payment_status";

/* How many recent orders the panel lists. */
const RECENT_ORDER_LIMIT = 5;

/* Days in the revenue chart, and in one comparison window. */
const CHART_DAYS = 7;

/*
 * ---------------------------------------------------------
 * DATE HELPERS
 * ---------------------------------------------------------
 *
 * Buckets are keyed on the *local* calendar day so the chart
 * columns match the weekday labels shown underneath them.
 */

const toLocalDayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const startOfDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);

  return date;
};

/*
 * Revenue counts settled money only: orders whose
 * payment_status is 'paid' and that were not cancelled.
 */
const isRevenue = (order: OrderRow): boolean =>
  order.payment_status === "paid" && order.status !== "cancelled";

const sumRevenue = (rows: OrderRow[]): number =>
  rows
    .filter(isRevenue)
    .reduce((sum, order) => sum + Number(order.total_amount), 0);

/* Percentage change between two periods, for the stat caption. */
export function buildTrend(current: number, previous: number): Trend | null {
  if (previous <= 0) {
    return current > 0
      ? { trend: "New activity this week", trendPositive: true }
      : null;
  }

  const change = ((current - previous) / previous) * 100;

  return {
    trend: `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs last week`,
    trendPositive: change >= 0,
  };
}

export async function fetchDashboard(): Promise<DashboardData> {
  const supabase = createClient();

  const [productCount, categoryCount, orderRes] = await Promise.all([
    countProducts(),
    countCategories(),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false }),
  ]);

  if (orderRes.error) {
    throw orderRes.error;
  }

  const orders = (orderRes.data ?? []) as OrderRow[];

  /* Week-over-week comparison for the stat captions. */
  const weekStart = startOfDaysAgo(CHART_DAYS - 1).getTime();
  const previousWeekStart = startOfDaysAgo(CHART_DAYS * 2 - 1).getTime();
  const now = Date.now();

  const inWindow = (order: OrderRow, from: number, to: number): boolean => {
    const placedAt = new Date(order.created_at).getTime();
    return placedAt >= from && placedAt < to;
  };

  const thisWeek = orders.filter((order) => inWindow(order, weekStart, now));

  const lastWeek = orders.filter((order) =>
    inWindow(order, previousWeekStart, weekStart),
  );

  /* Chart: revenue per day for the last 7 days. */
  const days = Array.from({ length: CHART_DAYS })
    .map((_, index) => {
      const date = startOfDaysAgo(index);

      return {
        key: toLocalDayKey(date),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
      };
    })
    .reverse();

  const chart = days.map((day) => ({
    label: day.label,
    value: sumRevenue(
      orders.filter(
        (order) => toLocalDayKey(new Date(order.created_at)) === day.key,
      ),
    ),
  }));

  /*
   * The most recent orders, with customer names resolved from
   * the users table.
   */
  const latest = orders.slice(0, RECENT_ORDER_LIMIT);

  const profiles = await fetchCustomerProfiles(customerIdsOf(latest));

  const recentOrders: RecentOrder[] = latest.map((order) => ({
    id: order.id,
    created_at: order.created_at,
    status: order.status,
    total_amount: Number(order.total_amount),
    payment_status: order.payment_status ?? "pending",
    customer_name: order.user_id
      ? (profiles.get(order.user_id)?.name ?? GUEST_CUSTOMER)
      : GUEST_CUSTOMER,
  }));

  return {
    totalRevenue: sumRevenue(orders),
    totalOrders: orders.length,
    productCount,
    categoryCount,
    revenueTrend: buildTrend(sumRevenue(thisWeek), sumRevenue(lastWeek)),
    orderTrend: buildTrend(thisWeek.length, lastWeek.length),
    chart,
    recentOrders,
  };
}
