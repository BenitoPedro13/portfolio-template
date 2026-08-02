# Portfolio Template

A portfolio that behaves like a desktop. Visitors land on a lock screen, click
through to a wallpaper with icons on it, and open your work in windows.

Everything on screen is edited in the admin panel — your name, the icons and
what they open, the dock, the calendar, the contact panel, the page title.
Nothing about you is written in the code.

Built with [Next.js](https://nextjs.org) (App Router), [Payload](https://payloadcms.com)
on Postgres, and [shadcn/ui](https://ui.shadcn.com) on Base UI.

---

## Getting started

You need Node 20+, pnpm, and a Postgres database. [Supabase](https://supabase.com)
works well and has a free tier — read [Connecting to Supabase](#connecting-to-supabase)
first, it has two traps that cost real time.

```bash
pnpm install
cp .env.example .env      # then fill in DATABASE_URL and PAYLOAD_SECRET
pnpm seed                 # placeholder content so the site has something to show
pnpm dev
```

Open <http://localhost:3000/admin> and create the first admin user. The site
itself is at <http://localhost:3000>.

To see the template filled in with example work instead of placeholders:

```bash
pnpm seed:demo
```

Both seeds are safe to re-run, and each one replaces the other's content rather
than stacking a second set of icons on the desktop. Neither touches anything
you created yourself in the admin.

---

## Editing your site

Everything lives under two places in the admin.

### Site (global)

| Tab | What it controls |
|---|---|
| **Identity** | Your name, tagline, avatar, and the desktop wallpaper |
| **Menu bar** | The top bar: which nav links exist and which window each one opens |
| **Dock** | The bar at the bottom — icons, order, dividers, and what each does |
| **Widgets** | The lock screen and the calendar |
| **Contact & socials** | The floating contact button's options, and the social links shown in text windows |
| **SEO** | Browser tab title, description, and social share image |

Nav links and dock items don't hardcode anything: each one picks a **desktop
item** to open from a dropdown. Point "Portfolio" at whichever folder you like.

### Desktop items (collection)

One row per icon on the desktop. The `type` decides what opens:

| Type | Opens |
|---|---|
| `folder` | A window listing the projects you attach to it |
| `text` | A window with rich text, optionally followed by your social links |
| `image` | A full-bleed image preview |
| `link` | Nothing — it opens a URL in a new tab |

`placement` puts an icon either in the top-left stack or free-floating at an
x/y percentage of the screen. `order` sorts the stack; `visible` hides an icon
without deleting it.

### Projects (collection)

The work itself: title, year, cover image, an optional video, rich-text
description, a gallery, and **credits** — label/value pairs shown as a single
line under the title (`Role · Direction`, `Format · 4K`).

`videoUrl` accepts a Wistia, YouTube, or Vimeo link, or a direct `.mp4`. Paste
the normal share URL; it gets converted to an embed. Leave it blank and the
cover image is shown instead.

---

## Languages

Locales are set with environment variables, not code:

```bash
PORTFOLIO_LOCALES=pt,en
PORTFOLIO_DEFAULT_LOCALE=pt
```

This drives the URL structure (`/pt`, `/en`), the locales offered in the admin,
and the language switcher. Visitors are redirected to whichever locale best
matches their browser, falling back to the default.

Run `pnpm generate:types` after changing the list.

Text you write in the admin is translated per locale. The handful of strings
that aren't editable — window controls, screen-reader labels, the 404 page —
live in `lib/i18n.ts`. Adding a key there is a type error in every locale until
it's translated, so nothing is silently left in English.

---

## Deploying to Vercel

Set these in **Settings → Environment Variables** for Production and Preview:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PORTFOLIO_LOCALES`, `PORTFOLIO_DEFAULT_LOCALE`

Then create a **Blob store** (Storage → Create → Blob) and connect it to the
project. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically.

> **This one is not optional.** Serverless filesystems are wiped between
> requests, so without a Blob store every image you upload in the admin
> disappears and the site renders with broken images. Locally the token is
> absent and uploads go to `./media` instead, which is what you want.

If you seed while pointing at a production database, export the token first so
the generated images land in Blob rather than on your laptop:

```bash
export BLOB_READ_WRITE_TOKEN=...   # from `vercel env pull`
pnpm seed:demo
```

### Connecting to Supabase

Two things will waste an afternoon if nobody tells you.

**Use the transaction pooler, port 6543.** Copy it from Project → Connect →
Transaction pooler.

- The **direct** host (`db.<ref>.supabase.co`) is IPv6-only. It works on your
  machine and fails on every Vercel function, which have no IPv6 route.
- The **session** pooler (port 5432) pins one server connection per client and
  caps out at 15, so it dies with `EMAXCONNSESSION` as soon as functions scale.
  It is still the right choice for one-off migrations and seeding.

If your password contains `@ : / ? #` or a space, URL-encode it. Otherwise the
host is parsed wrong and you get `getaddrinfo ENOTFOUND <fragment>`.

---

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and serve |
| `pnpm seed` | Neutral placeholder content |
| `pnpm seed:demo` | Example portfolio content |
| `pnpm generate:types` | Regenerate `payload-types.ts` after schema changes |
| `pnpm typecheck` / `pnpm lint` | Static checks |

---

## Making it yours

1. Run `pnpm seed`, then replace the content in `/admin`.
2. Delete `scripts/seed-demo.ts` and `scripts/seed.ts` once your own content is
   in — they are scaffolding, not part of the site.
3. Swap the wallpaper and avatar in **Site → Identity**. The seeds generate
   plain gradients, so the repo ships no stock imagery.

The desktop shell is deliberately always dark, since it sits over a photograph.
Window interiors follow the theme. Colours and type live in
`app/(frontend)/globals.css`.
