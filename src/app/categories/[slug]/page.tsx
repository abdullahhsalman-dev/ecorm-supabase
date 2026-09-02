import {
  fetchCategoriesBySlugs,
  fetchCategoryById,
} from "@/src/app/lib/categories";
import { childSegment, sectionHref } from "@/src/app/lib/navigation";
import { createClient } from "@/src/app/lib/supabase/server";
import { notFound, permanentRedirect } from "next/navigation";

/*
 * ---------------------------------------------------------
 * CATEGORY URL CANONICALISER
 * ---------------------------------------------------------
 *
 * Every category now has exactly one address: /men for a
 * department, /men/t-shirts for one of its children. This
 * route used to render a second, parallel listing at
 * /categories/men - the same content on a different URL, which
 * splits search ranking between them and leaves no obvious
 * answer to "which one do I link to".
 *
 * It survives as a redirect so the older links keep working.
 */

type PageProps = {
  /* Next 15 delivers route props as promises. */
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export default async function CategoryRedirect({ params }: PageProps) {
  const { slug } = await params;

  const client = createClient();
  const [category] = await fetchCategoriesBySlugs([slug], client);

  if (!category) {
    notFound();
  }

  /* A department is addressed by its slug alone. */
  if (!category.parent_id) {
    permanentRedirect(sectionHref(category.slug));
  }

  const parent = await fetchCategoryById(category.parent_id, client);

  /*
   * A child whose parent has since been deleted has no route to
   * point at, so it is genuinely gone rather than redirected.
   */
  if (!parent) {
    notFound();
  }

  permanentRedirect(
    `${sectionHref(parent.slug)}/${childSegment(category.slug, parent.slug)}`,
  );
}
