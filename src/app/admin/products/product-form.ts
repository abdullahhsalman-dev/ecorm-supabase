/*
 * ---------------------------------------------------------
 * PRODUCT FORM VALUES + VALIDATION
 * ---------------------------------------------------------
 *
 * Pure form logic: no React, no Supabase. The sheet holds the
 * values in state and calls validateProductForm on submit.
 */

import { generateSlug } from "@/src/app/lib/utils";
import { primaryImageOf, type Product, type ProductPayload } from "./types";

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  categoryId: string;
  featured: boolean;
  imageUrl: string;
}

export const emptyProductForm = (categoryId = ""): ProductFormValues => ({
  name: "",
  slug: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "",
  categoryId,
  featured: false,
  imageUrl: "",
});

export const productFormValues = (product: Product): ProductFormValues => ({
  name: product.name,
  slug: product.slug,
  description: product.description ?? "",
  price: String(product.price),
  salePrice: product.sale_price !== null ? String(product.sale_price) : "",
  stock: String(product.stock_quantity),
  categoryId: product.category_id ?? "",
  featured: product.featured,
  imageUrl: primaryImageOf(product)?.image_url ?? "",
});

export interface ValidationError {
  title: string;
  description: string;
}

type ValidationResult =
  | { payload: ProductPayload; error?: never }
  | { payload?: never; error: ValidationError };

const invalid = (title: string, description: string): ValidationResult => ({
  error: { title, description },
});

export function validateProductForm(
  values: ProductFormValues,
  /* Used to reject a slug another product already owns. */
  existingProducts: Pick<Product, "id" | "slug">[],
  editingProductId: string | null,
): ValidationResult {
  const name = values.name.trim();
  const slug = values.slug.trim().toLowerCase();

  if (!name) {
    return invalid("Product name required", "Please enter a product name.");
  }

  if (!slug) {
    return invalid("Product slug required", "Please enter a product slug.");
  }

  if (!values.categoryId) {
    return invalid("Category required", "Please select a category.");
  }

  const price = Number.parseFloat(values.price);

  if (!Number.isFinite(price) || price < 0) {
    return invalid(
      "Invalid price",
      "Price must be a valid number greater than or equal to 0.",
    );
  }

  const stock = Number.parseInt(values.stock, 10);

  if (!Number.isInteger(stock) || stock < 0) {
    return invalid(
      "Invalid stock",
      "Stock quantity must be a whole number greater than or equal to 0.",
    );
  }

  let salePrice: number | null = null;

  if (values.salePrice.trim() !== "") {
    salePrice = Number.parseFloat(values.salePrice);

    if (!Number.isFinite(salePrice) || salePrice < 0) {
      return invalid("Invalid sale price", "Sale price must be a valid number.");
    }

    if (salePrice > price) {
      return invalid(
        "Invalid sale price",
        "Sale price cannot be greater than the regular price.",
      );
    }
  }

  const duplicateSlug = existingProducts.some(
    (product) =>
      product.slug.toLowerCase() === slug && product.id !== editingProductId,
  );

  if (duplicateSlug) {
    return invalid(
      "Slug already exists",
      "Please choose a different product slug.",
    );
  }

  return {
    payload: {
      name,
      slug,
      description: values.description.trim() || null,
      price,
      sale_price: salePrice,
      stock_quantity: stock,
      category_id: values.categoryId,
      featured: values.featured,
    },
  };
}

export { generateSlug };
