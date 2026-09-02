-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_images table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variants table (for size, color, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  value VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  billing_address TEXT,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart table
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist_items table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users
ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'user';

ALTER TABLE users
ADD CONSTRAINT users_user_type_check
CHECK (user_type IN ('admin', 'user'));


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
--
-- Added alongside the login/signup work. Everything above this
-- line leaves RLS off, which means every table is readable AND
-- writable by anyone holding the public anon key (it ships in
-- the browser bundle).
--
-- Most urgently: users.user_type gates the admin panel, so
-- without these policies any visitor can run
--
--   update users set user_type = 'admin' where email = '...';
--
-- and let themselves into /admin.
--
-- REVIEW THIS SECTION BEFORE RUNNING IT against a database
-- that already holds data.

-- ------------------------------------------------------------
-- 1. HELPERS
-- ------------------------------------------------------------
-- SECURITY DEFINER so these can read users without re-entering
-- the policies defined on users (which would recurse).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND user_type = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_type()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type FROM public.users WHERE id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 2. PROFILE CREATION
-- ------------------------------------------------------------
-- users.id is expected to equal the Supabase Auth user id, so
-- that orders.user_id, carts.user_id and wishlists.user_id can
-- be joined back to the signed-in user.
--
-- With email confirmation enabled there is no session at the
-- moment of sign-up, so the browser cannot insert the profile
-- row under RLS. This trigger creates it server-side instead.
-- The app's signUp() tolerates a row that already exists, so it
-- keeps working once this trigger is installed.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, password_hash, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'managed_by_supabase_auth',  -- password_hash is NOT NULL; auth owns the real credential
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------
-- 3. USERS
-- ------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_or_admin" ON users
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users_insert_self" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- A user may edit their own profile but NOT promote themselves:
-- user_type has to stay exactly what it already is.
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND user_type = public.current_user_type());

CREATE POLICY "users_admin_manage" ON users
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 4. CATALOGUE - public read, admin write
-- ------------------------------------------------------------

ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON categories FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON products FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "product_images_public_read" ON product_images FOR SELECT USING (true);
CREATE POLICY "product_images_admin_write" ON product_images FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "product_variants_public_read" ON product_variants FOR SELECT USING (true);
CREATE POLICY "product_variants_admin_write" ON product_variants FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 5. ORDERS - owner reads, admin manages
-- ------------------------------------------------------------

ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own_or_admin" ON orders
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Guest checkout. A shopper without an account places an order
-- that belongs to nobody; it reaches the admin Orders screen as
-- a Guest. The SELECT policy above is unchanged, so the row
-- stays unreadable to everyone but staff -- which is why the
-- confirmation page is rendered from the browser's own state.
CREATE POLICY "orders_insert_guest" ON orders
  FOR INSERT WITH CHECK (user_id IS NULL);

-- Only staff change fulfilment state, which is what the admin
-- Orders screen does.
CREATE POLICY "orders_admin_update" ON orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "order_items_select_own_or_admin" ON order_items
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- The lines of a guest order. Anyone holding the order's uuid
-- can append to it, which is the cost of writing guest orders
-- straight from the browser; move placement into a SECURITY
-- DEFINER function if that ever needs closing.
CREATE POLICY "order_items_insert_guest" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.user_id IS NULL
    )
  );

CREATE POLICY "order_items_admin_manage" ON order_items
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 6. CARTS & WISHLISTS - strictly the owner's
-- ------------------------------------------------------------
--
-- NOTE: guest carts (user_id NULL, identified only by
-- session_id) are NOT covered. Allowing anonymous access to
-- them would let anyone read any guest cart by guessing a
-- session id. Decide whether guest carts should live in the
-- database at all, or stay in localStorage as they do today.

ALTER TABLE carts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carts_own" ON carts
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "cart_items_own" ON cart_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
  );

CREATE POLICY "wishlists_own" ON wishlists
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "wishlist_items_own" ON wishlist_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM wishlists w WHERE w.id = wishlist_items.wishlist_id AND w.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM wishlists w WHERE w.id = wishlist_items.wishlist_id AND w.user_id = auth.uid())
  );

-- ------------------------------------------------------------
-- 7. GRANT YOURSELF ADMIN
-- ------------------------------------------------------------
-- Run once, from the SQL editor (which bypasses RLS), or you
-- will lock yourself out of /admin.
--
-- UPDATE users SET user_type = 'admin' WHERE email = 'you@example.com';


-- ============================================================
-- OPTIONAL CONSTRAINTS
-- ============================================================
--
-- Not applied. Each of these makes the database enforce a rule
-- the application already assumes, but each can FAIL on a table
-- that already holds rows breaking it. Check your data first,
-- then uncomment.

-- The app writes users.id = the Supabase Auth user id. This
-- makes that binding real and cleans up profiles when an auth
-- user is deleted. Fails if any users row has an id that is not
-- in auth.users -- profiles created before that fix will.
--
-- ALTER TABLE users
-- ADD CONSTRAINT users_id_fkey
-- FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- The admin Orders screen offers exactly these values, matching
-- the users_user_type_check pattern above. Fails if existing
-- orders use anything else.
--
-- ALTER TABLE orders
-- ADD CONSTRAINT orders_status_check
-- CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));
--
-- ALTER TABLE orders
-- ADD CONSTRAINT orders_payment_status_check
-- CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));


-- ============================================================
-- ADDRESSES
-- ============================================================
--
-- Added after the fact: the account Addresses tab was querying
-- a table that had never been created, so every load failed and
-- fell back to sample rows. This is that table.
--
-- Safe to run on an existing database -- it creates one new
-- table and touches nothing else.

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- What the shopper calls it: "Home", "Office".
  name VARCHAR(100) NOT NULL,
  street_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
  phone VARCHAR(20),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- The tab lists a shopper's own addresses, default first.
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses (user_id);

-- At most one default per shopper. The app clears the previous
-- default before setting a new one; this makes that a rule
-- rather than a convention.
CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default_per_user
  ON addresses (user_id) WHERE is_default;

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Strictly the owner's, like carts and wishlists. Staff have no
-- reason to browse them: an order already carries the address it
-- was shipped to.
CREATE POLICY "addresses_own" ON addresses
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());


-- ============================================================
-- INDEXES
-- ============================================================
--
-- Postgres indexes primary keys and UNIQUE columns for you. It
-- does NOT index foreign keys -- so every join and every
-- "children of this row" lookup below was a sequential scan.
--
-- At 31 products that costs nothing. It is the difference
-- between a fast and an unusable catalogue at 10,000, and
-- adding them later means doing it on a live table.
--
-- Each is CREATE INDEX IF NOT EXISTS, so this block is safe to
-- re-run. On a large table prefer CREATE INDEX CONCURRENTLY,
-- which does not hold a write lock.

-- The product page loads images and variants for one product.
CREATE INDEX IF NOT EXISTS product_images_product_id_idx
  ON product_images (product_id);

CREATE INDEX IF NOT EXISTS product_variants_product_id_idx
  ON product_variants (product_id);

-- Every category listing filters products by category.
CREATE INDEX IF NOT EXISTS products_category_id_idx
  ON products (category_id);

-- The homepage strip, and the default catalogue ordering.
CREATE INDEX IF NOT EXISTS products_featured_idx
  ON products (featured) WHERE featured;

CREATE INDEX IF NOT EXISTS products_created_at_idx
  ON products (created_at DESC);

-- The navigation tree and the admin category cards both ask
-- for the children of a parent.
CREATE INDEX IF NOT EXISTS categories_parent_id_idx
  ON categories (parent_id);

-- A product can only be in a wishlist once. The app checks
-- before inserting, but two quick clicks on the heart race each
-- other; this settles it in the database.
CREATE UNIQUE INDEX IF NOT EXISTS wishlist_items_unique_product
  ON wishlist_items (wishlist_id, product_id);

-- The account Orders tab: one customer's orders, newest first.
CREATE INDEX IF NOT EXISTS orders_user_id_created_at_idx
  ON orders (user_id, created_at DESC);

-- The admin Orders list, and the dashboard's recent orders.
CREATE INDEX IF NOT EXISTS orders_created_at_idx
  ON orders (created_at DESC);

-- The order drawer loads the lines of one order.
CREATE INDEX IF NOT EXISTS order_items_order_id_idx
  ON order_items (order_id);

-- Carts and wishlists are always read by owner.
CREATE INDEX IF NOT EXISTS carts_user_id_idx
  ON carts (user_id);

CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx
  ON cart_items (cart_id);

CREATE INDEX IF NOT EXISTS wishlists_user_id_idx
  ON wishlists (user_id);

CREATE INDEX IF NOT EXISTS wishlist_items_wishlist_id_idx
  ON wishlist_items (wishlist_id);
