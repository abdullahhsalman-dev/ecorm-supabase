-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
--
-- REVIEW BEFORE RUNNING. Nothing in schema.sql enables RLS, so
-- every table is currently readable AND writable by anyone
-- holding the public anon key (it ships in the browser bundle).
--
-- Most urgently: users.user_type gates the admin panel, so
-- without these policies any visitor can run
--
--   update users set user_type = 'admin' where email = '...';
--
-- and let themselves into /admin.
--
-- ------------------------------------------------------------
-- 1. HELPERS
-- ------------------------------------------------------------
-- SECURITY DEFINER so these can read users without re-entering
-- the policies defined on users (which would recurse).

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and user_type = 'admin'
  );
$$;

create or replace function public.current_user_type()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select user_type from public.users where id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 2. PROFILE CREATION
-- ------------------------------------------------------------
-- With email confirmation enabled there is no session at the
-- moment of sign-up, so the browser cannot insert the profile
-- row under RLS. This trigger creates it server-side instead.
--
-- The app's signUp() is written to tolerate a row that already
-- exists, so it keeps working once this trigger is installed.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, password_hash, user_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'managed_by_supabase_auth',  -- schema requires NOT NULL; auth owns the real credential
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ------------------------------------------------------------
-- 3. USERS
-- ------------------------------------------------------------

alter table users enable row level security;

create policy "users_select_own_or_admin" on users
  for select using (id = auth.uid() or public.is_admin());

create policy "users_insert_self" on users
  for insert with check (id = auth.uid());

-- A user may edit their own profile but NOT promote themselves:
-- user_type has to stay exactly what it already is.
create policy "users_update_own" on users
  for update
  using (id = auth.uid())
  with check (id = auth.uid() and user_type = public.current_user_type());

create policy "users_admin_manage" on users
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- 4. CATALOGUE — public read, admin write
-- ------------------------------------------------------------

alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_images   enable row level security;
alter table product_variants enable row level security;

create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "products_public_read" on products for select using (true);
create policy "products_admin_write" on products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_admin_write" on product_images for all
  using (public.is_admin()) with check (public.is_admin());

create policy "product_variants_public_read" on product_variants for select using (true);
create policy "product_variants_admin_write" on product_variants for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- 5. ORDERS — owner reads, admin manages
-- ------------------------------------------------------------

alter table orders      enable row level security;
alter table order_items enable row level security;

create policy "orders_select_own_or_admin" on orders
  for select using (user_id = auth.uid() or public.is_admin());

create policy "orders_insert_own" on orders
  for insert with check (user_id = auth.uid());

-- Guest checkout. A shopper without an account places an order
-- that belongs to nobody; it reaches the admin Orders screen as
-- a Guest. The select policy above is unchanged, so the row
-- stays unreadable to everyone but staff -- which is why the
-- confirmation page is rendered from the browser's own state.
create policy "orders_insert_guest" on orders
  for insert with check (user_id is null);

-- Only staff change fulfilment state, which is what the admin
-- Orders screen does.
create policy "orders_admin_update" on orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "order_items_select_own_or_admin" on order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "order_items_insert_own" on order_items
  for insert with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- The lines of a guest order. Anyone holding the order's uuid
-- can append to it, which is the cost of writing guest orders
-- straight from the browser; move placement into a security
-- definer function if that ever needs closing.
create policy "order_items_insert_guest" on order_items
  for insert with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.user_id is null
    )
  );

create policy "order_items_admin_manage" on order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- 6. CARTS & WISHLISTS — strictly the owner's
-- ------------------------------------------------------------
--
-- NOTE: guest carts (user_id null, identified only by
-- session_id) are NOT covered. Allowing anonymous access to
-- them would let anyone read any guest cart by guessing a
-- session id. Decide whether guest carts should live in the
-- database at all, or stay in localStorage as they do today.

alter table carts          enable row level security;
alter table cart_items     enable row level security;
alter table wishlists      enable row level security;
alter table wishlist_items enable row level security;

create policy "carts_own" on carts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "cart_items_own" on cart_items
  for all using (
    exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );

create policy "wishlists_own" on wishlists
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "wishlist_items_own" on wishlist_items
  for all using (
    exists (select 1 from wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
  );

-- ------------------------------------------------------------
-- 7. GRANT YOURSELF ADMIN
-- ------------------------------------------------------------
-- Run once, from the SQL editor (which bypasses RLS), or you
-- will lock yourself out of /admin.
--
-- update users set user_type = 'admin' where email = 'you@example.com';

-- ------------------------------------------------------------
-- 8. ADDRESSES — strictly the owner's
-- ------------------------------------------------------------
--
-- Staff have no reason to browse saved addresses: an order
-- already carries the address it was shipped to.

alter table addresses enable row level security;

create policy "addresses_own" on addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
