import Link from "next/link"

const menCategories = [
  {
    id: 1,
    name: "T-Shirts",
    image: "/placeholder.svg?height=400&width=400&query=men%20tshirts",
    href: "/men/t-shirts",
  },
  {
    id: 2,
    name: "Shirts",
    image: "/placeholder.svg?height=400&width=400&query=men%20shirts",
    href: "/men/shirts",
  },
  {
    id: 3,
    name: "Pants",
    image: "/placeholder.svg?height=400&width=400&query=men%20pants",
    href: "/men/pants",
  },
  {
    id: 4,
    name: "Jeans",
    image: "/placeholder.svg?height=400&width=400&query=men%20jeans",
    href: "/men/jeans",
  },
  {
    id: 5,
    name: "Suits",
    image: "/placeholder.svg?height=400&width=400&query=men%20suits",
    href: "/men/suits",
  },
  {
    id: 6,
    name: "Activewear",
    image: "/placeholder.svg?height=400&width=400&query=men%20activewear",
    href: "/men/activewear",
  },
]

export function MenCategories() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {menCategories.map((category) => (
        <Link key={category.id} href={category.href} className="group overflow-hidden rounded-lg">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity group-hover:bg-opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-center text-lg font-bold text-white">{category.name}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
