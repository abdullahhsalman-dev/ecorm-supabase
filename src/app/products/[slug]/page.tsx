import { notFound } from "next/navigation";
import ProductDetails from "@/components/product-details";
import RelatedProducts from "@/components/related-products";

// Mock data - in a real app, this would come from an API
const products = [
  {
    id: "1",
    name: "Classic Fit Shirt",
    price: 2999,
    salePrice: 2499,
    image: "/placeholder.svg?height=600&width=600&query=classic%20fit%20shirt",
    images: [
      "/placeholder.svg?height=600&width=600&query=classic%20fit%20shirt%20front",
      "/placeholder.svg?height=600&width=600&query=classic%20fit%20shirt%20back",
      "/placeholder.svg?height=600&width=600&query=classic%20fit%20shirt%20detail",
    ],
    category: "Men",
    slug: "classic-fit-shirt",
    description:
      "A comfortable classic fit shirt made from premium cotton fabric. Perfect for formal occasions or everyday office wear.",
    features: [
      "100% Premium Cotton",
      "Classic Fit",
      "Button-Down Collar",
      "Machine Washable",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Blue", "Black"],
    inStock: true,
  },
  {
    id: "2",
    name: "Slim Fit Jeans",
    price: 3499,
    salePrice: null,
    image: "/placeholder.svg?height=600&width=600&query=slim%20fit%20jeans",
    images: [
      "/placeholder.svg?height=600&width=600&query=slim%20fit%20jeans%20front",
      "/placeholder.svg?height=600&width=600&query=slim%20fit%20jeans%20back",
      "/placeholder.svg?height=600&width=600&query=slim%20fit%20jeans%20detail",
    ],
    category: "Men",
    slug: "slim-fit-jeans",
    description:
      "Modern slim fit jeans with a comfortable stretch fabric. These jeans offer both style and comfort for everyday wear.",
    features: [
      "98% Cotton, 2% Elastane",
      "Slim Fit",
      "Five Pocket Design",
      "Machine Washable",
    ],
    sizes: ["30", "32", "34", "36", "38"],
    colors: ["Blue", "Black", "Grey"],
    inStock: true,
  },
];

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product} />
      <RelatedProducts
        currentProductId={product.id}
        category={product.category}
      />
    </div>
  );
}
