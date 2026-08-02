-- Allow event managers to delete events (USING clause) and select drafts

drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events"
  on public.events for all to authenticated
  using (
    public.current_user_has_permission('events', 'update')
    or public.current_user_has_permission('events', 'create')
    or public.current_user_has_permission('events', 'delete')
  )
  with check (
    public.current_user_has_permission('events', 'update')
    or public.current_user_has_permission('events', 'create')
  );
