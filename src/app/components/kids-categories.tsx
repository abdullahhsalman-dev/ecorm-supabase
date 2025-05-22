import Link from "next/link";

const kidsCategories = [
  {
    id: 1,
    name: "Boys",
    image: "/boys-clothing.png",
    href: "/kids/boys",
  },
  {
    id: 2,
    name: "Girls",
    image: "",
    href: "/kids/girls",
  },
  {
    id: 3,
    name: "Infants",
    image: "",
    href: "/kids/infants",
  },
  {
    id: 4,
    name: "Teens",
    image: "",
    href: "/kids/teens",
  },
  {
    id: 5,
    name: "School Wear",
    image: "",
    href: "/kids/school-wear",
  },
  {
    id: 6,
    name: "Accessories",
    image: "",
    href: "/kids/accessories",
  },
];

export function KidsCategories() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {kidsCategories.map((category) => (
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
