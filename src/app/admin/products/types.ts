/*
 * ---------------------------------------------------------
 * PRODUCT TYPES
 * ---------------------------------------------------------
 *
 * Mirrors the products / product_images / categories tables
 * in schema.sql, normalised for the admin screens: numerics
 * are real numbers and relations are already flattened.
 */

export interface ProductImage {
  id?: string;
  image_url: string;
  is_primary: boolean;
}

export interface ProductCategory {
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  /* products.category_id is a nullable FK in schema.sql. */
  category_id: string | null;
  featured: boolean;
  categories: ProductCategory | null;
  product_images: ProductImage[];
}

/* The admin picker and the importer both read the shared shape. */
export type { CategoryRecord as Category } from "@/src/app/lib/categories";

/* The exact column set written to products on create/update. */
export interface ProductPayload {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  category_id: string;
  featured: boolean;
}

export type StockFilter = "all" | "in" | "low" | "out";

export const primaryImageOf = (product: Product): ProductImage | undefined =>
  product.product_images.find((image) => image.is_primary) ??
  product.product_images[0];
