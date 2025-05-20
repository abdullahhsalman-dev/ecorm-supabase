import Link from "next/link"

const womenCategories = [
  {
    id: 1,
    name: "Tops",
    image: "/placeholder.svg?height=400&width=400&query=women%20tops",
    href: "/women/tops",
  },
  {
    id: 2,
    name: "Dresses",
    image: "/placeholder.svg?height=400&width=400&query=women%20dresses",
    href: "/women/dresses",
  },
  {
    id: 3,
    name: "Pants",
    image: "/placeholder.svg?height=400&width=400&query=women%20pants",
    href: "/women/pants",
  },
  {
    id: 4,
    name: "Skirts",
    image: "/placeholder.svg?height=400&width=400&query=women%20skirts",
    href: "/women/skirts",
  },
  {
    id: 5,
    name: "Ethnic Wear",
    image: "/placeholder.svg?height=400&width=400&query=women%20ethnic%20wear",
    href: "/women/ethnic-wear",
  },
  {
    id: 6,
    name: "Accessories",
    image: "/placeholder.svg?height=400&width=400&query=women%20accessories",
    href: "/women/accessories",
  },
]

export function WomenCategories() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {womenCategories.map((category) => (
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
