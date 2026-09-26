# Forge

Your entire business identity in one scan. A digital business profile platform for
contractors, realtors, builders, property managers, and developers: one link and QR
code that shows your portfolio, services, reviews, and contact info.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Storage) via `@supabase/ssr`
- `qrcode.react` for QR generation + PNG download

## 1. Project setup

```bash
# unzip/copy this project, then from its root:
npm install
cp .env.local.example .env.local
```

You'll fill in `.env.local` in step 3.

## 2. Create a Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. Once it's provisioned, go to **Project Settings → API**. You'll need:
   - **Project URL**
   - **anon public** key
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
   - For fastest local testing, you can turn **Confirm email** off under
     **Authentication → Sign In / Providers → Email** (turn it back on before
     going live).
4. Go to the **SQL Editor**, open `supabase/schema.sql` from this project, paste
   its full contents, and run it. This creates:
   - `profiles`, `services`, `portfolio_items` tables
   - Row Level Security policies (public read, owner-only write)
   - Three public storage buckets: `profile-photos`, `logos`, `portfolio`, with
     matching storage RLS policies

## 3. Environment variables

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` is used to build the public profile link shown in the
dashboard and QR code. Set it to your real domain in production.

## 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`. Sign up at `/signup`, then you'll land on
`/dashboard`. A blank profile row is created automatically on first visit with a
temporary username — go to **Edit Profile** to fill in real details and set your
public username.

Your public profile lives at `/p/[username]` and needs no login to view.

## 5. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, **Add New Project** and import the repo.
3. Add the same three environment variables from `.env.local` in
   **Project Settings → Environment Variables** (set `NEXT_PUBLIC_SITE_URL` to
   your production domain, e.g. `https://forge.yourdomain.com`).
4. Deploy. Vercel auto-detects Next.js — no build config needed.
5. Back in Supabase, add your production URL under **Authentication → URL
   Configuration → Site URL** (and Redirect URLs, if you later add email
   confirmation links) so auth redirects work correctly.

## Smart Contact Card

Every profile now has a **Contact Card** (`/dashboard/contact-card`), separate from the public profile
editor. It controls exactly what gets saved to a visitor's phone when they tap the **Save Contact**
button on the public profile — supports multiple phone numbers, emails, websites, addresses, social
profiles, and messaging apps, plus custom fields, birthday, and notes, all with a live preview of what
the visitor's phone will receive.

"Save Contact" hits `GET /api/vcard/[username]`, which generates a vCard 3.0 file server-side (see
`src/lib/vcard.ts`) from the Contact Card data — falling back to the public profile's basic info for
anything not yet customized, so it works immediately even before a user sets up their Contact Card. The
profile photo is embedded directly in the vCard when available, and a labeled link back to the Forge
profile is always included so the contact stays current after it's saved.

If you already ran `supabase/schema.sql` before this feature was added, re-run it — it's idempotent and
will just add the new `contact_cards` table and its policies without touching existing data.

## File structure

```
src/
  app/
    page.tsx                  Landing page
    login/page.tsx            Log in
    signup/page.tsx           Sign up
    dashboard/
      layout.tsx              Authenticated shell (nav + logout)
      page.tsx                Dashboard: completion, QR, quick links
      profile/page.tsx        Edit profile form (identity, contact, social,
                               services, portfolio)
      contact-card/page.tsx   Smart Contact Card editor (collapsible sections
                               + live preview)
    p/[username]/page.tsx     Public profile (no auth required) — includes the
                               "Save Contact" button
    api/vcard/[username]/
      route.ts                Generates and serves the .vcf for Save Contact
    globals.css
    layout.tsx                Root layout, fonts, metadata
  components/
    ui/                       Button, Field/Input/Textarea
    landing/                  Nav, Hero, HowItWorks, WhoItsFor, FeatureCards, Footer
    dashboard/                QRCodeCard, ImageUpload, LogoutButton,
                               CollapsibleSection, RepeatableRows, ContactCardPreview
    profile/                  ContactButtons, SocialLinks, ServicesList, PortfolioGrid
  lib/
    supabase/                 client.ts (browser), server.ts (server components/actions),
                               middleware.ts (session refresh + route protection)
    types.ts                  Profile, Service, PortfolioItem, ContactCard + related types
    utils.ts                  slugify, profileCompletion, URL/phone helpers
    vcard.ts                  vCard 3.0 generation (used by the /api/vcard route)
  middleware.ts                Protects /dashboard/*
supabase/
  schema.sql                  Tables, RLS policies, storage buckets + policies
```

## Notes on what's intentionally left out (per MVP scope)

- No Apple Wallet, native app, team accounts, messaging, feed, AI, CRM, or
  Stripe/subscriptions — the schema and file structure leave room to add these
  later without a rewrite (e.g. a `plan` column on `profiles` for subscriptions,
  a `team_id` column for team accounts).
- Username uniqueness is enforced by a `unique` constraint on `profiles.username`.
  If a user picks a taken username, the `profiles` upsert will fail with a
  Postgres unique-violation error, surfaced in the edit form.
- Portfolio/photo uploads go straight to Supabase Storage from the browser,
  scoped to `{user_id}/...` paths so storage RLS can enforce ownership.
