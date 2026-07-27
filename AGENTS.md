# AGENTS.md — cutai.org / Slop Score Badge Feature

## What this feature is
User submits a URL. We fetch it, extract text, run it through the
slop-detection rule engine (`packages/slop-rules`), and return a score +
funny verdict + a badge/banner the user can embed or download.

v1 scope is **slop-factor only** — no design/speed/trust/originality buckets.
Those need headless-browser infra (screenshots, perf runs) and are explicitly
out of scope until v2. Do not add scoring buckets that require Playwright
without discussing infra cost first.

## Stack (match existing project conventions)
- Backend: Fastify + Prisma + PostgreSQL + BullMQ + Redis
- Frontend: React + TypeScript + Vite + Tailwind
- Hosting: Cloudflare Pages (frontend), Cloudflare R2 (asset/image storage)
- No Next.js, no Python.
- Badge rendering: inline SVG template (v1; Satori + `@resvg/resvg-js` available for future upgrade).
- Text extraction: `undici` (fetch) + `@mozilla/readability` + `linkedom`.

## Architecture rules
- Strict layer separation: routes → services → repositories. No DB access
  from route handlers, no business logic in Prisma calls.
- Scoring engine lives in its own module (`packages/slop-rules`),
  shared between the paste-text endpoint (`POST /api/score`) and the
  URL-scan feature. Do not fork the rule logic.
- Fetch/extraction pipeline is fully isolated behind a `SiteFetcher` service —
  this is the one component most likely to be replaced (headless browser,
  different extraction lib) so keep it swappable.
- All scan jobs run async via BullMQ. No synchronous fetch-and-score in a
  request handler — a slow/hanging target site must not block the API.
- Badge rendering is a pure function of `Scan` data (score + breakdown +
  theme). No side effects, no DB calls inside the renderer — makes it
  trivially cacheable and testable.

## Non-negotiables
- **SSRF protection is mandatory** on the fetcher, no exceptions:
  - Resolve DNS before connecting; reject private/link-local/metadata ranges
    (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16).
  - http/https schemes only.
  - Re-validate every redirect hop against the same blocklist (don't just
    check the initial URL).
  - Timeout ~5s, response body cap ~5MB.
- Rate limit `/api/scan` submissions per IP (Redis-backed, in-memory fallback).
- Badge/PNG endpoints must be cache-first (Redis, keyed by `scanId`) with
  `Cache-Control` headers set for Cloudflare edge caching — these get hit on
  every pageview of every site that embeds the badge, not just once.
- No public leaderboard listing without explicit opt-in from the site owner.
  A score/badge can be reachable by direct link without being listed.
- Deterministic seeded logic anywhere randomness is involved (e.g. picking a
  "roast line" variant for a given score band) — same input text should
  always produce the same score and same roast, not a random one each time.

## Testing
- vitest coverage required on: scoring engine (rule buckets, tier boundaries,
  edge cases like empty/near-empty text), SSRF guard (private IP ranges,
  redirect re-validation), badge renderer (snapshot tests per theme/tier).
- SiteFetcher tests should mock network, not hit real URLs.

## What NOT to build in v1
- Design/visual scoring (needs screenshots/Playwright)
- Speed/perf scoring (needs PageSpeed API or real browser timing)
- Trust/originality buckets (no deterministic signal source yet)
- Public leaderboard (deferred to phase 3, opt-in only)
- Compare/challenge-another-site feature (deferred, post-MVP)
