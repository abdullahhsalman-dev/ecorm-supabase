import Link from "next/link";

const saleCategories = [
  {
    id: 1,
    name: "Men's Sale",
    image: "/placeholder.svg?height=400&width=400&query=men%20fashion%20sale",
    href: "/sale/men",
    discount: "Up to 25% Off",
  },
  {
    id: 2,
    name: "Women's Sale",
    image: "/placeholder.svg?height=400&width=400&query=women%20fashion%20sale",
    href: "/sale/women",
    discount: "Up to 50% Off",
  },
  {
    id: 3,
    name: "Kids' Sale",
    image: "/placeholder.svg?height=400&width=400&query=kids%20fashion%20sale",
    href: "/sale/kids",
    discount: "Up to 30% Off",
  },
  {
    id: 4,
    name: "Footwear Sale",
    image: "/placeholder.svg?height=400&width=400&query=footwear%20sale",
    href: "/sale/footwear",
    discount: "Up to 40% Off",
  },
];

export function SaleCategories() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {saleCategories.map((category) => (
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
            <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity group-hover:bg-opacity-30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <span className="mt-2 rounded-full bg-red-600 px-3 py-1 text-sm font-medium">
                {category.discount}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
