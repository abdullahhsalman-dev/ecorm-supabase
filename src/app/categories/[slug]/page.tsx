import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGrid } from "@/src/app/components/product-grid";
import { ProductFilters } from "@/src/app/components/product-filters";
import { ProductSorting } from "@/src/app/components/product-sorting";
import { Skeleton } from "@/src/app/components/ui/skeleton";
import { createClient } from "@/src/app/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategory(params.slug);

  if (!category) {
    return {
      title: "Category Not Found | Diners",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.name} | Diners`,
    description:
      category.description ||
      `Browse our collection of ${category.name} products.`,
  };
}

async function getCategory(slug: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching category:", error);
    return null;
  }

  return data;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const minPrice =
    typeof searchParams.minPrice === "string"
      ? Number.parseInt(searchParams.minPrice)
      : undefined;
  const maxPrice =
    typeof searchParams.maxPrice === "string"
      ? Number.parseInt(searchParams.maxPrice)
      : undefined;

  return (
    <div className="container px-4 py-8 md:py-12">
      <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
      {category.description && (
        <p className="mb-8 text-muted-foreground">{category.description}</p>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ProductFilters categoryId={category.id} />
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
            <ProductGrid
              categoryId={category.id}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
