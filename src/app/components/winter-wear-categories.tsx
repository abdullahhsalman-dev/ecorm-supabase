import Link from "next/link"

const winterWearCategories = [
  {
    id: 1,
    name: "Men",
    image: "/placeholder.svg?height=400&width=400&query=men%20winter%20wear",
    href: "/winter-wear/men",
  },
  {
    id: 2,
    name: "Women",
    image: "/placeholder.svg?height=400&width=400&query=women%20winter%20wear",
    href: "/winter-wear/women",
  },
  {
    id: 3,
    name: "Kids",
    image: "/placeholder.svg?height=400&width=400&query=kids%20winter%20wear",
    href: "/winter-wear/kids",
  },
  {
    id: 4,
    name: "Jackets",
    image: "/placeholder.svg?height=400&width=400&query=winter%20jackets",
    href: "/winter-wear/jackets",
  },
  {
    id: 5,
    name: "Sweaters",
    image: "/placeholder.svg?height=400&width=400&query=winter%20sweaters",
    href: "/winter-wear/sweaters",
  },
  {
    id: 6,
    name: "Coats",
    image: "/placeholder.svg?height=400&width=400&query=winter%20coats",
    href: "/winter-wear/coats",
  },
]

export function WinterWearCategories() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {winterWearCategories.map((category) => (
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
