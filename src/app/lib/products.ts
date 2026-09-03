/*
 * ---------------------------------------------------------
 * STOREFRONT PRODUCT MODEL
 * ---------------------------------------------------------
 *
 * One place that knows how a `products` row maps onto what
 * the storefront renders: which image is primary, what the
 * effective price is, and how `product_variants` rows group
 * into the pickers on the product page.
 *
 * Mirrors schema.sql:
 *   products         (price, sale_price, stock_quantity, featured)
 *   product_images   (image_url, is_primary, display_order)
 *   product_variants (name, value, price_adjustment, stock_quantity)
 */

import { createClient } from "@/src/app/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/app/lib/supabase/database.types";

/*
 * Reads default to the browser client. Server components pass
 * their own (lib/supabase/server) rather than reaching for the
 * singleton meant for the browser.
 */
type Client = SupabaseClient<Database>;

export interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price_adjustment: number;
  stock_quantity: number;
}

export interface ProductCategory {
  id: string | null;
  name: string | null;
  slug: string | null;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  featured: boolean;
  category_id: string | null;
  categories: ProductCategory | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

/* A variant group, e.g. { name: "Size", values: [S, M, L] }. */
export interface VariantGroup {
  name: string;
  values: ProductVariant[];
}

/*
 * ---------------------------------------------------------
 * SELECTS
 * ---------------------------------------------------------
 *
 * `!inner` on categories matters: without it PostgREST filters
 * the embedded row rather than the parent, so a category
 * filter silently returns every product with `categories:
 * null` instead of narrowing the list.
 */

export const PRODUCT_LIST_SELECT = `
  id,
  name,
  slug,
  description,
  price,
  sale_price,
  stock_quantity,
  featured,
  category_id,
  created_at,
  product_images (image_url, is_primary, display_order),
  product_variants (id, name, value, price_adjustment, stock_quantity),
  categories:category_id (id, name, slug)
`;

export const PRODUCT_LIST_SELECT_INNER_CATEGORY = PRODUCT_LIST_SELECT.replace(
  "categories:category_id (",
  "categories:category_id!inner ("
);

/*
 * ---------------------------------------------------------
 * MAPPING
 * ---------------------------------------------------------
 */

type Row = Record<string, unknown>;

/* Embedded relations arrive as an object or a single-item array. */
const firstRelation = (value: unknown): Row | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return (value[0] as Row) ?? null;
  }

  return value as Row;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function mapProduct(row: Row): StorefrontProduct {
  const category = firstRelation(row.categories);

  const images = Array.isArray(row.product_images)
    ? (row.product_images as Row[])
        .filter((image) => Boolean(image?.image_url))
        .sort((a, b) => {
          /* Primary first, then display_order. */
          if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
            return a.is_primary ? -1 : 1;
          }

          return toNumber(a.display_order) - toNumber(b.display_order);
        })
        .map((image) => ({
          image_url: String(image.image_url),
          is_primary: Boolean(image.is_primary),
        }))
    : [];

  const variants = Array.isArray(row.product_variants)
    ? (row.product_variants as Row[]).map((variant) => ({
        id: String(variant.id),
        name: String(variant.name ?? ""),
        value: String(variant.value ?? ""),
        price_adjustment: toNumber(variant.price_adjustment),
        stock_quantity: toNumber(variant.stock_quantity),
      }))
    : [];

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    description: (row.description as string | null) ?? null,
    price: toNumber(row.price),
    sale_price:
      row.sale_price === null || row.sale_price === undefined ? null : toNumber(row.sale_price),
    stock_quantity: toNumber(row.stock_quantity),
    featured: Boolean(row.featured),
    category_id: (row.category_id as string | null) ?? null,
    categories: category
      ? {
          id: (category.id as string | null) ?? null,
          name: (category.name as string | null) ?? null,
          slug: (category.slug as string | null) ?? null,
        }
      : null,
    product_images: images,
    product_variants: variants,
  };
}

/*
 * ---------------------------------------------------------
 * DERIVED VALUES
 * ---------------------------------------------------------
 */

/* The primary image, else the first one, else null. */
export const getPrimaryImage = (product: { product_images: ProductImage[] }): string | null =>
  product.product_images.find((image) => image.is_primary)?.image_url ??
  product.product_images[0]?.image_url ??
  null;

/*
 * A sale_price only counts when it is actually cheaper than
 * the list price.
 */
export const hasDiscount = (product: { price: number; sale_price: number | null }): boolean =>
  product.sale_price !== null && product.sale_price > 0 && product.sale_price < product.price;

export const getEffectivePrice = (product: { price: number; sale_price: number | null }): number =>
  hasDiscount(product) ? (product.sale_price as number) : product.price;

export const getDiscountPercent = (product: {
  price: number;
  sale_price: number | null;
}): number =>
  hasDiscount(product)
    ? Math.round(((product.price - (product.sale_price as number)) / product.price) * 100)
    : 0;

/*
 * Stock: a product with variants is in stock when any variant
 * is; otherwise the product-level quantity decides.
 */
export const isInStock = (product: {
  stock_quantity: number;
  product_variants: ProductVariant[];
}): boolean =>
  product.product_variants.length > 0
    ? product.product_variants.some((variant) => variant.stock_quantity > 0)
    : product.stock_quantity > 0;

/*
 * ---------------------------------------------------------
 * VARIANT GROUPING
 * ---------------------------------------------------------
 *
 * product_variants stores one row per option value, so "Size"
 * and "Color" are just different `name` values on the same
 * table. Group them to build one picker per attribute.
 */
export function groupVariants(variants: ProductVariant[]): VariantGroup[] {
  const groups = new Map<string, VariantGroup>();

  for (const variant of variants) {
    const name = variant.name.trim();

    if (!name || !variant.value.trim()) {
      continue;
    }

    const existing = groups.get(name.toLowerCase());

    if (existing) {
      existing.values.push(variant);
    } else {
      groups.set(name.toLowerCase(), { name, values: [variant] });
    }
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    values: [...group.values].sort((a, b) => a.value.localeCompare(b.value)),
  }));
}

/*
 * ---------------------------------------------------------
 * QUERIES
 * ---------------------------------------------------------
 *
 * The featured strip, the related rail and the category grid
 * were each building the same select-map-filter pipeline by
 * hand. One reader with a filter object covers all three.
 */

export interface ProductQuery {
  featured?: boolean;
  categoryId?: string;
  /* Matches on the embedded category, which forces an inner join. */
  categorySlug?: string;
  /* Excludes the product currently on screen. */
  excludeId?: string;
  /* Discounted products only. */
  sale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  /* Undefined leaves the ordering to PostgREST. */
  sort?: string;
  limit?: number;
  /* Values a product must carry across its variants, e.g. ["M","black"]. */
  variantValues?: string[];
  /* Free text from the header search, matched on name and description. */
  search?: string;
}

/*
 * PostgREST reads , . : ( ) as syntax inside an or() filter, and a bare %
 * would widen the pattern, so anything the shopper typed is stripped of them
 * rather than passed through.
 */
const escapeSearchTerm = (term: string): string =>
  term
    .replace(/[,.:()%\\*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/*
 * `!inner` on categories matters here: without it PostgREST
 * filters the embedded row rather than the parent.
 */
const selectProducts = (categorySlug?: string) =>
  createClient()
    .from("products")
    .select(categorySlug ? PRODUCT_LIST_SELECT_INNER_CATEGORY : PRODUCT_LIST_SELECT);

type ProductQueryBuilder = ReturnType<typeof selectProducts>;

/*
 * The schema has no sales counters, so "best-selling" and
 * "trending" fall back to the `featured` flag rather than
 * pretending to rank by orders.
 */
const applySort = (query: ProductQueryBuilder, sort: string): void => {
  switch (sort) {
    case "price-asc":
      query.order("price", { ascending: true });
      break;
    case "price-desc":
      query.order("price", { ascending: false });
      break;
    case "newest":
      query.order("created_at", { ascending: false });
      break;
    case "discount-desc":
      query.not("sale_price", "is", null);
      break;
    default:
      query.order("featured", { ascending: false }).order("created_at", { ascending: false });
  }
};

export async function fetchStorefrontProducts(
  options: ProductQuery = {}
): Promise<StorefrontProduct[]> {
  const query = selectProducts(options.categorySlug);

  if (options.featured !== undefined) {
    query.eq("featured", options.featured);
  }

  if (options.categorySlug) {
    query.eq("categories.slug", options.categorySlug);
  }

  if (options.categoryId) {
    query.eq("category_id", options.categoryId);
  }

  if (options.excludeId) {
    query.neq("id", options.excludeId);
  }

  if (options.sale) {
    query.not("sale_price", "is", null);
  }

  /*
   * A match on either the name or the description, case-insensitive. The
   * term is escaped first: an unescaped comma would end up read as the
   * separator between the two or() branches.
   */
  const term = escapeSearchTerm(options.search ?? "");

  if (term) {
    query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (options.minPrice !== undefined) {
    query.gte("price", options.minPrice);
  }

  if (options.maxPrice !== undefined) {
    query.lte("price", options.maxPrice);
  }

  if (options.sort !== undefined) {
    applySort(query, options.sort);
  }

  const { data, error } = await (options.limit ? query.limit(options.limit) : query);

  if (error) {
    throw error;
  }

  const products = ((data ?? []) as unknown as Row[]).map(mapProduct);

  /*
   * Variant filtering runs client-side because "Size M AND
   * black" spans two product_variants rows, which a single
   * PostgREST filter cannot express.
   */
  const wanted = (options.variantValues ?? [])
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const filtered =
    wanted.length === 0
      ? products
      : products.filter((product) =>
          wanted.every((value) =>
            product.product_variants.some((variant) => variant.value.toLowerCase() === value)
          )
        );

  /*
   * Discount ordering is a computed percentage, which
   * PostgREST cannot sort on.
   */
  if (options.sort === "discount-desc") {
    filtered.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
  }

  return filtered;
}

/* One product with everything the detail page renders. */
export async function fetchProductBySlug(
  slug: string,
  client: Client = createClient()
): Promise<StorefrontProduct | null> {
  const { data, error } = await client
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProduct(data as unknown as Row) : null;
}

export async function countProducts(): Promise<number> {
  const { count, error } = await createClient()
    .from("products")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

/*
 * The filter sidebar offers only option values that actually
 * exist, collapsed to one entry per name/value pair.
 */
export async function fetchVariantOptions(): Promise<VariantGroup[]> {
  const { data, error } = await createClient()
    .from("product_variants")
    .select("id, name, value, price_adjustment, stock_quantity");

  if (error) {
    throw error;
  }

  const seen = new Set<string>();

  const unique = (data ?? [])
    .filter((row) => {
      const key = `${row.name}:${row.value}`.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      value: String(row.value ?? ""),
      price_adjustment: toNumber(row.price_adjustment),
      stock_quantity: toNumber(row.stock_quantity),
    }));

  return groupVariants(unique);
}
