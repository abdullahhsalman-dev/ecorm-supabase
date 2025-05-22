import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    id: 1,
    name: "Men",
    image:
      "/placeholder.svg?height=400&width=400&query=men%20fashion%20category",
    href: "/men",
  },
  {
    id: 2,
    name: "Women",
    image:
      "/placeholder.svg?height=400&width=400&query=women%20fashion%20category",
    href: "/women",
  },
  {
    id: 3,
    name: "Kids",
    image:
      "/placeholder.svg?height=400&width=400&query=kids%20fashion%20category",
    href: "/kids",
  },
  {
    id: 4,
    name: "Footwear",
    image:
      "/placeholder.svg?height=400&width=400&query=footwear%20fashion%20category",
    href: "/footwear",
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group overflow-hidden rounded-lg"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={category.image || ""}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity group-hover:bg-opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
