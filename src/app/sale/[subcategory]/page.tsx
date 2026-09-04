import {
  buildCategoryMetadata,
  CategoryListing,
  type ListingSearchParams,
} from "@/src/app/components/category-listing";

/* Next 15 delivers route props as promises. */
type PageProps = {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<ListingSearchParams>;
};

export async function generateMetadata({ params }: PageProps) {
  const { subcategory } = await params;

  return buildCategoryMetadata(subcategory, {
    parentSlug: "sale",
    basePath: "/sale",
    variant: "sale",
  });
}

export default async function SaleSubcategoryPage({ params, searchParams }: PageProps) {
  const { subcategory } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <CategoryListing
      slug={subcategory}
      parentSlug="sale"
      parent={{ name: "Sale", href: "/sale" }}
      sale
      searchParams={resolvedSearchParams}
    />
  );
}
