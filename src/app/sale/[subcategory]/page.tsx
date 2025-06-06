import { Suspense } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { ProductFilters } from "@/components/product-filters";
import { ProductSorting } from "@/components/product-sorting";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: { subcategory: string };
}) {
  const subcategory = await getSubcategory(params.subcategory);

  return {
    title: `${subcategory.name} Sale | Diners`,
    description:
      subcategory.description ||
      `Shop our sale collection of ${subcategory.name.toLowerCase()} products.`,
  };
}

async function getSubcategory(slug: string) {
  try {
    const supabase = createClient();

    // First try to get the subcategory from the database
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return data;
    }

    // If not found in database, return a fallback object
    return {
      id: `fallback-${slug}`,
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
      slug: slug,
      description: `Shop our sale collection of ${slug.replace(
        /-/g,
        " "
      )} products.`,
      parent_slug: "sale",
    };
  } catch (error) {
    console.error("Error in getSubcategory:", error);
    // Return fallback data even on error
    return {
      id: `fallback-${slug}`,
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
      slug: slug,
      description: `Shop our sale collection of ${slug.replace(
        /-/g,
        " "
      )} products.`,
      parent_slug: "sale",
    };
  }
}

export default async function SaleSubcategoryPage({
  params,
}: {
  params: { subcategory: string };
}) {
  const subcategory = await getSubcategory(params.subcategory);

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/sale" className="hover:text-foreground">
            Sale
          </Link>
          <span>/</span>
          <span className="text-foreground">{subcategory.name}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold">{`${subcategory.name} Sale`}</h1>
        <p className="mt-2 text-muted-foreground">
          {subcategory.description ||
            `Shop our sale collection of ${subcategory.name.toLowerCase()} products.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ProductFilters categorySlug={params.subcategory} />
        </div>
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">24</span> of{" "}
              <span className="font-medium text-foreground">100</span> products
            </p>
            <ProductSorting />
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {Array(9)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
              </div>
            }
          >
            <ProductGrid categorySlug={params.subcategory} sale={true} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
