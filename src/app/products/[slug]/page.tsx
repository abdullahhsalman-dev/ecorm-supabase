import { ProductDetails } from "@/src/app/components/product-details";
import { RelatedProducts } from "@/src/app/components/related-products";
import { fetchProductBySlug } from "@/src/app/lib/products";
import { createClient } from "@/src/app/lib/supabase/server";
import { notFound } from "next/navigation";
import { cache } from "react";

/* Next 15 hands route props in as promises. */
type Params = Promise<{ slug: string }>;

/*
 * generateMetadata and the page both need the product, and
 * React's cache collapses that into a single query per request.
 */
const getProduct = cache(async (slug: string) => {
  try {
    return await fetchProductBySlug(slug, createClient());
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
});

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);

    if (!product) {
      return {
        title: "Product Not Found | Lamees",
        description: "The requested product could not be found.",
      };
    }

    return {
      title: `${product.name} | Lamees`,
      description: product.description || "View product details and purchase options.",
    };
  } catch {
    return {
      title: "Product | Lamees",
      description: "View product details and purchase options.",
    };
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;

  /*
   * A missing product is a 404 rather than placeholder data,
   * so a broken link is visible instead of looking like a real
   * listing.
   */
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <ProductDetails product={product} />

      <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
    </div>
  );
}
