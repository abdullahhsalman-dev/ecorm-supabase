import { DepartmentPage } from "@/src/app/components/department-page";
import {
  fetchCategoriesBySlugs,
  fetchRootCategories,
  type CategoryRecord,
} from "@/src/app/lib/categories";
import { buildDepartment, RESERVED_SLUGS } from "@/src/app/lib/departments";
import { createClient } from "@/src/app/lib/supabase/server";
import { notFound } from "next/navigation";

/*
 * ---------------------------------------------------------
 * DEPARTMENT LANDING PAGE
 * ---------------------------------------------------------
 *
 * /men, /women, /kids, /footwear, /fragrance, /winter-wear -
 * and whatever top-level category an admin creates next. Each
 * used to be its own directory, which is how the route
 * `/fragnance` came to disagree with the slug `fragrance`.
 * Here the URL segment IS the slug, so the two cannot drift.
 */

type PageProps = {
  /* Next 15 delivers route props as promises. */
  params: Promise<{ department: string }>;
};

/*
 * Prerender the departments that exist at build time. Anything
 * created afterwards still renders on demand - dynamicParams
 * defaults to true - so a new department is live without a
 * deploy.
 */
export async function generateStaticParams() {
  try {
    const roots = await fetchRootCategories(undefined, createClient());

    return roots
      .filter((category) => !RESERVED_SLUGS.has(category.slug))
      .map((category) => ({ department: category.slug }));
  } catch (error) {
    /* A build without a database still has to produce a site. */
    console.error("Could not enumerate departments:", error);
    return [];
  }
}

/* Categories change through the admin, so pages go stale. */
export const revalidate = 300;

/*
 * A department is a category with no parent. A child slug, an
 * unknown slug, or one shadowed by a static route is a 404 -
 * without this an arbitrary URL would render an empty page
 * that looks like a real department.
 */
async function getDepartmentCategory(slug: string): Promise<CategoryRecord | null> {
  if (RESERVED_SLUGS.has(slug)) {
    return null;
  }

  const rows = await fetchCategoriesBySlugs([slug], createClient());
  const category = rows[0];

  return category && !category.parent_id ? category : null;
}

export async function generateMetadata({ params }: PageProps) {
  const { department: slug } = await params;
  const category = await getDepartmentCategory(slug);

  if (!category) {
    return {};
  }

  const department = buildDepartment(category);

  return {
    title: department.metaTitle,
    description: department.metaDescription,
    /* Its own, or it inherits one and drops out of the index. */
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "website",
      title: department.metaTitle,
      description: department.metaDescription,
      url: `/${slug}`,
    },
  };
}

export default async function DepartmentRoute({ params }: PageProps) {
  const { department: slug } = await params;
  const category = await getDepartmentCategory(slug);

  if (!category) {
    notFound();
  }

  return <DepartmentPage department={buildDepartment(category)} />;
}
