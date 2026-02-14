-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  display_name text,
  profile_photo_url text,
  account_type text default 'private' check (account_type in ('private', 'dealer')),
  location_zip text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  phone_number text
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create table for vehicle listings
create table listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  
  -- Vehicle Details
  have_year int not null,
  have_make text not null,
  have_model text not null,
  have_trim text,
  have_mileage int,
  location_zip text not null,
  
  -- Swap Details
  want_description text,
  cash_differential_min int,
  cash_differential_max int,
  description text,
  
  status text default 'active' check (status in ('active', 'sold', 'expired', 'deleted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  view_count int default 0
);

alter table listings enable row level security;

create policy "Listings are viewable by everyone." on listings
  for select using (true);

create policy "Users can insert their own listings." on listings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own listings." on listings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own listings." on listings
  for delete using (auth.uid() = user_id);

-- Photos table
create table photos (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  url text not null,
  display_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table photos enable row level security;

create policy "Photos are viewable by everyone." on photos
  for select using (true);

create policy "Users can manage photos of their listings." on photos
  for all using (
    exists (
      select 1 from listings
      where listings.id = photos.listing_id
      and listings.user_id = auth.uid()
    )
  );

-- Messages table
create table messages (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete set null,
  sender_id uuid references profiles(id) on delete cascade not null,
  recipient_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  image_url text, 
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

create policy "Users can view their own messages." on messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages." on messages
  for insert with check (auth.uid() = sender_id);

-- Saved Listings
create table saved_listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, listing_id)
);

alter table saved_listings enable row level security;

create policy "Users can manage their saved listings." on saved_listings
  for all using (auth.uid() = user_id);

-- Function to handle new user signup
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, phone_number, location_zip, account_type)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'zip_code',
    COALESCE(new.raw_user_meta_data->>'account_type', 'private')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
