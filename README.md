# Portfolio Template

A portfolio that behaves like a desktop. Visitors land on a lock screen, click
through to a wallpaper with icons on it, and open your work in windows.

Everything on screen is edited in the admin panel — your name, the icons and
what they open, the dock, the calendar, the contact panel, the page title.
Nothing about you is written in the code.

Built with [Next.js](https://nextjs.org) (App Router), [Payload](https://payloadcms.com)
on Postgres, and [shadcn/ui](https://ui.shadcn.com) on Base UI.

---

## Contents

- [Part 1 — Infrastructure](#part-1--infrastructure)
  - [1. Database](#1-database)
  - [2. Secret](#2-secret)
  - [3. Local environment](#3-local-environment)
  - [4. First run](#4-first-run)
  - [5. Deploy to Vercel](#5-deploy-to-vercel)
  - [6. File storage](#6-file-storage)
  - [7. Seeding production](#7-seeding-production)
  - [8. Custom domain](#8-custom-domain)
- [Part 2 — Setting up your site](#part-2--setting-up-your-site)
  - [Order of work](#order-of-work)
  - [Media](#media)
  - [Projects](#projects)
  - [Desktop items](#desktop-items)
  - [Site](#site)
  - [Working in two languages](#working-in-two-languages)
  - [Launch checklist](#launch-checklist)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Changing the code](#changing-the-code)

---

# Part 1 — Infrastructure

You need three things: a Postgres database, somewhere to run the app, and
somewhere to keep uploaded images. Roughly 20 minutes end to end.

Requirements: **Node 20+**, **pnpm**, and a **Postgres 14+** database.

## 1. Database

Any Postgres works. These instructions use [Supabase](https://supabase.com)
because the free tier is enough for a portfolio.

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
   Note the database password — it is shown once.
2. Wait for provisioning (~2 minutes).
3. Click **Connect** in the top bar.
4. Choose **Transaction pooler** and copy the URI. It looks like:

   ```
   postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres
   ```

5. Replace `[YOUR-PASSWORD]` with your actual password.

> **Pick the transaction pooler, port 6543.** The other two options both break
> in ways that are slow to diagnose:
>
> - The **direct connection** (`db.<ref>.supabase.co`) is IPv6-only. It works
>   from your laptop and fails from every serverless function, which have no
>   IPv6 route. You get `getaddrinfo ENOTFOUND`.
> - The **session pooler** (port 5432) holds one server connection per client
>   for the whole session and caps at 15. It survives local development and
>   dies in production with `EMAXCONNSESSION` as soon as traffic arrives. It is
>   still the right choice for one-off migrations and seeding.

If your password contains `@ : / ? #` or a space, [URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding)
it. Otherwise the connection string is parsed wrong and the hostname comes out
as a fragment of your password.

The schema is created automatically on first connection — there is no migration
step to run.

## 2. Secret

`PAYLOAD_SECRET` signs login tokens. Any long random string:

```bash
openssl rand -hex 32
```

Keep it stable. Changing it logs everyone out.

## 3. Local environment

```bash
cp .env.example .env
```

Fill in:

```bash
DATABASE_URL=postgresql://postgres.abcdefgh:yourpassword@aws-0-us-east-2.pooler.supabase.com:6543/postgres
PAYLOAD_SECRET=the-string-you-just-generated
PORTFOLIO_LOCALES=pt,en
PORTFOLIO_DEFAULT_LOCALE=pt
```

Set `PORTFOLIO_LOCALES` to a single code (`en`) if you only want one language.

## 4. First run

```bash
pnpm install
pnpm seed      # placeholder content, so the site is not empty
pnpm dev
```

Open <http://localhost:3000/admin> and create your admin user. The first
account you create is yours; there is no signup on the public site.

The site is at <http://localhost:3000> and redirects to your default locale.

To preview the template with example work instead of placeholders:

```bash
pnpm seed:demo
```

Both seeds are safe to re-run. Each replaces the other's content rather than
stacking a second set of icons on the desktop, and neither touches anything you
created yourself.

## 5. Deploy to Vercel

1. Push the repo to GitHub.
2. At [vercel.com/new](https://vercel.com/new), import it. Vercel detects
   Next.js; no build settings to change.
3. Before the first deploy, add the environment variables under
   **Settings → Environment Variables**, ticking both **Production** and
   **Preview**:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | The transaction pooler URI from step 1 |
   | `PAYLOAD_SECRET` | The secret from step 2 |
   | `PORTFOLIO_LOCALES` | e.g. `pt,en` |
   | `PORTFOLIO_DEFAULT_LOCALE` | e.g. `pt` |

4. Deploy.

Pages render per request rather than being prerendered, so the build never
needs database credentials, and content you change in the admin is live
immediately without a redeploy.

## 6. File storage

**Required in production.** Serverless filesystems are wiped between requests,
so without this every image you upload disappears and the site renders with
broken images.

1. In the Vercel dashboard: **Storage → Create Database → Blob**.
2. Name it, choose **Public** access — images are served to visitors.
3. Connect it to the project. Vercel injects `BLOB_READ_WRITE_TOKEN`
   automatically.
4. Redeploy so the new variable is picked up.

Locally the token is absent, and uploads go to `./media` instead. That is
intended: no cloud setup needed for development. The app switches backends
based purely on whether the token exists.

## 7. Seeding production

Your production database is separate from anything local unless `DATABASE_URL`
points at the same place. To put starter content into production:

```bash
vercel env pull .env.production.local     # gets DATABASE_URL and the blob token
export $(grep -v '^#' .env.production.local | xargs)
pnpm seed        # or pnpm seed:demo
```

Exporting `BLOB_READ_WRITE_TOKEN` matters: without it the seed writes images to
your laptop's disk and production serves 404s for every one of them.

## 8. Custom domain

**Settings → Domains** in Vercel, add the domain, and follow the DNS
instructions. Nothing in the app needs to know the domain.

---

# Part 2 — Setting up your site

Everything below happens at `/admin`. Nothing requires touching code.

## Order of work

Build from the inside out, because later things reference earlier ones:

1. **Media** — upload your images
2. **Projects** — your work
3. **Desktop items** — the icons, pointing at those projects
4. **Site** — the chrome, pointing at those icons

## Media

Upload images here, or upload inline from any image field. Every image gets an
`alt` text, which is translated per language and matters for screen readers and
search.

Three sizes are generated automatically (400px, 900px, 1920px wide) and the
right one is used per context. Upload at full resolution and let it downscale —
it will not upscale, so a small source stays small.

Images only. Videos are linked by URL, not uploaded (see [Projects](#projects)).

## Projects

One entry per piece of work.

| Field | Notes |
|---|---|
| **Title** | Translated per language |
| **Slug** | URL identifier. Leave blank to generate from the title |
| **Year** | Free text, shown under the title |
| **Cover** | Required. The thumbnail in folder windows, and the video's poster frame |
| **Video URL** | Wistia, YouTube, Vimeo, or a direct `.mp4`. Paste the normal share link — it is converted to an embed. Blank shows the cover instead |
| **Credits** | Label/value pairs shown as one line under the title: `Role · Direction`, `Format · 4K`. The label names the field, the value answers it |
| **Description** | Rich text: headings, bold, italic, lists, quotes, links |
| **Gallery** | Additional stills, shown in a two-column grid below the description |
| **Order** | Sidebar. Lower numbers first. This is the order of your reel, and it is visible — each project shows its position |

## Desktop items

One entry per icon on the desktop. **Type** decides what clicking it opens:

| Type | Opens |
|---|---|
| **Folder** | A window listing the projects you attach |
| **Text file** | A window of rich text, optionally followed by your social links |
| **Image** | A full-bleed image preview |
| **Link** | No window — opens a URL in a new tab |

| Field | Notes |
|---|---|
| **Label** | Caption under the icon and the window title. Translated. Use a filename-like name (`about.txt`) to sell the desktop conceit |
| **Slug** | Appears in shareable URLs as `?w=<slug>` |
| **Appearance → Icon** | `Folder`, `File`, `Use this item's own image` (for photos), or `Custom upload` |
| **Appearance → Icon colour** | Tints the built-in folder and file glyphs. Any CSS colour |
| **Placement** | `Stack` puts it in the top-left column; `Free` positions it anywhere by x/y percentage |
| **Order** | Sidebar. Position within the stack |
| **Visible** | Sidebar. Hide an icon without deleting it |

Type-specific fields appear once you pick a type — projects for a folder, rich
text for a text file, an image for an image, a URL for a link.

## Site

The global settings, in tabs.

### Identity

| Field | Notes |
|---|---|
| **Owner name** | Menu bar and lock screen |
| **Tagline** | Optional line under your name on the lock screen. Translated |
| **Avatar** | The round portrait on the lock screen |
| **Background video URL** | Looping wallpaper. A path like `/videos/bg.mp4` from `public/`, or a full URL |
| **Background poster** | Still wallpaper. Used while the video loads, or on its own if you leave the video blank |

### Menu bar

Toggles for the nav links, the clock, and the language switcher.

**Navigation links** is a list. Each one has a translated label and an action:

- **Open a desktop item** — pick which one from a dropdown
- **Close all windows** — the "home" behaviour
- **Go to a URL** — an external link

This is why nothing is hardcoded: point "Portfolio" at whichever folder you
like, and rename it freely.

### Dock

The bar at the bottom. Each slot has:

| Field | Notes |
|---|---|
| **Label** | Tooltip on hover. Translated |
| **Icon** | Photos, Instagram, YouTube, TikTok, X, LinkedIn, WhatsApp, Mail, Trash, or a custom upload |
| **Action** | Open a URL, open a desktop item, open the contact panel, or nothing (decorative) |
| **Divider before** | Draws a separator to its left — the usual place is before Trash |

Order in the list is order on screen.

### Widgets

**Lock screen** — turn it off entirely, set the button label ("Start",
"Iniciar"), and choose whether it shows once per session or on every visit.
Deep links into a window always skip it.

**Calendar** — turn it off, and set the colour of today's date. Hidden on small
screens regardless.

### Contact & socials

**Contact** is the floating button at the bottom-right. Give it a title and a
list of options, each with an icon, a translated label and subtitle, a link,
and a tint (neutral, green, blue — green suits WhatsApp).

Links follow the usual schemes: `https://wa.me/351900000000`,
`mailto:you@example.com`, `tel:+351900000000`.

**Socials** is a separate list, shown as an icon row at the bottom of text
windows. Keep it to profiles you actually maintain.

### SEO

Browser tab title, description, and the share image used when your link is
posted somewhere. The title falls back to your owner name if blank.

## Working in two languages

If `PORTFOLIO_LOCALES` has more than one code, the admin shows a locale
switcher. Translated fields are stored per language; everything else (images,
links, ordering, colours) is shared.

Switch locale, edit, save. Untranslated fields fall back to the default locale
rather than rendering empty, so a partial translation degrades gracefully.

Visitors are redirected to whichever locale best matches their browser, and can
switch from the menu bar without losing the window they have open.

## Launch checklist

- [ ] Replaced the placeholder wallpaper and avatar in **Site → Identity**
- [ ] Owner name and SEO title set
- [ ] Every desktop item points somewhere real
- [ ] Nav links and dock items point at your items, not the seeded ones
- [ ] Contact links tested — the phone number and email are yours
- [ ] Every project has a cover; videos play
- [ ] Both languages filled in, if using two
- [ ] Blob storage connected in Vercel, and an admin upload survives a redeploy
- [ ] Checked on a phone

---

## Environment variables

| Name | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. Transaction pooler in production |
| `PAYLOAD_SECRET` | Yes | Signs auth tokens. Changing it logs everyone out |
| `PORTFOLIO_LOCALES` | No | Comma-separated codes. Defaults to `pt,en` |
| `PORTFOLIO_DEFAULT_LOCALE` | No | Must be in the list. Defaults to the first |
| `BLOB_READ_WRITE_TOKEN` | Production | Injected by Vercel when a Blob store is connected. Absent locally means uploads go to `./media` |

Run `pnpm generate:types` after changing the locale list.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm seed` | Neutral placeholder content |
| `pnpm seed:demo` | Example portfolio content |
| `pnpm generate:types` | Regenerate `payload-types.ts` after schema changes |
| `pnpm payload generate:importmap` | Regenerate the admin import map after adding a Payload plugin |
| `pnpm typecheck` / `pnpm lint` | Static checks |

## Troubleshooting

| Symptom | Cause |
|---|---|
| `getaddrinfo ENOTFOUND` with a fragment of your password as the host | Unencoded special character in `DATABASE_URL` |
| `getaddrinfo ENOTFOUND db.<ref>.supabase.co` on Vercel, fine locally | Using the direct connection, which is IPv6-only. Switch to the transaction pooler |
| `EMAXCONNSESSION ... pool_size: 15` | Using the session pooler (5432) in production. Switch to 6543 |
| Images broken in production, fine locally | No Blob store connected, or content was seeded without `BLOB_READ_WRITE_TOKEN` |
| Uploads vanish after a redeploy | Same — the filesystem is ephemeral |
| Build succeeds, then fails at `Deploying outputs…` | The function bundle is too large. Check for anything pulled in by `outputFileTracingIncludes` |
| `ERR_DLOPEN_FAILED: libvips-cpp.so` | `sharp` is not on the same version Next depends on. Keep them aligned |
| Admin logs `PayloadComponent not found in importMap` | Run `pnpm payload generate:importmap` |
| Two sets of desktop icons | Ran both seeds on an older version. Re-run either one; they now replace each other |

## Changing the code

| Where | What |
|---|---|
| `app/(frontend)/globals.css` | Colours, type, and the desktop tokens |
| `app/(frontend)/[locale]/` | Routes, metadata |
| `components/desktop/` | Desktop shell — menu bar, icons, dock, calendar, lock screen |
| `components/desktop/window/` | Window chrome and the four window types |
| `collections/`, `globals/` | The schema. Run `pnpm generate:types` after editing |
| `lib/i18n.ts` | The few strings not editable in the admin |
| `proxy.ts` | Locale redirects |

The desktop shell is deliberately always dark, since it sits over a photograph;
window interiors follow the light/dark theme.

Adding a string to `lib/i18n.ts` is a type error in every locale until it is
translated, so nothing is silently left in English.

Once your own content is in, `scripts/seed.ts` and `scripts/seed-demo.ts` are
scaffolding — delete them.
