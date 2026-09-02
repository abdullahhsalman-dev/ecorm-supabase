import { DepartmentCategories } from "@/src/app/components/department-categories";
import { ProductGrid } from "@/src/app/components/product-grid";
import { Button } from "@/src/app/components/ui/button";
import { Skeleton } from "@/src/app/components/ui/skeleton";
import type { Department, DepartmentSection } from "@/src/app/lib/departments";
import { sectionHref } from "@/src/app/lib/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

/*
 * ---------------------------------------------------------
 * DEPARTMENT LANDING PAGE
 * ---------------------------------------------------------
 *
 * The page behind /men, /women, /kids, /footwear, /fragnance
 * and /winter-wear, which were six identical copies of it.
 * Everything that differs between them lives in lib/departments.
 *
 * The department itself is resolved by /[department], so this
 * component only receives content and never decides routing
 * beyond appending a child segment to the department's slug.
 */

const HERO_IMAGE = "/assets/kids.webp";
const PROMO_IMAGE = "/assets/kids.webp";

function ProductSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
  );
}

function ProductSection({
  section,
  categorySlug,
}: {
  section: DepartmentSection;
  categorySlug: string;
}) {
  return (
    /*
     * The id is what the hero button scrolls to. Every hero used
     * to point at "#new-arrivals" and no page defined it.
     */
    <div id={section.id} className="scroll-mt-24 px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold">{section.title}</h2>

        {/*
         * "View all" goes to the catalogue with the same filter the
         * preview uses. It used to point at /men/new-arrivals and
         * friends, which are not categories, so every one of them
         * opened an empty listing.
         */}
        <Link
          href={`/products?category=${categorySlug}&sort=${section.sort}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      <Suspense fallback={<ProductSkeletons />}>
        <ProductGrid
          categorySlug={categorySlug}
          sort={section.sort}
          limit={4}
        />
      </Suspense>
    </div>
  );
}

export function DepartmentPage({ department }: { department: Department }) {
  const { slug, hero, sections, promos } = department;
  const base = sectionHref(slug);

  return (
    <div>
      <div className="relative h-[500px] overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt={hero.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
          <div className="flex h-full items-center px-4">
            <div className="max-w-lg text-white">
              <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
                {hero.title}
              </h1>
              <p className="mb-6 text-lg">{hero.description}</p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Link href={`#${sections[0].id}`}>{hero.primaryCta}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Link href={`/sale/${slug}`}>Shop Sale</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DepartmentCategories parentSlug={slug} />

      <ProductSection section={sections[0]} categorySlug={slug} />

      {/*
        A department with no promo copy written for it shows no
        promo band, rather than empty cards pointing at
        subcategories that may not exist.
      */}
      {promos.length > 0 && (
      <div className="bg-gray-100 py-12">
        <div className="px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {promos.map((promo) => (
              <div
                key={promo.segment}
                className="relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <Image
                  src={PROMO_IMAGE}
                  alt={promo.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
                  <h3 className="mb-2 text-3xl font-bold">{promo.title}</h3>
                  <p className="mb-4 max-w-md">{promo.description}</p>
                  <Button
                    asChild
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    <Link href={`${base}/${promo.segment}`}>Shop Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      <ProductSection section={sections[1]} categorySlug={slug} />
    </div>
  );
}
