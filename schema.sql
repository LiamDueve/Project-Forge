-- ============================================================
-- Project Forge — Supabase schema, RLS policies, and storage
-- Run this in the Supabase SQL editor for a fresh project.
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text,
  company_name text,
  profession text,
  bio text,
  phone text,
  email text,
  website text,
  instagram text,
  facebook text,
  linkedin text,
  tiktok text,
  twitter text,
  youtube text,
  pinterest text,
  whatsapp text,
  yelp text,
  google_reviews text,
  google_place_id text,
  google_rating numeric(2,1),
  google_rating_count integer,
  show_google_rating boolean not null default false,
  projects_section_enabled boolean not null default false,
  projects_section_name text not null default 'Projects',
  service_area text,
  profile_photo_url text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Safe to re-run: adds the newer social fields to a profiles table that
-- already existed before they were introduced.
alter table public.profiles add column if not exists tiktok text;
alter table public.profiles add column if not exists twitter text;
alter table public.profiles add column if not exists youtube text;
alter table public.profiles add column if not exists pinterest text;
alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists yelp text;
alter table public.profiles add column if not exists google_place_id text;
alter table public.profiles add column if not exists google_rating numeric(2,1);
alter table public.profiles add column if not exists google_rating_count integer;
alter table public.profiles add column if not exists show_google_rating boolean not null default false;
alter table public.profiles add column if not exists projects_section_enabled boolean not null default false;
alter table public.profiles add column if not exists projects_section_name text not null default 'Projects';

create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'single',
  image_url text,
  before_image_url text,
  after_image_url text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds before/after-slider support and manual ordering to a
-- portfolio_items table that already existed before these were introduced.
alter table public.portfolio_items add column if not exists kind text not null default 'single';
alter table public.portfolio_items add column if not exists before_image_url text;
alter table public.portfolio_items add column if not exists after_image_url text;
alter table public.portfolio_items add column if not exists sort_order integer not null default 0;
alter table public.portfolio_items alter column image_url drop not null;

create index if not exists services_profile_id_idx on public.services(profile_id);
create index if not exists portfolio_items_profile_id_idx on public.portfolio_items(profile_id);
create index if not exists profiles_username_idx on public.profiles(username);

-- ---------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_items enable row level security;

-- profiles: anyone can read (public profile pages), owners can write
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- services: publicly readable, writable only by the owning profile's user
drop policy if exists "Services are publicly readable" on public.services;
create policy "Services are publicly readable"
  on public.services for select
  using (true);

drop policy if exists "Users can manage their own services" on public.services;
create policy "Users can manage their own services"
  on public.services for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = services.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = services.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- portfolio_items: publicly readable, writable only by the owning profile's user
drop policy if exists "Portfolio items are publicly readable" on public.portfolio_items;
create policy "Portfolio items are publicly readable"
  on public.portfolio_items for select
  using (true);

drop policy if exists "Users can manage their own portfolio items" on public.portfolio_items;
create policy "Users can manage their own portfolio items"
  on public.portfolio_items for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = portfolio_items.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = portfolio_items.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- Smart Contact Card
--
-- One contact_cards row per profile (1:1), holding everything that
-- gets embedded in the downloadable vCard. This is intentionally
-- separate from `profiles` — what someone shows on their public page
-- and what they hand over as a saved phone contact can differ.
--
-- Repeatable groups (phones, emails, websites, addresses, socials,
-- messaging, custom_fields) are stored as JSONB arrays rather than
-- child tables. This keeps the editor and the vCard-generation code
-- simple, while still supporting an arbitrary number of entries per
-- group. Each array entry carries its own `id` (generated client-side)
-- so rows can be edited/reordered without extra joins.
-- ---------------------------------------------------------------

create table if not exists public.contact_cards (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  photo_url text,
  first_name text,
  last_name text,
  company text,
  job_title text,
  birthday date,
  notes text,
  phones jsonb not null default '[]'::jsonb,
  emails jsonb not null default '[]'::jsonb,
  websites jsonb not null default '[]'::jsonb,
  addresses jsonb not null default '[]'::jsonb,
  socials jsonb not null default '[]'::jsonb,
  messaging jsonb not null default '[]'::jsonb,
  custom_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id)
);

drop trigger if exists contact_cards_set_updated_at on public.contact_cards;
create trigger contact_cards_set_updated_at
  before update on public.contact_cards
  for each row execute function public.set_updated_at();

alter table public.contact_cards enable row level security;

-- Publicly readable so the /api/vcard/[username] route can generate a
-- vCard for anonymous visitors with no session.
drop policy if exists "Contact cards are publicly readable" on public.contact_cards;
create policy "Contact cards are publicly readable"
  on public.contact_cards for select
  using (true);

drop policy if exists "Users can manage their own contact card" on public.contact_cards;
create policy "Users can manage their own contact card"
  on public.contact_cards for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = contact_cards.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = contact_cards.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- Projects / Portfolio (the richer "proof of work" section — distinct
-- from the simpler photo-grid `portfolio_items` table above)
--
-- Custom fields (Price/Beds/Baths for a Realtor, Type/Units/Completion
-- for a developer, etc.) and gallery images are both stored as JSONB
-- arrays directly on the row, matching the pattern already used for
-- contact_cards' repeatable groups — keeps this profession-agnostic
-- without a separate child table per concept.
-- ---------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled project',
  cover_image_url text,
  gallery_images jsonb not null default '[]'::jsonb,
  short_description text,
  full_description text,
  status text,
  location text,
  project_date text,
  external_link_url text,
  external_link_label text,
  custom_fields jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_profile_id_idx on public.projects(profile_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

-- Public visitors only ever see is_public projects; the owner can always
-- see (and therefore edit) all of their own, including drafts.
drop policy if exists "Public projects are publicly readable" on public.projects;
create policy "Public projects are publicly readable"
  on public.projects for select
  using (
    is_public = true
    or exists (
      select 1 from public.profiles
      where profiles.id = projects.profile_id
      and profiles.user_id = auth.uid()
    )
  );

drop policy if exists "Users can manage their own projects" on public.projects;
create policy "Users can manage their own projects"
  on public.projects for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = projects.profile_id
      and profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = projects.profile_id
      and profiles.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- Storage buckets
-- Run these once. If a bucket already exists, this will error —
-- safe to ignore, or delete the line for that bucket.
-- ---------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- Storage RLS: anyone can view (public buckets), only the owner
-- (matched by the first path segment = their user id) can write.

drop policy if exists "Public read profile-photos" on storage.objects;
create policy "Public read profile-photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

drop policy if exists "Owners write profile-photos" on storage.objects;
create policy "Owners write profile-photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners update profile-photos" on storage.objects;
create policy "Owners update profile-photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners delete profile-photos" on storage.objects;
create policy "Owners delete profile-photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Public read logos" on storage.objects;
create policy "Public read logos"
  on storage.objects for select
  using (bucket_id = 'logos');

drop policy if exists "Owners write logos" on storage.objects;
create policy "Owners write logos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners update logos" on storage.objects;
create policy "Owners update logos"
  on storage.objects for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners delete logos" on storage.objects;
create policy "Owners delete logos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Public read portfolio" on storage.objects;
create policy "Public read portfolio"
  on storage.objects for select
  using (bucket_id = 'portfolio');

drop policy if exists "Owners write portfolio" on storage.objects;
create policy "Owners write portfolio"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners update portfolio" on storage.objects;
create policy "Owners update portfolio"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Owners delete portfolio" on storage.objects;
create policy "Owners delete portfolio"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = auth.uid()::text);
