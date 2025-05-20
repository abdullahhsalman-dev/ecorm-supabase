import Link from "next/link";

const fragranceCategories = [
  {
    id: 1,
    name: "Men",
    image: "/placeholder.svg?height=400&width=400&query=men%20fragrance",
    href: "/fragrance/men",
  },
  {
    id: 2,
    name: "Women",
    image: "/placeholder.svg?height=400&width=400&query=women%20fragrance",
    href: "/fragrance/women",
  },
  {
    id: 3,
    name: "Unisex",
    image: "/placeholder.svg?height=400&width=400&query=unisex%20fragrance",
    href: "/fragrance/unisex",
  },
  {
    id: 4,
    name: "Gift Sets",
    image:
      "/placeholder.svg?height=400&width=400&query=fragrance%20gift%20sets",
    href: "/fragrance/gift-sets",
  },
  {
    id: 5,
    name: "Body Sprays",
    image: "/placeholder.svg?height=400&width=400&query=body%20spray",
    href: "/fragrance/body-sprays",
  },
  {
    id: 6,
    name: "Luxury",
    image: "/placeholder.svg?height=400&width=400&query=luxury%20perfume",
    href: "/fragrance/luxury",
  },
];

export function FragranceCategories() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {fragranceCategories.map((category) => (
        <Link
          key={category.id}
          href={category.href}
          className="group overflow-hidden rounded-lg"
        >
          <div className="relative aspect-square overflow-hidden">
            <img
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity group-hover:bg-opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-center text-lg font-bold text-white">
                {category.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
