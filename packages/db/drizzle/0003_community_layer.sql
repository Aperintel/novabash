-- Adds the community layer columns and tables: handles on user_profile,
-- a Stripe customer reference and a plan column for billing, plus stars
-- and reviews tables for published bundles.

alter table user_profile
  add column if not exists handle varchar(32) unique,
  add column if not exists display_name varchar(80),
  add column if not exists bio text,
  add column if not exists website_url varchar(254),
  add column if not exists github_login varchar(64),
  add column if not exists stripe_customer_id varchar(80),
  add column if not exists plan varchar(16) not null default 'free';

create index if not exists user_profile_handle_idx on user_profile (handle);

create table if not exists bundle_stars (
  bundle_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (bundle_id, user_id)
);
create index if not exists bundle_stars_bundle_idx on bundle_stars (bundle_id);

create table if not exists bundle_reviews (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null,
  user_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bundle_reviews_bundle_idx on bundle_reviews (bundle_id);

alter table bundle_stars enable row level security;
alter table bundle_reviews enable row level security;

create policy bundle_stars_self on bundle_stars
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy bundle_stars_read on bundle_stars
  for select using (true);

create policy bundle_reviews_author on bundle_reviews
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy bundle_reviews_read on bundle_reviews
  for select using (true);
