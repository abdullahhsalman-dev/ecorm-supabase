import Image from "next/image";
import Link from "next/link";
import { fetchCategoryChildren } from "@/src/app/lib/categories";
import { childSegment, sectionHref } from "@/src/app/lib/navigation";
import { createClient } from "@/src/app/lib/supabase/server";
import { safeImageSrc } from "@/src/app/lib/utils";

/*
 * ---------------------------------------------------------
 * DEPARTMENT CATEGORY GRID
 * ---------------------------------------------------------
 *
 * Each department used to ship its own hard-coded list of six
 * subcategories - all with an empty image, so every tile
 * rendered the placeholder, and most linking to categories the
 * table has never held. The grid now comes from the same
 * `categories` rows the mega menu reads, so it can only ever
 * offer what the store actually stocks, and an admin adding a
 * subcategory gets a tile for free.
 */

/* A department with no children shows nothing, not six holes. */
async function getChildren(parentSlug: string) {
  try {
    return await fetchCategoryChildren(parentSlug, createClient());
  } catch (error) {
    console.error("Error loading department categories:", error);
    return [];
  }
}

export async function DepartmentCategories({
  parentSlug,
}: {
  parentSlug: string;
}) {
  const children = await getChildren(parentSlug);

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">Shop by Category</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {children.map((category) => (
          <Link
            key={category.id}
            href={`${sectionHref(parentSlug)}/${childSegment(
              category.slug,
              parentSlug,
            )}`}
            className="group overflow-hidden rounded-lg"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-900">
              {category.image_url ? (
                <Image
                  src={safeImageSrc(category.image_url)}
                  alt={category.name}
                  fill
                  sizes="(min-width: 768px) 17vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                /*
                 * Most categories have no banner yet. A typographic
                 * tile reads as deliberate; a placeholder image reads
                 * as broken.
                 */
                <div
                  aria-hidden="true"
                  className="flex h-full w-full items-center justify-center"
                >
                  <span className="text-5xl font-semibold text-white/10">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/20" />

              <div className="absolute inset-0 flex items-center justify-center p-2">
                <h3 className="text-center text-lg font-bold text-white">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
