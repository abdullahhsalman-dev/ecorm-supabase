import Link from "next/link";
import Image from "next/image";

// Mock data - in a real app, this would come from an API
const products = [
  {
    id: "1",
    name: "Classic Fit Shirt",
    price: 2999,
    salePrice: 2499,
    image: "/placeholder.svg?height=400&width=300&query=classic%20fit%20shirt",
    category: "Men",
    slug: "classic-fit-shirt",
  },
  {
    id: "2",
    name: "Slim Fit Jeans",
    price: 3499,
    salePrice: null,
    image: "/placeholder.svg?height=400&width=300&query=slim%20fit%20jeans",
    category: "Men",
    slug: "slim-fit-jeans",
  },
  {
    id: "3",
    name: "Floral Print Dress",
    price: 4999,
    salePrice: 3999,
    image: "/placeholder.svg?height=400&width=300&query=floral%20print%20dress",
    category: "Women",
    slug: "floral-print-dress",
  },
  {
    id: "4",
    name: "Leather Jacket",
    price: 7999,
    salePrice: null,
    image: "/placeholder.svg?height=400&width=300&query=leather%20jacket",
    category: "Women",
    slug: "leather-jacket",
  },
];

type RelatedProductsProps = {
  currentProductId: string;
  category: string;
};

export default function RelatedProducts({
  currentProductId,
  category,
}: RelatedProductsProps) {
  // Filter products by category and exclude current product
  const relatedProducts = products
    .filter(
      (product) =>
        product.category === category && product.id !== currentProductId
    )
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <h2 className="mb-8 text-2xl font-bold">Related Products</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <div key={product.id} className="group">
            <div className="mb-4 aspect-[3/4] overflow-hidden rounded-md bg-gray-100">
              <Link href={`/products/${product.slug}`}>
                <div className="relative h-full w-full">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
              {product.salePrice && (
                <div className="absolute left-0 top-2 bg-red-600 px-2 py-1 text-xs font-medium text-white">
                  SALE
                </div>
              )}
            </div>
            <div>
              <Link href={`/products/${product.slug}`}>
                <h3 className="mb-1 font-medium">{product.name}</h3>
              </Link>
              <p className="mb-2 text-sm text-gray-500">{product.category}</p>
              <div className="mb-4 flex items-center">
                {product.salePrice ? (
                  <>
                    <span className="font-semibold">
                      Rs. {product.salePrice.toLocaleString()}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold">
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
