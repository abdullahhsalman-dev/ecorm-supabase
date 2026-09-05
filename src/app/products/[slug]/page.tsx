import { ProductDetails } from "@/src/app/components/product-details";
import { RelatedProducts } from "@/src/app/components/related-products";
import { fetchProductBySlug, isInStock, type StorefrontProduct } from "@/src/app/lib/products";
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
    const url = absoluteUrl(`/products/${product.slug}`);

    return {
      /*
       * No brand suffix here: the root layout's title.template
       * appends "| Lamees" to every page title that is not the
       * homepage's, so spelling it out would render it twice.
       */
      title,
      description,
      /* Set per-route, since the layout deliberately sets none. */
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title,
        description,
        images: image ? [{ url: image, alt: product.name }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : undefined,
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
  const images = product.product_images.map((image) => image.image_url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.id,
    url: absoluteUrl(`/products/${product.slug}`),
    image: images.length > 0 ? images : undefined,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.categories?.name ?? undefined,
    offers: {
      "@type": "Offer",
      price: sellingPrice(product).toFixed(2),
      priceCurrency: CURRENCY,
      url: absoluteUrl(`/products/${product.slug}`),
      itemCondition: "https://schema.org/NewCondition",
      /*
       * isInStock, not stock_quantity: a product with variants
       * is in stock when any variant is, and the two disagree
       * often enough that using the raw column would tell
       * Google "in stock" over a page saying otherwise.
       */
      availability: isInStock(product)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      {/*
        The structured data was being built and then dropped on
        the floor - none of it ever reached the page, so none of
        it ever reached Google.

        `<` is escaped because a product name containing
        "</script>" would otherwise close this tag early and
        leave the rest of the JSON as markup.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ProductDetails product={product} />

      <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
    </div>
  );
}
