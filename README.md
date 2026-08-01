# Brass Foundation OMS

Headless Organization Management System for Brass Foundation — public website, admin CMS, and member portal on a shared Supabase-backed API.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- ShadCN UI + Framer Motion + Three.js (hero)
- Supabase (Auth, PostgreSQL, Storage, Realtime, Edge Functions)
- React Query + Zustand + React Hook Form + Zod

## Getting started

```bash
npm install
cp .env.example .env.local
# Fill in Supabase and other keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## App structure

```
src/app/
  (website)/     Public site — landing, about, membership, resources…
  (auth)/        Login / auth flows
  admin/         Admin portal shell
  member/        Member portal shell
src/components/
  ui/            ShadCN primitives
  website/       Public marketing components
src/lib/
  supabase/      Browser + server clients
  constants.ts   Site config (CMS-bound later)
```

See [Context.md](./Context.md) for the full product specification, brand system, modules, and roadmap.
