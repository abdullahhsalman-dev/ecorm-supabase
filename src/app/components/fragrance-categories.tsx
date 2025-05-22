import Link from "next/link";

const fragranceCategories = [
  {
    id: 1,
    name: "Men",
    image: "",
    href: "/fragrance/men",
  },
  {
    id: 2,
    name: "Women",
    image: "",
    href: "/fragrance/women",
  },
  {
    id: 3,
    name: "Unisex",
    image: "",
    href: "/fragrance/unisex",
  },
  {
    id: 4,
    name: "Gift Sets",
    image: "",
    href: "/fragrance/gift-sets",
  },
  {
    id: 5,
    name: "Body Sprays",
    image: "",
    href: "/fragrance/body-sprays",
  },
  {
    id: 6,
    name: "Luxury",
    image: "",
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
              src={category.image || ""}
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
