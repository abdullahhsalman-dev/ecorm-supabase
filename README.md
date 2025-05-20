# Diners E-Commerce Store

![Diners E-Commerce Store](https://placeholder.svg?height=400&width=800&query=Diners+E-Commerce+Store+Banner)

## Overview

Diners is a full-featured e-commerce platform built with Next.js, Tailwind CSS, and Supabase. It's designed to provide a seamless shopping experience with a focus on fashion products for men, women, and kids. The platform includes comprehensive product management, user authentication, cart functionality, and order processing.

## Features

### Customer-Facing Features

- **Responsive Design**: Fully responsive UI that works on mobile, tablet, and desktop devices
- **Product Browsing**: Browse products by category, subcategory, and search
- **Product Filtering**: Filter products by price, size, color, and more
- **User Authentication**: Sign up, sign in, and password recovery
- **Shopping Cart**: Add, remove, and update items in cart with persistent storage
- **Wishlist**: Save products for later
- **Checkout Process**: Multi-step checkout with shipping and payment options
- **Order Tracking**: View order history and track current orders
- **User Profiles**: Manage personal information, addresses, and preferences

### Admin Features (Future Implementation)

- **Product Management**: Add, edit, and delete products
- **Inventory Management**: Track stock levels and manage inventory
- **Order Management**: Process orders, update status, and manage returns
- **User Management**: Manage user accounts and permissions
- **Analytics Dashboard**: View sales, traffic, and other key metrics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Project Structure

\`\`\`
diners-ecommerce/
├── app/ # Next.js App Router
│ ├── account/ # User account pages
│ ├── cart/ # Shopping cart
│ ├── checkout/ # Checkout process
│ ├── login/ # Authentication
│ ├── products/ # Product pages
│ ├── [category]/ # Category pages
│ ├── api/ # API routes
│ └── layout.tsx # Root layout
├── components/ # React components
│ ├── ui/ # UI components (shadcn)
│ └── ... # Feature components
├── lib/ # Utility functions
│ ├── supabase/ # Supabase client
│ ├── dummy-data.ts # Dummy data for testing
│ └── utils.ts # Helper functions
├── hooks/ # Custom React hooks
├── context/ # React context providers
├── public/ # Static assets
└── ... # Config files
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

\`\`\`bash
git clone https://github.com/yourusername/diners-ecommerce.git
cd diners-ecommerce
\`\`\`

2. Install dependencies:

\`\`\`bash
npm install

# or

yarn install
\`\`\`

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

\`\`\`

# Supabase

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (provided by Supabase)

POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev

# or

yarn dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

### Schema

The application uses the following database tables:

1. **users** - User accounts and profile information
2. **products** - Product information
3. **categories** - Product categories and subcategories
4. **product_images** - Images associated with products
5. **orders** - Order information
6. **order_items** - Items within orders
7. **addresses** - User shipping and billing addresses
8. **wishlists** - User wishlists
9. **wishlist_items** - Items in wishlists

### Setting Up the Database

You can set up the database tables using the SQL scripts provided in the `database` directory or by running the following SQL commands in your Supabase SQL editor:

\`\`\`sql
-- Create categories table
CREATE TABLE categories (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
slug VARCHAR(255) NOT NULL UNIQUE,
description TEXT,
image_url TEXT,
parent_id UUID REFERENCES categories(id),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
slug VARCHAR(255) NOT NULL UNIQUE,
description TEXT,
price INTEGER NOT NULL,
sale_price INTEGER,
category_id UUID REFERENCES categories(id),
featured BOOLEAN DEFAULT false,
in_stock BOOLEAN DEFAULT true,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_images table
CREATE TABLE product_images (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
product_id UUID REFERENCES products(id) ON DELETE CASCADE,
image_url TEXT NOT NULL,
is_primary BOOLEAN DEFAULT false,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id),
status VARCHAR(50) NOT NULL DEFAULT 'processing',
payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
total_amount INTEGER NOT NULL,
shipping_address_id UUID,
billing_address_id UUID,
tracking_number VARCHAR(255),
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
product_id UUID REFERENCES products(id),
quantity INTEGER NOT NULL,
price INTEGER NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE addresses (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id),
name VARCHAR(255) NOT NULL,
street_address TEXT NOT NULL,
city VARCHAR(255) NOT NULL,
state VARCHAR(255) NOT NULL,
postal_code VARCHAR(20) NOT NULL,
country VARCHAR(255) NOT NULL,
phone VARCHAR(50),
is_default BOOLEAN DEFAULT false,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlists table
CREATE TABLE wishlists (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users(id) UNIQUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist_items table
CREATE TABLE wishlist_items (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
product_id UUID REFERENCES products(id) ON DELETE CASCADE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
UNIQUE(wishlist_id, product_id)
);
\`\`\`

## Testing with Dummy Data

The application includes a comprehensive dummy data system that allows you to test all features without setting up a real database. The dummy data is automatically used when:

1. No real data is found in the database
2. Database queries fail or return errors
3. The user is not authenticated (for user-specific features)

### How Dummy Data Works

The dummy data system is implemented in `lib/dummy-data.ts` and provides the following functions:

- `generateDummyProducts(category, count)` - Generates dummy products for a specific category
- `getDummyProduct(slug)` - Generates a dummy product with the specified slug
- `getDummyOrders(count)` - Generates dummy orders for the account page
- `getDummyAddresses(count)` - Generates dummy addresses for the account page
- `getDummyWishlistItems(count)` - Generates dummy wishlist items

These functions are used throughout the application to ensure that all components have data to display, even when the database is empty or unavailable.

## Deployment

### Deploying to Vercel

1. Create a Vercel account if you don't have one
2. Install the Vercel CLI:

\`\`\`bash
npm install -g vercel
\`\`\`

3. Deploy the application:

\`\`\`bash
vercel
\`\`\`

4. Follow the prompts to configure your deployment
5. Add the environment variables in the Vercel dashboard

### Deploying to Other Platforms

The application can be deployed to any platform that supports Next.js applications, such as:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Render

Follow the platform-specific instructions for deploying a Next.js application.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Submit a pull request

Please follow the existing code style and include appropriate tests for your changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [Vercel](https://vercel.com/)

## Contact

For questions or support, please contact [your-email@example.com](mailto:your-email@example.com).
