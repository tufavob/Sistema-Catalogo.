create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null,
  model text not null default '',
  storage text,
  color text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'available'
    check (status in ('available', 'out_of_stock', 'promo')),
  image_url text,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx
  on public.products (category_id);

create index if not exists products_status_idx
  on public.products (status);

alter table public.categories enable row level security;
alter table public.products enable row level security;

truncate table public.categories cascade;

insert into public.categories (name, slug) values
  ('iPhone', 'iphone'),
  ('Accesorios', 'accesorios'),
  ('Ropa', 'ropa'),
  ('Perfumes', 'perfumes');

drop policy if exists "Categories: public read" on public.categories;
create policy "Categories: public read"
  on public.categories for select using (true);

drop policy if exists "Products: public read" on public.products;
create policy "Products: public read"
  on public.products for select using (true);

drop policy if exists "Products: authenticated insert" on public.products;
create policy "Products: authenticated insert"
  on public.products for insert
  to authenticated with check (true);

drop policy if exists "Products: authenticated update" on public.products;
create policy "Products: authenticated update"
  on public.products for update
  to authenticated using (true) with check (true);

drop policy if exists "Products: authenticated delete" on public.products;
create policy "Products: authenticated delete"
  on public.products for delete
  to authenticated using (true);

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "Storage products: public read" on storage.objects;
create policy "Storage products: public read"
  on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "Storage products: authenticated insert" on storage.objects;
create policy "Storage products: authenticated insert"
  on storage.objects for insert
  with check (bucket_id = 'products' and auth.role() = 'authenticated');

drop policy if exists "Storage products: owner update" on storage.objects;
create policy "Storage products: owner update"
  on storage.objects for update
  using (bucket_id = 'products' and auth.uid() = owner);

drop policy if exists "Storage products: owner delete" on storage.objects;
create policy "Storage products: owner delete"
  on storage.objects for delete
  using (bucket_id = 'products' and auth.uid() = owner);