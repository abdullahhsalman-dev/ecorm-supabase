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
-- could append to it, which was the cost of writing guest
-- orders straight from the browser. Section 9 closes that: it
-- moves placement into a SECURITY DEFINER function and drops
-- this policy, so the definition below is only what section 9
-- then takes away.
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


-- ============================================================
-- REVIEWS
-- ============================================================
--
-- Star ratings and written reviews on products, with the two
-- things a storefront needs around them: a "Verified purchase"
-- badge the shopper cannot award themselves, and a moderation
-- switch for the admin panel.
--
-- Safe to run on an existing database -- it adds one table, one
-- view, two functions and their policies, and touches nothing
-- that is already there.

-- ------------------------------------------------------------
-- 1. HELPER
-- ------------------------------------------------------------
-- SECURITY DEFINER so it can see orders that the calling
-- shopper's own policies would hide (a guest order that was
-- later claimed, an order row read through order_items).

-- Where a brand new review starts its life. Used both as the
-- column default and by the trigger that overwrites whatever
-- status a client tried to send, so switching the store to
-- approve-before-publish is this one word.

CREATE OR REPLACE FUNCTION public.default_review_status()
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'published'::TEXT;
$$;

CREATE OR REPLACE FUNCTION public.has_purchased_product(
  p_product_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = p_product_id
      AND o.user_id = p_user_id
  );
$$;

-- ------------------------------------------------------------
-- 2. TABLE
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(150),
  body TEXT,

  -- Copied from users.full_name when the review is written.
  --
  -- Not a join: users is readable only by its owner and by
  -- staff (users_select_own_or_admin), so embedding the author
  -- would render every review by somebody else as anonymous.
  -- Storing it also keeps the byline the review was published
  -- under if the shopper later renames themselves.
  reviewer_name VARCHAR(255) NOT NULL DEFAULT '',

  -- Reviews appear immediately and staff hide the bad ones.
  -- default_review_status() above is the switch: return
  -- 'hidden' from it and the store becomes approve-before-
  -- publish, which the admin screen already handles.
  status VARCHAR(20) NOT NULL DEFAULT public.default_review_status()
    CHECK (status IN ('published', 'hidden')),

  -- Stamped by the trigger below, never by the client.
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,

  -- The store's public reply, shown under the review.
  admin_response TEXT,
  admin_response_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One review per shopper per product. The form upserts on
  -- this, so writing again edits the review already there.
  CONSTRAINT reviews_one_per_product_per_user UNIQUE (product_id, user_id)
);

-- ------------------------------------------------------------
-- 3. WHAT THE CLIENT MAY NOT SET
-- ------------------------------------------------------------
-- RLS decides which ROWS you may touch; it does not stop you
-- sending whatever COLUMNS you like in a row you own. Every
-- field a shopper must not choose for themselves is therefore
-- overwritten here, on the way in.

CREATE OR REPLACE FUNCTION public.handle_review_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  previous_response TEXT;
BEGIN
  NEW.updated_at := NOW();

  -- The badge is a fact about orders, recomputed on every
  -- write rather than accepted from the browser.
  NEW.is_verified_purchase :=
    public.has_purchased_product(NEW.product_id, NEW.user_id);

  -- The byline follows the profile, not the payload.
  SELECT COALESCE(u.full_name, '')
    INTO NEW.reviewer_name
    FROM public.users u
   WHERE u.id = NEW.user_id;

  NEW.reviewer_name := COALESCE(NEW.reviewer_name, '');

  IF TG_OP = 'INSERT' THEN
    previous_response := NULL;
  ELSE
    previous_response := OLD.admin_response;
    NEW.created_at := OLD.created_at;
  END IF;

  -- Moderation and the store's reply belong to staff. Without
  -- this a shopper could un-hide their own review, or publish
  -- an "official" response to it, by including those columns
  -- in an update of a row they legitimately own.
  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.status := public.default_review_status();
      NEW.admin_response := NULL;
      NEW.admin_response_at := NULL;
    ELSE
      NEW.status := OLD.status;
      NEW.admin_response := OLD.admin_response;
      NEW.admin_response_at := OLD.admin_response_at;
    END IF;

    RETURN NEW;
  END IF;

  -- Staff: the reply timestamp tracks the reply itself, so the
  -- admin screen never has to remember to send it.
  IF NEW.admin_response IS DISTINCT FROM previous_response THEN
    NEW.admin_response_at :=
      CASE WHEN NEW.admin_response IS NULL THEN NULL ELSE NOW() END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_before_write ON reviews;

CREATE TRIGGER reviews_before_write
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_write();

-- ------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ------------------------------------------------------------
-- Anyone may read a published review -- including signed-out
-- visitors, since the product page is public. A shopper can
-- always see their own, so a hidden review does not silently
-- vanish from under them.
--
-- Writing requires an account: user_id = auth.uid() leaves no
-- way to post as somebody else, and the unique constraint
-- above caps it at one review per product.
--
-- Note that a review does NOT require a purchase. Verified
-- ones simply carry the badge. To make buying a precondition,
-- add to reviews_insert_own:
--
--   AND public.has_purchased_product(product_id, auth.uid())

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (
    status = 'published'
    OR user_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "reviews_admin_manage" ON reviews
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 5. AGGREGATE
-- ------------------------------------------------------------
-- The average, the total and the 5..1 histogram, so a product
-- page renders its rating summary in one round trip instead of
-- pulling every review down to count them in the browser.
--
-- security_invoker means the view runs under the RLS of
-- whoever queries it rather than its owner's; without it a
-- view in public would quietly hand out rows the caller's own
-- policies deny. The status filter is what keeps the numbers
-- identical for everyone -- staff and authors can read hidden
-- reviews, but hidden reviews never move the average.

CREATE OR REPLACE VIEW public.product_review_stats
WITH (security_invoker = true) AS
  SELECT
    product_id,
    COUNT(*)::INT                               AS review_count,
    ROUND(AVG(rating)::NUMERIC, 2)              AS average_rating,
    COUNT(*) FILTER (WHERE rating = 5)::INT     AS five_star,
    COUNT(*) FILTER (WHERE rating = 4)::INT     AS four_star,
    COUNT(*) FILTER (WHERE rating = 3)::INT     AS three_star,
    COUNT(*) FILTER (WHERE rating = 2)::INT     AS two_star,
    COUNT(*) FILTER (WHERE rating = 1)::INT     AS one_star
  FROM public.reviews
  WHERE status = 'published'
  GROUP BY product_id;

GRANT SELECT ON public.product_review_stats TO anon, authenticated;

-- ------------------------------------------------------------
-- 6. INDEXES
-- ------------------------------------------------------------

-- The product page: this product's reviews, newest first.
CREATE INDEX IF NOT EXISTS reviews_product_id_created_at_idx
  ON reviews (product_id, created_at DESC);

-- The average and histogram above scan a product's rows.
CREATE INDEX IF NOT EXISTS reviews_product_id_rating_idx
  ON reviews (product_id, rating) WHERE status = 'published';

-- The admin moderation queue, and "my reviews".
CREATE INDEX IF NOT EXISTS reviews_created_at_idx
  ON reviews (created_at DESC);

CREATE INDEX IF NOT EXISTS reviews_user_id_idx
  ON reviews (user_id);


-- ============================================================
-- CATALOGUE IMAGE STORAGE
-- ============================================================
--
-- Product and category art is uploaded from the admin panel
-- instead of being pasted in as a third-party link, so it lives
-- in one public bucket that next.config.ts already allow-lists.
-- Objects are keyed products/... and categories/... .
--
-- Safe to run on an existing database -- the bucket is created
-- once and its limits are re-applied on every run.

-- ------------------------------------------------------------
-- 1. BUCKET
-- ------------------------------------------------------------
-- Public: the storefront reads images with the anon key and no
-- signed URLs. 2 MB / image, enforced by storage itself as well
-- as by the admin form.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Lamees-images',
  'Lamees-images',
  TRUE,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ------------------------------------------------------------
-- 2. POLICIES - anyone reads, only admins write
-- ------------------------------------------------------------
-- The bucket being public covers reads through the CDN; the
-- SELECT policy is what lets the client list and read objects
-- through the API. Writes go through public.is_admin(), the
-- same gate the catalogue tables use.

DROP POLICY IF EXISTS "lamees_images_public_read" ON storage.objects;
CREATE POLICY "lamees_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'Lamees-images');

DROP POLICY IF EXISTS "lamees_images_admin_insert" ON storage.objects;
CREATE POLICY "lamees_images_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'Lamees-images' AND public.is_admin());

DROP POLICY IF EXISTS "lamees_images_admin_update" ON storage.objects;
CREATE POLICY "lamees_images_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'Lamees-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'Lamees-images' AND public.is_admin());

DROP POLICY IF EXISTS "lamees_images_admin_delete" ON storage.objects;
CREATE POLICY "lamees_images_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'Lamees-images' AND public.is_admin());


select tgname from pg_trigger where tgname = 'on_auth_user_created';


-- ------------------------------------------------------------
-- 9. ATOMIC ORDER PLACEMENT
-- ------------------------------------------------------------
--
-- Placing an order is a single SECURITY DEFINER transaction so
-- that the header, its lines and the stock decrements are
-- all-or-nothing, and so the conditional decrement cannot
-- oversell under concurrency. The browser has no insert
-- permission on orders or order_items as a result - the insert
-- policies that used to grant it are dropped at the end.
--
-- ------------------------------------------------------------
-- 1. THE FUNCTION
-- ------------------------------------------------------------
--
-- p_items is the cart, as a json array:
--   [{ "product_id": uuid,
--      "variant_ids": [uuid, ...],
--      "quantity": int,
--      "unit_price": numeric }, ...]
--
-- Returns the new order id.

create or replace function public.place_order(
  p_user_id          uuid,
  p_shipping_address text,
  p_payment_method   text,
  p_notes            text,
  p_total_amount     numeric,
  p_items            jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id   uuid;
  v_item       jsonb;
  v_product_id uuid;
  v_variant_id uuid;
  v_quantity   integer;
  v_unit_price numeric;
  v_name       text;
  v_available  integer;
begin
  /*
   * SECURITY DEFINER means RLS is not consulted inside here, so the checks
   * the policies would have made have to be made by hand.
   *
   * A signed-in shopper may only order as themselves; p_user_id null is a
   * guest order, which is allowed from an anonymous session.
   */
  if p_user_id is not null and p_user_id is distinct from auth.uid() then
    raise exception 'Cannot place an order on behalf of another account.'
      using errcode = '42501';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cannot place an order with an empty cart.';
  end if;

  insert into public.orders (
    user_id, status, total_amount, shipping_address,
    billing_address, payment_method, payment_status, notes
  )
  values (
    p_user_id, 'pending', p_total_amount, p_shipping_address,
    null, p_payment_method, 'pending', p_notes
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity   := (v_item ->> 'quantity')::integer;
    v_unit_price := (v_item ->> 'unit_price')::numeric;

    /* order_items records one variant per line; the cart may hold several
     * (size *and* colour), and every one of them has to be decremented. */
    v_variant_id := (v_item -> 'variant_ids' ->> 0)::uuid;

    if v_quantity is null or v_quantity < 1 then
      raise exception 'Every cart line needs a quantity of at least 1.';
    end if;

    select name into v_name from public.products where id = v_product_id;

    if v_name is null then
      raise exception 'That product is no longer available.';
    end if;

    if v_variant_id is null then
      /*
       * The conditional UPDATE is what makes this safe under concurrency:
       * READ COMMITTED re-evaluates the WHERE clause after waiting on a
       * row another transaction has locked, so two shoppers racing for the
       * last unit cannot both satisfy stock_quantity >= v_quantity.
       */
      update public.products
         set stock_quantity = stock_quantity - v_quantity,
             updated_at     = now()
       where id = v_product_id
         and stock_quantity >= v_quantity;

      if not found then
        select stock_quantity into v_available
          from public.products where id = v_product_id;

        raise exception '% — only % left, % requested.',
          v_name, coalesce(v_available, 0), v_quantity;
      end if;
    else
      /* Each chosen option carries its own stock, so each is decremented. */
      declare
        v_each uuid;
      begin
        for v_each in
          select (value #>> '{}')::uuid from jsonb_array_elements(v_item -> 'variant_ids')
        loop
          update public.product_variants
             set stock_quantity = stock_quantity - v_quantity,
                 updated_at     = now()
           where id = v_each
             and product_id = v_product_id
             and stock_quantity >= v_quantity;

          if not found then
            select stock_quantity into v_available
              from public.product_variants where id = v_each;

            raise exception '% — only % left, % requested.',
              v_name, coalesce(v_available, 0), v_quantity;
          end if;
        end loop;
      end;
    end if;

    insert into public.order_items (
      order_id, product_id, product_variant_id,
      quantity, unit_price, total_price
    )
    values (
      v_order_id, v_product_id, v_variant_id,
      v_quantity, v_unit_price, round(v_unit_price * v_quantity, 2)
    );
  end loop;

  return v_order_id;
end;
$$;

/*
 * The browser calls this as the anon or authenticated role. Nothing else
 * needs it, and revoking from public keeps it off any other role.
 */
revoke all on function public.place_order(uuid, text, text, text, numeric, jsonb) from public;
grant execute on function public.place_order(uuid, text, text, text, numeric, jsonb)
  to anon, authenticated;

-- ------------------------------------------------------------
-- 2. CLOSE THE DIRECT WRITE PATHS
-- ------------------------------------------------------------
--
-- place_order is now the only way an order is created, so the
-- browser does not need insert permission on either table. In
-- particular this retires order_items_insert_guest, which let
-- anyone holding an order's uuid append lines to it.
--
-- Reads are untouched: a shopper still sees their own orders,
-- and staff still see and update everything.

drop policy if exists "orders_insert_own"       on orders;
drop policy if exists "orders_insert_guest"     on orders;
drop policy if exists "order_items_insert_own"  on order_items;
drop policy if exists "order_items_insert_guest" on order_items;
