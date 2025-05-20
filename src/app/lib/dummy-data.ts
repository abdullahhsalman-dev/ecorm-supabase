// Dummy data for testing purposes

export const dummyCategories = [
  {
    id: "1",
    name: "Men",
    slug: "men",
    description: "Men's fashion collection",
  },
  {
    id: "2",
    name: "Women",
    slug: "women",
    description: "Women's fashion collection",
  },
  {
    id: "3",
    name: "Kids",
    slug: "kids",
    description: "Kids' fashion collection",
  },
  {
    id: "4",
    name: "Footwear",
    slug: "footwear",
    description: "Footwear collection",
  },
  {
    id: "5",
    name: "Fragrance",
    slug: "fragrance",
    description: "Fragrance collection",
  },
  {
    id: "6",
    name: "Winter Wear",
    slug: "winter-wear",
    description: "Winter wear collection",
  },
  { id: "7", name: "Sale", slug: "sale", description: "Sale items" },

  // Men subcategories
  {
    id: "101",
    name: "T-Shirts",
    slug: "t-shirts",
    parent_id: "1",
    description: "Men's T-Shirts",
  },
  {
    id: "102",
    name: "Shirts",
    slug: "shirts",
    parent_id: "1",
    description: "Men's Shirts",
  },
  {
    id: "103",
    name: "Pants",
    slug: "pants",
    parent_id: "1",
    description: "Men's Pants",
  },
  {
    id: "104",
    name: "Jeans",
    slug: "jeans",
    parent_id: "1",
    description: "Men's Jeans",
  },
  {
    id: "105",
    name: "Suits",
    slug: "suits",
    parent_id: "1",
    description: "Men's Suits",
  },
  {
    id: "106",
    name: "Formal",
    slug: "formal",
    parent_id: "1",
    description: "Men's Formal Wear",
  },
  {
    id: "107",
    name: "Casual",
    slug: "casual",
    parent_id: "1",
    description: "Men's Casual Wear",
  },

  // Women subcategories
  {
    id: "201",
    name: "Tops",
    slug: "tops",
    parent_id: "2",
    description: "Women's Tops",
  },
  {
    id: "202",
    name: "Dresses",
    slug: "dresses",
    parent_id: "2",
    description: "Women's Dresses",
  },
  {
    id: "203",
    name: "Pants",
    slug: "pants",
    parent_id: "2",
    description: "Women's Pants",
  },
  {
    id: "204",
    name: "Skirts",
    slug: "skirts",
    parent_id: "2",
    description: "Women's Skirts",
  },
  {
    id: "205",
    name: "Ethnic",
    slug: "ethnic",
    parent_id: "2",
    description: "Women's Ethnic Wear",
  },
  {
    id: "206",
    name: "Western",
    slug: "western",
    parent_id: "2",
    description: "Women's Western Wear",
  },
];

export function generateDummyProducts(category: string, count = 12) {
  const products = [];
  const categoryName =
    category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");

  for (let i = 1; i <= count; i++) {
    const id = `${category}-${i}`;
    const hasDiscount = Math.random() > 0.5;
    const price = Math.floor(Math.random() * 5000) + 1000;
    const salePrice = hasDiscount ? Math.floor(price * 0.7) : null;

    products.push({
      id,
      name: `${categoryName} Product ${i}`,
      slug: `${category}-product-${i}`,
      price,
      sale_price: salePrice,
      description: `This is a sample ${categoryName} product for testing purposes.`,
      product_images: [
        {
          image_url: `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
            categoryName
          )} product ${i}`,
          is_primary: true,
        },
        {
          image_url: `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
            categoryName
          )} product ${i} alternate`,
          is_primary: false,
        },
      ],
      categories: {
        slug: category,
      },
      category_id: category,
    });
  }

  return products;
}

export function getDummyProduct(slug: string) {
  const parts = slug.split("-");
  const category = parts[0];
  const id = parts[parts.length - 1];
  const categoryName =
    category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");

  const hasDiscount = Math.random() > 0.5;
  const price = Math.floor(Math.random() * 5000) + 1000;
  const salePrice = hasDiscount ? Math.floor(price * 0.7) : null;

  return {
    id: slug,
    name: `${categoryName} Product ${id}`,
    slug,
    price,
    sale_price: salePrice,
    description: `This is a sample ${categoryName} product for testing purposes. It features high-quality materials and a comfortable fit. Perfect for any occasion, this product is designed to last and provide excellent value for money.`,
    product_images: [
      {
        image_url: `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
          categoryName
        )} product ${id}`,
        is_primary: true,
      },
      {
        image_url: `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
          categoryName
        )} product ${id} alternate view`,
        is_primary: false,
      },
      {
        image_url: `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
          categoryName
        )} product ${id} detail`,
        is_primary: false,
      },
    ],
    categories: {
      id: category,
      name: categoryName,
      slug: category,
    },
    category_id: category,
  };
}

export function getDummyOrders(count = 5) {
  const orders = [];
  const statuses = ["processing", "shipped", "delivered", "cancelled"];
  const paymentStatuses = ["paid", "pending", "failed"];

  for (let i = 1; i <= count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    orders.push({
      id: `order-${i}`,
      created_at: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payment_status:
        paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      total_amount: Math.floor(Math.random() * 10000) + 1000,
      tracking_number:
        Math.random() > 0.5
          ? `TRK${Math.floor(Math.random() * 1000000)}`
          : null,
    });
  }

  return orders;
}

export function getDummyAddresses(count = 2) {
  const addresses = [];

  for (let i = 1; i <= count; i++) {
    addresses.push({
      id: `address-${i}`,
      name: i === 1 ? "Home" : "Office",
      street_address: `${
        Math.floor(Math.random() * 100) + 1
      } Main Street, Apartment ${i}`,
      city: "Karachi",
      state: "Sindh",
      postal_code: `${Math.floor(Math.random() * 10000) + 10000}`,
      country: "Pakistan",
      phone: `+92 300 ${Math.floor(Math.random() * 10000000)}`,
      is_default: i === 1,
    });
  }

  return addresses;
}

export function getDummyWishlistItems(count = 6) {
  const items = [];
  const categories = [
    "men",
    "women",
    "kids",
    "footwear",
    "fragrance",
    "winter-wear",
  ];

  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const hasDiscount = Math.random() > 0.5;
    const price = Math.floor(Math.random() * 5000) + 1000;
    const salePrice = hasDiscount ? Math.floor(price * 0.7) : null;
    const categoryName =
      category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");

    items.push({
      id: `wishlist-item-${i}`,
      product_id: `product-${i}`,
      products: {
        id: `product-${i}`,
        name: `${categoryName} Wishlist Item ${i}`,
        slug: `${category}-product-${i}`,
        price,
        sale_price: salePrice,
        product_images: [
          {
            image_url: `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
              categoryName
            )} wishlist product ${i}`,
            is_primary: true,
          },
        ],
      },
    });
  }

  return items;
}
