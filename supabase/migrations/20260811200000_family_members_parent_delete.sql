-- Allow family heads to delete their own family_members rows.
drop policy if exists "Members delete own family" on public.family_members;
create policy "Members delete own family"
  on public.family_members for delete to authenticated
  using (parent_user_id = auth.uid());

-- Keep admin delete policy (from original migration).
drop policy if exists "Admins delete family" on public.family_members;
create policy "Admins delete family"
  on public.family_members for delete to authenticated
  using (public.current_user_has_permission('members', 'update'));
