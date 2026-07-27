# IMPLEMENTATION_PLAN.md — Slop Score Badge Feature

Scope note: v1 ships **slop-factor scoring only**, using a text-based rule
engine. Design/speed/trust/originality buckets are deferred to v2 — they
require headless-browser infra (Playwright) that shouldn't be built until v1
is validated. See AGENTS.md for full rationale.

Last verified against the repo: 2026-07-27.

---

## 0. Current repo reality (read this first)

AGENTS.md refers to an "existing slop-detection rule engine" and an "existing
paste-text feature". **Neither exists in this repo.** Git history confirms
this repo has only ever contained the satirical landing page.

What actually exists today:

- Frontend-only Vite app: React 19, TypeScript, Tailwind v4
  (`@tailwindcss/vite`), framer-motion, lucide-react. All source in `src/`,
  entry `index.html` at repo root, build output `dist/`.
- `react-router-dom@7` is installed but **not wired up** — `src/main.tsx`
  renders `<App />` directly, no `<BrowserRouter>`. `src/pages/NotFound.tsx`
  exists but is unreachable.
- No backend: no Fastify, no Prisma, no Postgres, no BullMQ, no Redis, no
  `server/` or `apps/` directory.
- No scoring engine, no rules, no tests (no vitest anywhere).
- Linting via `oxlint` (`.oxlintrc.json` at root).
- Deployed as a static site (per README) — Cloudflare Pages per AGENTS.md.

Consequences for this plan:

- "Phase 0 — extract existing engine" becomes **create the engine from
  scratch** (Phase 2 below). There is nothing to extract and no existing test
  cases to port.
- The paste-text endpoint must be **built** (Phase 3), not reused.
- A repo restructure (Phase 1) is required before any backend code has a
  place to live.

---

## 1. Target repo layout

Convert to an npm-workspaces monorepo. No Turborepo/Nx — npm workspaces is
enough at this size.

```
cutai.org/
├── apps/
│   ├── web/                    # current frontend, moved as-is
│   │   ├── src/                # existing src/ (landing page)
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig*.json
│   │   └── package.json        # name: "@cutai/web"
│   └── api/                    # new Fastify backend
│       ├── prisma/
│       │   └── schema.prisma
│       ├── src/
│       │   ├── server.ts       # Fastify bootstrap
│       │   ├── worker.ts       # BullMQ worker (separate process)
│       │   ├── config.ts       # env parsing/validation
│       │   ├── routes/         # http handlers only, no logic
│       │   ├── services/       # business logic (SiteFetcher, BadgeRenderer)
│       │   ├── repositories/   # Prisma queries only
│       │   ├── plugins/        # cors, rate-limit
│       │   └── lib/            # slug, url-normalize, ssrf, redis, prisma
│       ├── assets/fonts/       # TTFs for Satori
│       ├── test/
│       └── package.json        # name: "@cutai/api"
├── packages/
│   └── slop-rules/             # shared scoring engine, zero runtime deps
│       ├── src/index.ts
│       ├── src/rules.ts
│       ├── src/roasts.ts
│       ├── test/
│       └── package.json        # name: "@cutai/slop-rules"
├── docker-compose.yml          # postgres + redis for local dev
├── package.json                # private root, workspaces
└── .gitignore
```

Layer rules (from AGENTS.md, enforced by convention):
`routes/` → `services/` → `repositories/`. No Prisma imports in `routes/`,
no business logic in `repositories/`. `packages/slop-rules` imports nothing
from `apps/`.

---

## Phase 1 — Monorepo restructure + tooling

Goal: backend and shared package have a home; frontend keeps working
unchanged.

**Steps**

1. `mkdir apps packages`
2. Move frontend with `git mv` into `apps/web/`: `index.html`, `public/`,
   `src/`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`,
   `tsconfig.node.json`, `package.json` (rename package to `@cutai/web`).
3. New root `package.json`:

   ```json
   {
     "name": "cutai.org",
     "private": true,
     "type": "module",
     "workspaces": ["apps/*", "packages/*"],
     "engines": { "node": ">=20" },
     "scripts": {
       "dev:web": "npm run dev -w @cutai/web",
       "dev:api": "npm run dev -w @cutai/api",
       "dev:worker": "npm run worker -w @cutai/api",
       "build": "npm run build --workspaces --if-present",
       "test": "npm run test --workspaces --if-present",
       "lint": "oxlint"
     }
   }
   ```

4. Delete root `package-lock.json` + `node_modules`, run `npm install` at
   root (regenerates a single workspaces lockfile).
5. Update `.gitignore`: `node_modules` → `**/node_modules`, `dist` →
   `**/dist`, add `**/.env`, `**/.env.local`, keep `*.log`, `.DS_Store`.
6. Add `docker-compose.yml` at root:

   ```yaml
   services:
     postgres:
       image: postgres:16-alpine
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: cutai
       ports: ["5432:5432"]
       volumes: ["pgdata:/var/lib/postgresql/data"]
     redis:
       image: redis:7-alpine
       ports: ["6379:6379"]
   volumes:
     pgdata: {}
   ```

7. Add `vitest` as a devDependency where needed (Phase 2+); nothing to test
   yet in Phase 1.
8. Verify: `npm run dev -w @cutai/web` serves the landing page;
   `npm run build -w @cutai/web` produces `apps/web/dist`.

**Done when:** landing page dev/build works from `apps/web`, root
`npm install` resolves all workspaces, `docker compose up -d` starts
Postgres+Redis.

---

## Phase 2 — Scoring engine (`packages/slop-rules`)

Goal: one deterministic rule engine, consumed later by both the paste-text
endpoint and the URL-scan worker. **Creation, not extraction.**

**Dependencies:** none at runtime. Dev: `typescript`, `vitest`.

**Public API (`packages/slop-rules/src/index.ts`)**

```ts
export type Tier =
  | 'certified-human'      // 0–19
  | 'mostly-organic'       // 20–39
  | 'suspiciously-smooth'  // 40–59
  | 'slop-adjacent'        // 60–79
  | 'grade-a-slop'         // 80–100

export interface RuleHit {
  ruleId: string        // e.g. 'buzzword-density'
  label: string         // human-readable, shown in UI breakdown
  points: number        // points this hit contributed (after cap)
  count: number         // occurrences found
  examples: string[]    // up to 3 matched snippets for the UI
}

export interface ScanResult {
  score: number         // 0–100 integer
  tier: Tier
  breakdown: RuleHit[]  // sorted by points desc, rules with 0 hits omitted
  roast: string         // deterministic per input+tier
  wordCount: number
  lowConfidence: boolean // wordCount < 30
}

export function scoreText(text: string): ScanResult
```

**Rules (initial set, each with id/weight/per-hit points/max cap — tune in
tests, keep in `rules.ts` as data, not code):**

| rule id                  | signal                                                        |
|--------------------------|---------------------------------------------------------------|
| `buzzword-density`       | buzzword list hits / 100 words (delve, tapestry, landscape, unleash, elevate, streamline, revolutionize, cutting-edge, game-changer, seamless, robust, leverage, synergy, harness, embark, realm, testament, vibrant, crucial, pivotal, innovative) |
| `ai-openers`             | "In today's fast-paced world", "In the ever-evolving landscape of", "It's important to note", "Look no further", "Are you tired of" |
| `not-x-but-y`            | "not just X, but Y" / "isn't X — it's Y" constructions        |
| `em-dash-density`        | em-dashes / 100 words above threshold                          |
| `exclamation-density`    | `!` / 100 words above threshold                                |
| `hedge-phrase`           | "it goes without saying", "at the end of the day", "when it comes to" |
| `superlative-stacking`   | 3+ superlatives in one sentence                                |
| `cta-cliche`             | "Get started today", "Try it now", "Join thousands of", "Sign up for free" |
| `listicle-structure`     | ≥3 consecutive sentences starting with bold/numbered markers   |
| `triadic-enumeration`    | "fast, reliable, and secure" style triples, repeated           |

Scoring: `score = clamp(round(sum(hit.points)), 0, 100)`. Each rule has a
`maxPoints` cap so one spammy signal can't max the score alone. Tier bands
exactly as in the `Tier` type above.

**Determinism (non-negotiable per AGENTS.md):** roast lines live in
`roasts.ts`, keyed by tier (5–10 lines per tier). Selection:
`index = fnv1a(normalize(text)) % roasts[tier].length` where `normalize`
lowercases and collapses whitespace. Same input → same score, same tier,
same roast, every time. No `Math.random()` anywhere in the package.

**Tests (`packages/slop-rules/test/engine.test.ts`):**

- each rule fires on a known-bad fixture and contributes expected points
- clean human-written fixture scores in `certified-human`/`mostly-organic`
- empty string, whitespace-only, and 1-word input → score 0, no crash,
  `lowConfidence: true`
- tier boundary values (19/20, 39/40, 59/60, 79/80) land in correct tiers
- determinism: same input scored 100× → identical `ScanResult` (deep equal)
- very long input (50k words) completes without pathological regex backtracking

**Done when:** `npm run test -w @cutai/slop-rules` passes; package builds to
`dist/` with `tsc`; engine importable as `@cutai/slop-rules` from the API
workspace.

---

## Phase 3 — API scaffold + paste-text endpoint (`@cutai/api`)

Goal: Fastify app boots, serves the engine synchronously for pasted text.
This **is** the "existing paste-text feature" AGENTS.md assumes — it gets
built here, before URL scanning.

**Dependencies (`apps/api`):** `fastify`, `@fastify/cors`,
`@fastify/rate-limit`, `ioredis`, `zod`, `@cutai/slop-rules` (workspace).
Dev: `typescript`, `tsx` (dev runner), `vitest`, `@types/node`.

**Env (`apps/api/.env`, parsed+validated in `src/config.ts` with zod):**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cutai   # used from Phase 4
REDIS_URL=redis://localhost:6379
PORT=3001
WEB_ORIGIN=http://localhost:5173
SCORE_RATE_LIMIT_PER_HOUR=30
SCAN_RATE_LIMIT_PER_HOUR=10
FETCH_TIMEOUT_MS=5000
FETCH_MAX_BYTES=5242880
```

**Endpoints (Phase 3 subset):**

- `GET /api/health` → `{ ok: true }`
- `POST /api/score`
  - body: `{ text: string }` (zod: min 1 char, max 50_000 chars → 400)
  - 200 → `ScanResult` straight from `scoreText(text)`
  - rate limited per IP: `SCORE_RATE_LIMIT_PER_HOUR` via
    `@fastify/rate-limit` with the `ioredis` store (satisfies the
    Redis-backed per-IP requirement; fixed-window internally — acceptable,
    upgrade to sliding window later if abused)

**Wiring:** `server.ts` builds the Fastify instance via an exported
`buildApp()` (so tests can `app.inject()` without listening). Plugins: cors
(origin = `WEB_ORIGIN`), rate-limit. Routes in `routes/score.ts` call
`scoreText` directly — no service layer needed for a pure function.

**Tests (`apps/api/test/score.test.ts`):** valid text → 200 + schema shape;
empty/oversized → 400; rate limit exceeded → 429 (use a low `max` in test
config).

**Done when:** `npm run dev -w @cutai/api` serves `/api/score` locally,
`curl` round-trips, tests pass with no Redis dependency in unit tests (mock
or stub the rate-limit store in test config).

---

## Phase 4 — Site fetcher + SSRF guard

Goal: given a URL, safely produce clean extracted text. Fully isolated
behind a `SiteFetcher` interface so it can be swapped for headless later.

**Dependencies (add):** `undici`, `@mozilla/readability`, `linkedom`.

**Files:**

- `src/lib/ssrf.ts` — pure guard logic
- `src/services/siteFetcher.ts` — fetch + extract pipeline
- `test/ssrf.test.ts`, `test/siteFetcher.test.ts`

**`SiteFetcher` contract:**

```ts
export type FetchFailure =
  | 'invalid-url' | 'blocked-host' | 'dns-failure' | 'timeout'
  | 'too-large' | 'http-error' | 'not-html'
  | 'insufficient-content' | 'fetch-failed'

export type FetchResult =
  | { ok: true; text: string; title: string | null; finalUrl: string; wordCount: number }
  | { ok: false; reason: FetchFailure; status?: number }

export interface SiteFetcher {
  extract(url: string): Promise<FetchResult>
}
```

**SSRF guard (`src/lib/ssrf.ts`) — all mandatory, no exceptions:**

1. Parse URL; scheme must be `http:` or `https:` (else `invalid-url`).
2. Block obvious literals before DNS: `localhost`, `*.localhost`, `*.local`,
   `*.internal`, any IP literal in a blocked range.
3. `dns.promises.lookup(hostname, { all: true, verbatim: true })` — validate
   **every** returned address against the blocklist:
   - IPv4: `0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`,
     `169.254.0.0/16`, `172.16.0.0/12`, `192.0.0.0/24`, `192.168.0.0/16`,
     `198.18.0.0/15`, `224.0.0.0/4`, `240.0.0.0/4`
   - IPv6: `::1/128`, `fc00::/7`, `fe80::/10`, and IPv4-mapped `::ffff:x.x.x.x`
     forms of the IPv4 list (unmap first, then re-check)
4. **DNS rebinding defense:** connect using the exact validated IP. Create an
   undici `Agent` per request with
   `connect: { lookup: (_h, _o, cb) => cb(null, validated.address, validated.family) }`
   so validation and connection cannot race. Set the `Host` header from the
   original hostname; TLS SNI stays the hostname.
5. Redirects: undici does **not** follow redirects by default — handle
   manually: on 3xx with `location`, resolve against current URL and re-run
   the **entire** guard (steps 1–4) on the new URL. Max 5 hops, then
   `fetch-failed`.

**Fetch pipeline (`siteFetcher.ts`):**

- timeout: `AbortSignal.timeout(FETCH_TIMEOUT_MS)` plus undici
  `headersTimeout`/`bodyTimeout` → `timeout` on abort
- size cap: check `content-length` header first; regardless, count bytes
  while reading the body and abort past `FETCH_MAX_BYTES` → `too-large`
- non-2xx → `http-error` (keep status); `content-type` not containing
  `html` → `not-html`
- success → parse with `linkedom`, run `@mozilla/readability`, take
  `textContent`; collapse whitespace
- extracted `< 100` words → `insufficient-content` (JS-empty-shell case —
  never fabricate a score from a shell page)
- **Testability:** constructor takes injectable `lookup` (dns) and
  `request` (undici) functions so tests never touch the network

**Tests (`test/ssrf.test.ts`, `test/siteFetcher.test.ts`) — all network
mocked:**

- table-driven: every blocked IPv4 range above → `blocked-host`
- IPv6: `::1`, `fc00::1`, `fe80::1`, `::ffff:127.0.0.1` → `blocked-host`
- first hop public, redirect `location` → `http://169.254.169.254/` →
  `blocked-host` (redirect re-validation)
- 6 redirects → `fetch-failed`; scheme `file:`/`ftp:` → `invalid-url`
- DNS returns `[public, private]` mixed → `blocked-host`
- simulated timeout → `timeout`; body past cap → `too-large`
- fixture HTML article → extracted text; empty `<div id="root"></div>` shell
  → `insufficient-content`

**Done when:** `SiteFetcher.extract(url)` returns clean text or a typed
failure reason; full test suite green with zero live network calls.

---

## Phase 5 — Async scan pipeline (DB + queue + routes)

Goal: submit a URL, get a scan back, without blocking the request thread.

**Dependencies (add):** `@prisma/client`, `prisma` (dev), `bullmq`.

**Prisma schema (`apps/api/prisma/schema.prisma`):**

```prisma
enum ScanStatus {
  QUEUED
  RUNNING
  DONE
  FAILED
}

model Site {
  id            String    @id @default(cuid())
  normalizedUrl String    @unique
  slug          String    @unique
  hostname      String
  autoRescan    Boolean   @default(false)
  publicListing Boolean   @default(false)  // Phase 7, opt-in only
  lastScannedAt DateTime?
  createdAt     DateTime  @default(now())
  scans         Scan[]
}

model Scan {
  id          String     @id @default(cuid())
  siteId      String
  site        Site       @relation(fields: [siteId], references: [id], onDelete: Cascade)
  status      ScanStatus @default(QUEUED)
  score       Int?
  tier        String?
  roast       String?
  breakdown   Json?
  wordCount   Int?
  error       String?
  createdAt   DateTime   @default(now())
  completedAt DateTime?

  @@index([siteId, createdAt])
}
```

`url` is not stored separately — `normalizedUrl` is the canonical form and
what we display. Migrate: `npx prisma migrate dev --name init` (run from
`apps/api`).

**URL normalization + slug (`src/lib/url.ts`):**

- add `https://` if scheme missing; lowercase scheme+host; strip fragment;
  strip default ports; strip trailing `/` on path; sort query params; drop
  `utm_*`/`fbclid`/`gclid` params
- `slug = sha256(normalizedUrl).digest('base64url').slice(0, 10)`

**Queue (`src/lib/queue.ts`):** BullMQ `Queue('site-scan', { connection })`
from `REDIS_URL`. Enqueue with `jobId: slug` (dedupes concurrent repeat
submissions of the same site), `attempts: 2`,
`backoff: { type: 'fixed', delay: 5000 }`, `removeOnComplete: 100`,
`removeOnFail: 500`.

**Worker (`src/worker.ts`, separate process, `npm run worker`):**
concurrency 5. Job processor:

1. `Scan.status → RUNNING`
2. `SiteFetcher.extract(url)`
   - `ok: false` → `Scan.status = FAILED`, `error = reason`, update
     `lastScannedAt`, return (do **not** throw — a private-IP block is a
     result, not a retryable failure; only throw on unexpected exceptions so
     BullMQ retries those)
3. `scoreText(text)` → write score/tier/roast/breakdown/wordCount,
   `status = DONE`, `completedAt`, `Site.lastScannedAt = now()`
4. badge cache invalidation: `DEL badge:*:<scanId-prefix>:*` is unnecessary
   (cache is keyed by scanId, and a new scan = new scanId) — but `DEL`
   `badge:latest:<slug>:*` pointers if we cache "latest scan for slug"
   lookups (see Phase 6)

**autoRescan:** default off. When a site is opted in (future admin action,
not a v1 UI), register `queue.upsertJobScheduler('rescan-' + siteId,
{ pattern: '0 3 * * *' }, { name: 'scan', data: { siteId, url } })`. Not
part of v1 acceptance.

**Rate limiting:** same mechanism as `/api/score` — `@fastify/rate-limit`
plugin registered at the app level with the `ioredis` store. The per-route
`config: { rateLimit: { max: SCAN_RATE_LIMIT_PER_HOUR, timeWindow: '1 hour' } }`
applies just to `POST /api/scan` (and optionally `POST /api/score` gets its
own max via the same hook). One plugin, two different route-level `max`
values — no second rate-limit implementation.

**Routes:**

- `POST /api/scan`
  - body `{ url: string, publicListing?: boolean }` → normalize (invalid → 400)
  - rate limit per IP via the shared `@fastify/rate-limit` plugin
  - upsert `Site` by `normalizedUrl`; if `publicListing` is sent, set
    `Site.publicListing` on insert **or** update (one upsert call covers
    both new and repeat submissions)
  - **non-terminal guard:** if the latest `Scan` for the site has status
    `QUEUED` or `RUNNING`, return its existing slug/status (202 or 200
    respectively) without creating a new row — prevents orphaned rows when
    `jobId` dedup is the only thing preventing a double enqueue
  - **recent-done shortcut:** if latest `Scan` is `DONE` and `< 24h` old →
    200 `{ slug, status: 'done', scan }` without enqueuing
  - else create `Scan(QUEUED)`, enqueue job with `jobId: slug` → **202**
    `{ slug, status: 'queued' }`
- `GET /api/scan/:slug`
  - 404 if slug unknown
  - 200 `{ slug, url: normalizedUrl, status, scan?: { score, tier, roast,
    breakdown, wordCount, createdAt }, error? }` where `scan` is present
    when `status === 'done'` and `error` when `'failed'`

**Repositories:** `siteRepository.ts` (`upsertByUrl`, `findBySlug`),
`scanRepository.ts` (`create`, `findLatestBySite`, `markRunning`,
`markDone`, `markFailed`). Routes never import Prisma.

**Tests (`test/scanRoutes.test.ts`):** `app.inject()` with mocked repo +
queue: submit → 202 shape; invalid URL → 400; unknown slug → 404; done scan
→ full payload; rate limit → 429; recent-scan shortcut → 200 without
enqueue; **non-terminal guard**: when a `QUEUED` or `RUNNING` scan already
exists, a repeat submit returns the existing slug without creating a second
`Scan` row or enqueueing a second job. Worker processor test: mocked fetcher
ok/fail paths write correct `Scan` rows (mock repo, assert calls).

**Done when:** with `docker compose up -d` running, a real URL can be
submitted, processed by the worker, and polled to `done`/`failed`; rate
limiting verified with repeat curl.

---

## Phase 6 — Badge renderer (Satori)

Goal: turn a `Scan` into a cacheable image. Pure function of scan data —
no DB, no side effects inside the renderer.

**Dependencies (add):** `satori`, `@resvg/resvg-js`.

**Fonts:** Satori requires font buffers — download Inter Regular + Inter
Bold TTFs into `apps/api/assets/fonts/` (committed, ~350KB each) and load
once at boot. Note this in `apps/api/README.md` or the main README.

**Files:**

- `src/services/badge/themes.ts` — theme presets: `slop-detector`
  (default, matches brand), `clean`, `brutal`, `playful`, `premium`.
  Only `slop-detector` is required for launch; others are stretch.
- `src/services/badge/render.tsx` —
  `renderBadge({ score, tier, roast, theme, size }): ReactElement` for
  satori. Two sizes, same theme system, one code path: `sm` (≈ 320×80
  embeddable shield) and `lg` (≈ 1200×630 share banner). Layout switches on
  `size`, colors/typography on `theme`.
- `src/services/badge/badgeService.ts` — loads scan (via repository),
  renders, converts, caches.

**Routes:**

- `GET /badge/:slug.svg?theme=&size=` → `image/svg+xml`
- `GET /badge/:slug.png?theme=&size=` → `image/png` (resvg at 2× for
  retina: render JSX at logical size, `fitTo: { mode: 'width', value: width * 2 }`)

**Caching (cache-first, per AGENTS.md):**

- Resolve `slug → latest DONE scan` via Redis pointer
  `badge:latest:<slug>` (JSON of scanId+score+tier+roast, TTL none —
  deleted by the worker when a newer scan completes)
- Rendered output cached as `badge:img:<scanId>:<theme>:<size>:<fmt>` →
  Buffer, no expiry (immutable: scanId never changes)
- Response headers: `Cache-Control: public, max-age=3600,
  stale-while-revalidate=86400` so Cloudflare edge absorbs repeat `<img>`
  hits — this endpoint is hit on every pageview of every embedding site
- Unknown slug or no completed scan → render a placeholder badge
  ("unscanned — check yours at cutai.org"), `Cache-Control: public,
  max-age=60`, no Redis write

**Tests (`test/badge.test.ts`):** snapshot the SVG string per tier ×
`slop-detector` theme × both sizes (5×2 snapshots); placeholder render for
unknown slug; service-level cache hit avoids re-render (spy on satori).

**Done when:** badge SVG/PNG render for a scanned site, repeat requests are
served from Redis without re-render, placeholder works for unknown slugs.

---

## Phase 7 — Frontend (`@cutai/web`)

Goal: usable end-to-end flow, no login.

**Dependencies:** none new — `react-router-dom@7` is already installed,
just unused.

**Wiring:**

- `src/main.tsx`: wrap in `<BrowserRouter>`; routes:
  - `/` → existing `App` (landing page, untouched)
  - `/scan` → `ScanPage` (submit form + result inline)
  - `/scan/:slug` → `ScanResultPage` (shareable result URL; polls while queued)
  - `*` → existing `NotFound`
- `src/lib/api.ts`: `const API = import.meta.env.VITE_API_BASE ?? ''` +
  typed `postScan(url)`, `getScan(slug)`, `postScore(text)` wrappers
- `apps/web/vite.config.ts`: dev proxy so local dev needs no CORS:
  `server: { proxy: { '/api': 'http://localhost:3001', '/badge': 'http://localhost:3001' } }`

**Pages/components (new files under `src/pages/scan/` + `src/components/scan/`):**

1. `ScanPage`:
   - mode tabs: **"Scan a URL"** | **"Paste text"** (paste mode posts to
     `/api/score`, result instant, no slug/polling)
   - `UrlScanForm`: input + client-side URL sanity check, submit →
     `POST /api/scan` → navigate to `/scan/:slug`
2. `ScanResultPage`:
   - polls `GET /api/scan/:slug` every 2s while `queued`/`running`
     (stop after 60s with a "still working…" note, keep polling slower)
   - done → `ScoreGauge` (0–100 + tier), roast line (styled quote),
     `BreakdownList` (per-rule points, count, examples)
   - failed → friendly error keyed off `error` reason
     (`insufficient-content` explains the site looks like a JS shell)
3. `BadgeSection` (on done result):
   - live preview of `/badge/:slug.svg` and the `lg` banner
   - `EmbedSnippet`: markdown
     `[![Slop Score](<API>/badge/<slug>.svg)](https://cutai.org/scan/<slug>)`
     and HTML `<a><img></a>` variants, copy-to-clipboard with fallback
   - "Download PNG" → plain `<a href="/badge/:slug.png" download>`
4. Landing page: add one link/CTA in `Hero` (or nav) to `/scan` — minimal
   touch, don't redesign the landing page.

**Styling:** match existing dark theme (`bg-[#050505]`, zinc/purple/pink
accents, Tailwind v4 utility style already in components).

**Done when:** paste a URL → watch it scan → see score/roast/breakdown →
copy an embed snippet or download the PNG; paste-text mode works too; no
login anywhere.

---

## Phase 8 — Leaderboard (deferred, opt-in only)

Goal: virality loop, without roasting people who didn't ask for it.

- `Site.publicListing` already in schema (`@default(false)`) — set true
  only via an explicit checkbox at submission time. The checkbox value is
  already accepted in `POST /api/scan` body as `publicListing?: boolean`
  (added in Phase 5 — not a new endpoint). The upsert in Phase 5 handles
  both insert and update of this field, so Phase 8 adds **zero backend
  surface area**: just the frontend checkbox.
- `GET /api/leaderboard` → opted-in sites only, sorted by score desc,
  paginated (50/page). `GET /leaderboard` frontend page.
- No auto-listing, no backfilling existing sites, no scraping other scans
  into the gallery.

**Done when:** leaderboard returns only explicitly opted-in sites (test:
site with `publicListing: false` never appears).

---

## Post-implementation cleanup — update AGENTS.md

The plan's "Current repo reality" section (p.1) spent time correcting false
assumptions baked into AGENTS.md — "existing rule engine" and "existing
paste-text feature" that didn't exist. Once Phases 1–7 execute, those
features **will** exist, but AGENTS.md won't know that. The next agent to
touch this repo will hit the same stale prose and spend the same mental
overhead.

Fix: after the final frontend (Phase 7) is verified, update AGENTS.md:

1. Find the three fiction references — search for `"existing slop-detection
   rule engine"`, `"existing paste-text feature"`, and `"from a existing
   paste-text route handler"` (or similar wording).
2. Rewrite each to past-tense or remove the "existing" qualifier. Example:
   - Before: _"shared between the existing paste-text feature and the new
     URL-scan feature"_
   - After: _"shared between the paste-text endpoint (`POST /api/score`)
     and the URL-scan feature"_
3. If AGENTS.md has a "Current status" or "Repo layout" section, update it
   to reflect the monorepo structure (apps/web, apps/api, packages/slop-rules).
4. Strike any references to "Phase 0 extraction" or repo conditions
   documented in this plan's §0 that are no longer true.

**Done when:** a grep of AGENTS.md for `"existing"` in the relevant
paragraphs returns no false positives — every claim in it matches the actual
state of the repo after implementation.

---

## Deployment & ops

- **Web (Cloudflare Pages):** build command `npm run build -w @cutai/web`,
  output dir `apps/web/dist`, env `VITE_API_BASE=https://api.cutai.org`.
  SPA fallback: `_redirects` in `apps/web/public/` with
  `/* /index.html 200` (required once the router is wired up).
- **API + worker:** need a persistent Node host (Cloudflare Pages cannot
  run Fastify/BullMQ). Recommended: one Docker image from `apps/api`
  deployed as two processes (`node dist/server.js`, `node dist/worker.js`)
  on Fly.io / Railway / Render. Postgres + Redis managed by the same
  provider or Neon/Upstash. **Open decision — pick before Phase 5 ships.**
- **DNS:** `api.cutai.org` → API host; set `WEB_ORIGIN=https://cutai.org`
  on the API.
- **Migrations:** `npx prisma migrate deploy` as a release step on the API
  host.

---

## Explicitly out of scope for this plan

- Design scoring (screenshot + visual heuristics, needs Playwright)
- Speed scoring (needs PageSpeed API or real browser timing)
- Trust/originality scoring (no deterministic signal source)
- Compare/challenge-another-site
- Login/accounts/profiles

Revisit these only after v1 (Phases 1–7) is live and validated.

---

## Open decisions to confirm before implementation

1. **Backend host:** Fly.io vs Railway vs Render (affects Dockerfile +
   release-step setup in Phase 5/deploy).
2. **Roast-line copy:** the actual roast strings per tier need a tone pass
   (funny, not defamatory — we roast the text, not the person).
3. **`www.` handling:** treat `www.example.com` and `example.com` as the
   same site (strip `www.` in normalization) or distinct? Recommendation:
   strip `www.`.
