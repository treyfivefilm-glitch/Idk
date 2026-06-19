# PanelWorth

A comic collection manager that also tells you what your books are actually
worth — honestly. Identify a comic (search, cover scan, or barcode scan),
file it into a named box, and track a price **range** that's never blended
from two different kinds of data: raw asking prices and graded sold prices
stay separate, always.

This build runs entirely on mock/seed data so the whole app is clickable
end-to-end with no backend or API keys. Three functions are deliberately
stubbed (see below); everything else — UI, navigation, valuation logic,
collection management, paywall — is fully built.

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

## The core loop

1. **Identify** a comic — search, scan its cover, or scan its barcode.
2. **Save it** into a named box ("My Collection" by default, or create your
   own — "Long boxes," "Spider-Man run," whatever).
3. **See what it's worth** — a raw asking-price range if it's unslabbed
   (adjusted for the condition you pick), or a graded sold-price range if
   it's CGC/CBCS slabbed. Never both blended into one number.
4. **Check before you buy** — search or scan a comic you're considering, and
   if you already own a copy, PanelWorth tells you before you buy a
   duplicate.

The Collection tab is the center of the app: box tabs, list/card views, sort
(recently added / title / value) and group (by series / creator / grade /
box), a collection-wide value summary, per-comic personal record-keeping
(purchase price/date, storage location, signed-by, notes, your own cover
photo), and CSV export on Pro.

## What's real vs. seed data

- **Search, results, valuation, condition adjustment, collection management,
  and the paywall/account flows are fully functional**, working against six
  seed comics in `src/data/catalog.ts` (Amazing Spider-Man #300, Incredible
  Hulk #181, New Mutants #98, Saga #1, Spawn #1, and X-Men #1 (1991) —
  included specifically because it's a famous *non-key*, high-print-run book
  worth very little, to show the app being honest about low-value books too).
- **Barcode decoding is real**, using the browser's
  [`BarcodeDetector`](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)
  API on a photo you capture, then looking the decoded UPC up against the
  seed catalog. If your browser doesn't support `BarcodeDetector` (Safari,
  Firefox), the UI falls back to manual numeric entry.
- **Cover-photo recognition and live price data are stubbed.** They're fully
  wired into the UI (camera capture, confirm-before-trusting flow,
  loading/error states) but return mock data instead of calling a real
  service. Each is isolated behind one function — see below.

## The stubbed functions

### 1. `fetchValue(issueId)` — `src/services/value.ts`

Returns two separate arrays for a comic — `rawListings` (currently-listed
**asking** prices) and `gradedSales` (professionally-graded **sold** sales)
— which `src/lib/valuation.ts` then trims (drops the single highest and
lowest as outliers) and turns into a low/median/high band, one band per
array. Right now it just reads from the seed catalog after a simulated
delay.

**To make it live, two different real data sources feed this, and they must
stay separate** — never blended into one number, and never relabeled as the
other:

1. **Graded sold sales → [GoCollect's API](https://gocollect.com/api-docs).**
   Self-serve API key, free basic tier, ~$89/yr for the Pro tier. Returns
   individual graded sales (price, date, certified grade, grading company,
   sale type) for a given issue. Map each sale straight into `GradedSale`.
2. **Raw asking prices → [eBay's Browse API](https://developer.ebay.com)**,
   which is free and covers ACTIVE listings only. eBay's sold-listings API
   (Marketplace Insights) is a Limited Release product not available to new
   developers, which is exactly why this app never claims to show sold raw
   prices — only what raw copies are currently asking. Map each active
   listing into `RawListing`, and keep the UI label honest (e.g.
   "Listed · VF", never "Sold").

Either way:
- Keep returning **arrays** of individual entries — never collapse to one
  number here. All trimming/averaging happens in `lib/valuation.ts`, where
  it stays visible to the user via "How we calculated this."
- Never let a raw listing's asking price be presented as a sold price, and
  never blend raw and graded into a single band.

`src/lib/ebay.ts` separately builds plain outbound links to eBay's own
search UI (not API calls) so a curious user can browse the underlying
listings themselves — those work today with no key, regardless of whether
`fetchValue` itself is live.

Env vars needed once live: `GOCOLLECT_API_KEY`, `EBAY_APP_ID`, `EBAY_CERT_ID`.

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

### 3. Billing — `src/services/billing.ts`

See [Billing (mocked)](#billing-mocked) below.

## Environment variables

None are required to run the app as-is — everything works on mock data and
`localStorage`. These are only needed when wiring up the corresponding real
service:

| Variable | Used for | Required? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Switches the collection store from `localStorage` to Supabase (see below) | Optional |
| `VITE_SUPABASE_ANON_KEY` | Same as above | Optional |
| `GOCOLLECT_API_KEY` | Making `fetchValue`'s graded sold-sales side live via GoCollect | Only once `fetchValue` is made live |
| `EBAY_APP_ID` / `EBAY_CERT_ID` | Making `fetchValue`'s raw asking-price side live via eBay's Browse API | Only once `fetchValue` is made live |
| `RECOGNITION_API_KEY` | Making `identifyByImage` live | Only once `identifyByImage` is made live |
| `REVENUECAT_PUBLIC_API_KEY` | Making billing live via RevenueCat | Only once billing is made live |

Copy `.env.example` to `.env` and fill in values as you wire up real
services. Vite only exposes vars prefixed `VITE_` to client code, which is
why the Supabase vars use that prefix — the GoCollect/eBay/recognition/
RevenueCat calls belong on a server or edge function (not the client, to
avoid shipping secret keys to the browser), so they aren't `VITE_`-prefixed
here.

## Swappable persistence (Supabase)

The collection store — both the named boxes (`Collection`) and the comics
filed into them (`SavedComic`) — is implemented behind a `CollectionStore`
interface (`src/services/collection/types.ts`) with two implementations:

- `localStore.ts` — `localStorage`-backed, used by default.
- `supabaseStore.ts` — real Supabase-backed implementation against two
  tables; see the comment at the top of the file for the exact schema:
  - `collections` — `id`, `name`, `created_at`, `user_id`
  - `collection_items` — `saved_id`, `issue_id`, `collection_id`,
    `condition`, `saved_at`, `is_slabbed`, `grade`, `grading_company`,
    `purchase_price`, `purchase_date`, `storage_box`, `signed_by`, `notes`,
    `personal_cover_url`, `user_id`

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

Free vs. Pro, as shown on the paywall:

- **Free**: identify by search/scan, basic raw asking-price range, save
  comics to your collection (capped at `FREE_COLLECTION_LIMIT` — currently
  25 — combined across all boxes, see `src/lib/limits.ts`).
- **Pro**: unlimited collection size, full raw listing history, graded
  (CGC/CBCS) sold-price estimates & history, collection value history &
  tracking, CSV export.

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
  components/        Reusable UI — value range cards, comps list, condition
                      selector, box tabs, collection toolbar, saved-comic
                      tile, add-to-collection sheet, value summary card,
                      "how we calculated this" sheet, etc.
  components/layout/  App frame, page header, bottom nav, root layout
  context/            Billing + collection React contexts and hooks
  data/catalog.ts     Seed comic data (6 issues) + search/lookup helpers
  lib/                Valuation algorithm, value-history helper, eBay
                      outbound-link builder, free-tier collection limit
  pages/              One file per screen, including the collection page
                      and the per-saved-comic detail page
  services/           fetchValue, identifyByImage, barcode decoding,
                      billing, collection persistence — the swappable layer
  types/comic.ts      Shared domain types (issues, listings/sales, boxes,
                      saved comics, value bands)
```
