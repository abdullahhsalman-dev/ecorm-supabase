import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ProductDetails } from "@/components/product-details"
import { RelatedProducts } from "@/components/related-products"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/server"
import { getDummyProduct } from "@/lib/dummy-data"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: "Product Not Found | Diners",
      description: "The requested product could not be found.",
    }
  }

  return {
    title: `${product.name} | Diners`,
    description: product.description || "View product details and purchase options.",
  }
}

async function getProduct(slug: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_images(*),
        categories:category_id(id, name, slug)
      `)
      .eq("slug", slug)
      .single()

    if (error || !data) {
      console.error("Error fetching product:", error)
      // Return dummy product data
      return getDummyProduct(slug)
    }

    return data
  } catch (error) {
    console.error("Error in getProduct:", error)
    // Return dummy product data on error
    return getDummyProduct(slug)
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      <Suspense
        fallback={
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        }
      >
        <ProductDetails product={product} />
      </Suspense>

      <Suspense
        fallback={
          <div className="mt-16 space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {Array(4)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
            </div>
          </div>
        }
      >
        <RelatedProducts currentProductId={product.id} categoryId={product.category_id} />
      </Suspense>
    </div>
  )
}
