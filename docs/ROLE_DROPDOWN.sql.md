# Assign user roles in Supabase Table Editor (dropdown)

Run this in **SQL Editor**, then open **Table Editor → `profiles`**.

The new `role_id` column is a foreign key to `roles`, so Supabase shows a **dropdown of role names** when you edit a row.

```sql
-- Role dropdown on profiles (Supabase Table Editor shows FK as a select)

alter table public.profiles
  add column if not exists role_id uuid references public.roles (id) on delete set null;

create index if not exists profiles_role_id_idx on public.profiles (role_id);

comment on column public.profiles.role_id is
  'Primary role. Pick from dropdown in Table Editor (linked to roles.name).';

with ranked as (
  select
    ur.user_id,
    ur.role_id,
    row_number() over (
      partition by ur.user_id
      order by
        case r.slug
          when 'super_admin' then 1
          when 'admin' then 2
          when 'secretary' then 3
          when 'treasurer' then 4
          when 'volunteer' then 5
          when 'member' then 6
          else 7
        end
    ) as rn
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
)
update public.profiles p
set role_id = ranked.role_id
from ranked
where p.id = ranked.user_id
  and ranked.rn = 1
  and p.role_id is null;

update public.profiles p
set role_id = r.id
from public.roles r
where r.slug = 'member'
  and p.role_id is null;

create or replace function public.sync_primary_role_to_user_roles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role_id is null then
    return new;
  end if;

  delete from public.user_roles
  where user_id = new.id;

  insert into public.user_roles (user_id, role_id)
  values (new.id, new.role_id)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists profiles_sync_primary_role on public.profiles;
create trigger profiles_sync_primary_role
after insert or update of role_id on public.profiles
for each row
execute function public.sync_primary_role_to_user_roles();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_role_id uuid;
begin
  select id into member_role_id from public.roles where slug = 'member' limit 1;

  insert into public.profiles (id, email, full_name, role_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    member_role_id
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        role_id = coalesce(public.profiles.role_id, excluded.role_id);

  if member_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, member_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;
```

### How to use
1. Table Editor → **profiles**
2. Find your user row (by email)
3. Click **role_id** → choose **Super Admin** / **Admin** / **Member** / etc. from the dropdown
4. Save — `user_roles` updates automatically so `/admin` access works

### Make yourself Super Admin quickly
```sql
update public.profiles
set role_id = (select id from public.roles where slug = 'super_admin')
where email = 'you@example.com';
```
