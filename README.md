# PanelWorth

Identify a comic book and see what it's actually worth — a price **range**
built from recent sold listings, adjusted for condition, with the math shown.
No single inflated number, no guessing when there isn't enough data.

This build runs entirely on mock/seed data so the whole app is clickable
end-to-end with no backend or API keys. Two functions are deliberately
stubbed (see below); everything else — UI, navigation, valuation logic,
collection tracking, paywall — is fully built.

> "PanelWorth" is a placeholder name. Rename freely — it only appears in
> `index.html` and a couple of UI strings in `src/pages/HomePage.tsx`.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL. The layout is mobile-first: resize your browser
narrow (or open dev tools' device toolbar) to see the intended phone
experience, or just use it on a phone on the same network.

Other scripts:

```bash
npm run build    # type-check + production build
npm run lint     # eslint
npm run preview  # preview the production build
```

## What's real vs. seed data

- **Search, results, valuation, condition adjustment, collection, and the
  paywall/account flows are fully functional**, working against six seed
  comics in `src/data/catalog.ts` (Amazing Spider-Man #300, Incredible Hulk
  #181, New Mutants #98, Saga #1, Spawn #1, and X-Men #1 (1991) — included
  specifically because it's a famous *non-key*, high-print-run book worth
  very little, to show the app being honest about low-value books too).
- **Barcode decoding is real**, using the browser's
  [`BarcodeDetector`](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)
  API on a photo you capture, then looking the decoded UPC up against the
  seed catalog. If your browser doesn't support `BarcodeDetector` (Safari,
  Firefox), the UI falls back to manual numeric entry.
- **Cover-photo recognition and live sold-comp pricing are stubbed.** They're
  fully wired into the UI (camera capture, confirm-before-trusting flow,
  loading/error states) but return mock data instead of calling a real
  service. Both are isolated behind a single function each — see below.

## The two stubbed functions

### 1. `fetchComps(issueId)` — `src/services/comps.ts`

Returns recent **sold** prices for a comic as two arrays — raw and graded —
which `src/lib/valuation.ts` then trims (drops the single highest and
lowest as outliers) and turns into a low/median/high band. Right now it just
reads from the seed catalog after a simulated delay.

**To make it live:** call eBay's Marketplace Insights / Sold Items API
(via the [eBay Developers Program](https://developer.ebay.com)) for items
matching the comic's title and issue number, filtered to completed/sold
listings, and map the results into the same `SoldComp[]` shape
(`{ price, date, label }`). Using eBay's sold-listing data requires an eBay
developer account and is subject to
[eBay's API terms of use](https://developer.ebay.com/join/policies) — read
those before going live. Keep returning **arrays** of real individual
sales; never collapse them into a single hardcoded price, since the whole
point of the app is showing a range backed by real comps.

Env vars needed once live: `EBAY_APP_ID`, `EBAY_CERT_ID`, `EBAY_OAUTH_TOKEN`.

### 2. `identifyByImage(photo)` — `src/services/recognition.ts`

Takes a captured cover photo and should return one or more candidate issues
with a genuine confidence score. Right now it ignores the photo and returns
a random catalog pick with a random confidence, only to exercise the
confirm-before-trusting UI.

**To make it live:** you need either a custom-trained vision model (e.g. an
embedding-search index built from a labeled set of comic cover images) that
you host, or a licensed third-party cover/image recognition API. Whatever
you use, keep the contract the same — return candidates with a real
confidence score, and never bypass the UI's confirmation step. Recognition
from a photo is inherently uncertain (variant covers, reprints, glare,
damage), so low-confidence results must keep routing users to manual search
(see `LOW_CONFIDENCE_THRESHOLD` in the same file).

Env vars needed once live: depends on the provider, e.g. `RECOGNITION_API_KEY`.

## Environment variables

None are required to run the app as-is — everything works on mock data and
`localStorage`. These are only needed when wiring up the corresponding real
service:

| Variable | Used for | Required? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Switches the collection store from `localStorage` to Supabase (see below) | Optional |
| `VITE_SUPABASE_ANON_KEY` | Same as above | Optional |
| `EBAY_APP_ID` / `EBAY_CERT_ID` / `EBAY_OAUTH_TOKEN` | Making `fetchComps` live via eBay's API | Only once `fetchComps` is made live |
| `RECOGNITION_API_KEY` | Making `identifyByImage` live | Only once `identifyByImage` is made live |
| `REVENUECAT_PUBLIC_API_KEY` | Making billing live via RevenueCat | Only once billing is made live |

Copy `.env.example` to `.env` and fill in values as you wire up real
services. Vite only exposes vars prefixed `VITE_` to client code, which is
why the Supabase vars use that prefix — the eBay/recognition/RevenueCat
calls belong on a server or edge function (not the client, to avoid
shipping secret keys to the browser), so they aren't `VITE_`-prefixed here.

## Swappable persistence (Supabase)

The collection store is implemented behind a `CollectionStore` interface
(`src/services/collection/types.ts`) with two implementations:

- `localStore.ts` — `localStorage`-backed, used by default.
- `supabaseStore.ts` — real Supabase-backed implementation against a
  `collection_items` table (`saved_id`, `issue_id`, `condition`, `saved_at`,
  `user_id`; see the comment at the top of the file for the exact schema).

`src/services/collection/index.ts` picks whichever implementation is
available — Supabase if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are
set, otherwise the local mock — with **no changes needed anywhere in the
UI**.

## Billing (mocked)

`src/services/billing.ts` mocks a subscription with `localStorage`,
exposed through `useBilling()`. No real charge ever happens in this build.
To go live, swap it for [RevenueCat](https://www.revenuecat.com/) (web SDK
`@revenuecat/purchases-js`, or the Expo/React Native SDK if you port this to
a native app) behind the same `purchase` / `cancel` / `restore` functions
the UI already calls — no UI changes needed.

The paywall is intentionally built without dark patterns: the free-vs-pro
comparison table is shown before any purchase, cancellation is one tap from
the Account screen with no win-back screens or countdown timers, and there
are no pre-checked upsells.

## Porting to React Native + Expo

The app is structured to make this straightforward later:

- All business logic (`src/lib`, `src/services`, valuation, catalog) is
  plain TypeScript with no DOM dependencies, so it can be reused as-is.
- State is in React Context (`src/context`), not tied to any web-only
  routing or storage API beyond `localStorage`, which has an Expo/RN
  equivalent (`AsyncStorage`) you'd swap behind the same store interfaces.
- Only the presentational components (`src/components`, `src/pages`) and
  the camera-capture inputs (currently `<input type="file" capture>`) would
  need React Native equivalents (Expo Camera, Expo Barcode Scanner, etc).

## Project structure

```
src/
  components/        Reusable UI (value range cards, comps list, condition
                      selector, "how we calculated this" sheet, etc.)
  components/layout/  App frame, page header, bottom nav, root layout
  context/            Billing + collection React contexts and hooks
  data/catalog.ts      Seed comic data (6 issues) + search/lookup helpers
  lib/                 Valuation algorithm + eBay sold-listings URL builder
  pages/               One file per screen
  services/            fetchComps, identifyByImage, barcode decoding,
                        billing, collection persistence — the swappable layer
  types/comic.ts        Shared domain types
```
