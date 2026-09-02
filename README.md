# merwan-laouini (mwn-tech.com)

Personal site of Merwan Laouini, full-stack product engineer. Next.js App Router, TypeScript strict, Tailwind v4,
next-intl (fr/en), MDX content, GSAP + Three.js for the interface space.

## Commands

```bash
pnpm dev          # local dev (rail shows BUILD LOCAL / REGION LOCAL)
pnpm build        # prebuild search index + next build (all routes static except /api/*)
pnpm start        # serve the production build
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm screens      # process content/raw-screenshots/* into public/screens + manifest
pnpm search-index # regenerate public/search-index.{fr,en}.json
pnpm lhci         # Lighthouse CI assertions
```

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical origin (default `https://mwn-tech.com`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | email shown on /contact and in JSON-LD |
| `NEXT_PUBLIC_LINKEDIN_URL` | LinkedIn profile URL |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | contact form (form is hidden when the key is absent) |
| `NEXT_PUBLIC_SPACE` | set to `off` to force the static fallback of the 3D interface space |

Vercel system env (`VERCEL_GIT_COMMIT_SHA`, `VERCEL_REGION`) must be exposed for the telemetry rail to show real values.

## Design

See `docs/superpowers/specs/2026-09-02-portfolio-rebuild-design.md`.
