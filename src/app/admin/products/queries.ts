/*
 * ---------------------------------------------------------
 * PRODUCT DATA ACCESS
 * ---------------------------------------------------------
 *
 * Every Supabase call the Products screen makes lives here.
 * The functions throw on failure and return plain data, so
 * the React layer only deals with state and toasts.
 */

import { createClient } from "@/src/app/lib/supabase/client";
import { removeImage } from "../lib/storage";
import type { Product, ProductImage, ProductPayload } from "./types";

const PRODUCT_SELECT = `
  id,
  name,
  slug,
  description,
  price,
  sale_price,
  stock_quantity,
  category_id,
  featured,
  categories:category_id (
    name,
    slug
  ),
  product_images (
    id,
    image_url,
    is_primary
  )
`;

/*
 * Supabase returns numeric columns as strings for some driver
 * configurations, so every number goes through Number().
 */
type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  sale_price: number | string | null;
  stock_quantity: number | string;
  category_id: string | null;
  featured: boolean | null;
  categories: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
  product_images: ProductImage[] | null;
};

const normaliseProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? null,
  price: Number(row.price),
  sale_price:
    row.sale_price === null || row.sale_price === undefined ? null : Number(row.sale_price),
  stock_quantity: Number(row.stock_quantity),
  category_id: row.category_id,
  featured: Boolean(row.featured),

  categories:
    row.categories && !Array.isArray(row.categories)
      ? {
          name: row.categories.name ?? "",
          slug: row.categories.slug ?? "",
        }
      : null,

  product_images: Array.isArray(row.product_images)
    ? row.product_images.map((image) => ({
        id: image.id,
        image_url: image.image_url,
        is_primary: Boolean(image.is_primary),
      }))
    : [],
});

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await createClient()
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ProductRow[]).map(normaliseProduct);
}

/*
 * A product carries at most one primary image in the admin, so
 * the three cases - clear, replace, create - are handled here
 * instead of at the call site.
 */
async function savePrimaryImage(productId: string, imageUrl: string): Promise<void> {
  const supabase = createClient();
  const trimmedUrl = imageUrl.trim();

  const { data: existingImage, error: selectError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  /* URL cleared: drop the row rather than storing an empty src. */
  if (!trimmedUrl) {
    if (existingImage) {
      const { error } = await supabase.from("product_images").delete().eq("id", existingImage.id);

      if (error) {
        throw error;
      }
    }

    return;
  }

  if (existingImage) {
    const { error } = await supabase
      .from("product_images")
      .update({ image_url: trimmedUrl, is_primary: true })
      .eq("id", existingImage.id);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    image_url: trimmedUrl,
    is_primary: true,
  });

  if (error) {
    throw error;
  }
}

export async function updateProduct(
  productId: string,
  payload: ProductPayload,
  imageUrl: string
): Promise<void> {
  const { error } = await createClient().from("products").update(payload).eq("id", productId);

  if (error) {
    throw error;
  }

  await savePrimaryImage(productId, imageUrl);
}

export async function createProduct(payload: ProductPayload, imageUrl: string): Promise<void> {
  const supabase = createClient();

  const { data: newProduct, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  if (!newProduct) {
    throw new Error("Product was created but no product ID was returned.");
  }

  const trimmedUrl = imageUrl.trim();

  if (!trimmedUrl) {
    return;
  }

  /*
   * The product row already exists at this point; throwing
   * makes the failed image write visible instead of silent.
   */
  const { error: imageError } = await supabase.from("product_images").insert({
    product_id: newProduct.id,
    image_url: trimmedUrl,
    is_primary: true,
  });

  if (imageError) {
    throw imageError;
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const supabase = createClient();

  /* Read the URLs before the rows that hold them are gone. */
  const { data: images, error: selectError } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId);

  if (selectError) {
    throw selectError;
  }

  /* Images first, in case the FK has no ON DELETE CASCADE. */
  const { error: imageError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (imageError) {
    throw imageError;
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    throw error;
  }

  /*
   * Only once the product is really gone: the uploads it owned
   * would otherwise sit in the bucket forever. Best-effort, and
   * a no-op for images hosted anywhere but our bucket.
   */
  for (const image of images ?? []) {
    await removeImage(image.image_url);
  }
}
