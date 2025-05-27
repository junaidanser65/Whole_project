-- Create reviews table if it doesn't exist
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  vendor_id uuid references vendors(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  helpful_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, vendor_id)
);

-- Enable RLS if not already enabled
alter table public.reviews enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
drop policy if exists "Users can insert their own reviews" on public.reviews;
drop policy if exists "Users can update their own reviews" on public.reviews;
drop policy if exists "Users can delete their own reviews" on public.reviews;

-- Create policies
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Users can insert their own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Drop existing trigger and function if they exist
drop trigger if exists update_vendor_rating_trigger on public.reviews;
drop function if exists update_vendor_rating();

-- Create function to update vendor rating
create function update_vendor_rating()
returns trigger as $$
begin
  update vendors
  set 
    rating = (
      select avg(rating)::numeric(3,1)
      from reviews
      where vendor_id = new.vendor_id
    ),
    reviews_count = (
      select count(*)
      from reviews
      where vendor_id = new.vendor_id
    )
  where id = new.vendor_id;
  return new;
end;
$$ language plpgsql;

-- Create trigger to update vendor rating
create trigger update_vendor_rating_trigger
after insert or update or delete on reviews
for each row execute function update_vendor_rating(); 