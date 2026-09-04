import { ProductDetails } from "@/src/app/components/product-details";
import { RelatedProducts } from "@/src/app/components/related-products";
import { fetchProductBySlug, type StorefrontProduct } from "@/src/app/lib/products";
import { absoluteUrl, CURRENCY, SITE_NAME } from "@/src/app/lib/seo";
import { createClient } from "@/src/app/lib/supabase/server";
import { formatCurrency } from "@/src/app/lib/utils";
import type { Metadata } from "next";
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

/*
 * A product title has to carry the two words the shopper typed
 * as well as the name they could not have known. "Aangan
 * Embroidered Lawn Maxi" alone matches nothing anyone searches
 * for; the suffix is what makes it findable, and it doubles as
 * the promise that this is not unstitched cloth.
 */
const productTitle = (product: StorefrontProduct): string =>
  `${product.name} - Stitched Ready to Wear`;

/*
 * The listing price - what the shopper actually pays, and what
 * goes in the Offer below.
 */
const sellingPrice = (product: StorefrontProduct): number => product.sale_price ?? product.price;

const productDescription = (product: StorefrontProduct): string => {
  const price = formatCurrency(sellingPrice(product));

  const base = product.description?.trim() || `${product.name}, stitched and ready to wear.`;

  /*
   * "with price" rides along with almost every commercial
   * phrase in the corpus, so the number goes in the snippet
   * rather than being left for the click.
   */
  return `${base} ${price}. Stitched, ready to wear, delivered across Pakistan.`;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
        robots: { index: false, follow: true },
      };
    }

    const title = productTitle(product);
    const description = productDescription(product);
    const image = product.product_images[0]?.image_url;

    return {
      title,
      description,
      alternates: { canonical: `/products/${product.slug}` },
      openGraph: {
        type: "website",
        title,
        description,
        url: `/products/${product.slug}`,
        images: image ? [{ url: image, alt: product.name }] : undefined,
      },
    };
  } catch {
    return {
      title: "Product",
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

  /*
   * Product structured data, so the price, the currency and the
   * stock state reach Google as data rather than as text it has
   * to guess at. This is what puts "Rs. 5,590" and "In stock"
   * in the result itself - the single highest-value thing on
   * this page for a corpus where "with price" rides along with
   * almost every commercial phrase.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.id,
    url: absoluteUrl(`/products/${product.slug}`),
    image: product.product_images.map((image) => image.image_url),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.categories?.name ?? undefined,
    offers: {
      "@type": "Offer",
      price: sellingPrice(product).toFixed(2),
      priceCurrency: CURRENCY,
      url: absoluteUrl(`/products/${product.slug}`),
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        /*
         * The payload is built from our own columns, not from
         * anything a shopper typed, and JSON.stringify escapes
         * the quotes that would otherwise break out of the tag.
         */
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetails product={product} />

      <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
    </div>
  );
}
