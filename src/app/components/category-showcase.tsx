import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

async function getMainCategories() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .is("parent_id", null)
    .limit(6);

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export async function CategoryShowcase() {
  const categories = await getMainCategories();

  return (
    <section className="py-12">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative overflow-hidden rounded-lg"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={
                  category.image_url ||
                  `/placeholder.svg?height=300&width=300&query=${category.name} fashion category`
                }
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/50">
              <h3 className="text-center text-xl font-bold text-white">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
