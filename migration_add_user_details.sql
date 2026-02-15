-- Add phone_number column if it doesn't exist
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'phone_number') then
    alter table profiles add column phone_number text;
  end if;
end $$;

-- Update the handle_new_user function to map metadata to profile columns
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, phone_number, location_zip, account_type)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'zip_code',
    COALESCE(new.raw_user_meta_data->>'account_type', 'private') -- Default to private if invalid/missing
  );
  return new;
end;
$$ language plpgsql security definer;
