import {
  Container,
  Section,
  SectionHeading,
} from "@/src/app/components/ui/container";
import { fetchRootCategories } from "@/src/app/lib/categories";
import { sectionHref } from "@/src/app/lib/navigation";
import { createClient } from "@/src/app/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { safeImageSrc } from "@/src/app/lib/utils";

/* Nothing to show beats a grid of holes, so a failure is empty. */
async function getMainCategories() {
  try {
    return await fetchRootCategories(6, createClient());
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function CategoryShowcase() {
  const categories = await getMainCategories();

  /* Nothing to show is better than an empty grid of holes. */
  if (categories.length === 0) {
    return null;
  }

  return (
    <Section>
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Browse"
          title="Shop by category"
          description="Find what you're looking for across our departments."
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={sectionHref(category.slug)}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted"
            >
              {category.image_url ? (
                <Image
                  src={safeImageSrc(category.image_url)}
                  alt={category.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                /*
                 * Categories often have no banner yet, so fall
                 * back to a typographic tile instead of a
                 * broken image.
                 */
                <div className="flex h-full w-full items-center justify-center bg-neutral-900">
                  <span className="text-4xl font-semibold text-white/15">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/85"
              />

              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <h3 className="text-sm font-semibold leading-tight text-white sm:text-base">
                  {category.name}
                </h3>

                <span className="mt-0.5 block text-[11px] text-white/0 transition-colors duration-300 group-hover:text-white/70">
                  Shop now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
