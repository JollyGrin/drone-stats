# drone-stats

A personal tool to organize an FPV drone build: track parts (have / want / idea),
check compatibility, compare options, share the kit, and keep up with upgrades.

**Status:** data model first. Static site (GitHub Pages) and Node scripts come next.

## How it's structured

Everything is driven by two JSON files. This is the single source of truth — the
future website just *renders* them, and the local scripts just *update* them.

```
drone-stats/
├── data/
│   ├── catalog.json   # shareable parts DATABASE: specs + compatibility
│   └── kit.json       # MY kit: what I own/want, references catalog parts by id
├── scripts/           # (later) Node scripts, run locally, write back into data/
└── index.html         # (later) reads data/*.json, renders the dashboard
```

Why two files: the **catalog** is reusable knowledge about parts (shareable, growable,
the basis for "compare" and "find upgrades"). The **kit** is just *your* ownership +
status layered on top. Keeping them separate means you can share your kit, diff two
kits, or swap a part for an alternative without duplicating spec data.

## Data model

### catalog.json

```jsonc
{
  "schemaVersion": 1,
  "categories": [ { "id": "radio", "label": "...", "icon": "📻" } ],
  "parts": [
    {
      "id": "kebab-case-unique-id",      // referenced by kit.json
      "name": "Display name",
      "brand": "Brand",
      "category": "radio",               // must match a categories[].id
      "specs": { ... },                  // free-form, category-specific
      "compat": {                        // the fields the compat checker reads
        "videoSystem": "walksnail",      // walksnail | dji-o3 | dji-o4 | analog | hdzero
        "radioProtocol": "elrs",         // elrs | crossfire | frsky
        "cellCount": "1S",               // 1S | 2S | 4S | 6S
        "connector": "A30"               // A30 | BT2.0 | XT30 | XT60 | PH2.0
      },
      "retailers": [ { "name", "url", "price", "currency", "lastChecked" } ],
      "links": { "review": "url", "affiliate": "url" },   // affiliate = future $$
      "tags": ["whoop", "digital"],
      "notes": "Plain-English context.",
      "verify": true                     // OPTIONAL flag in specs: spec not yet confirmed
    }
  ]
}
```

### kit.json

```jsonc
{
  "schemaVersion": 1,
  "owner": { "name", "shareUrl", "updated" },
  "builds": [
    {
      "id": "pico-build",
      "name": "...",
      "summary": "...",
      "target": {                        // what this build is SUPPOSED to be
        "videoSystem": "walksnail",      // compat script flags items that don't match
        "radioProtocol": "elrs",
        "cellCount": "1S"
      },
      "items": [
        {
          "partId": "betafpv-pavo-pico", // -> catalog.json parts[].id
          "status": "have",              // have | ordered | want | idea
          "qty": 1,
          "purchasedPrice": null,
          "note": ""
        }
      ]
    }
  ]
}
```

## Compatibility rules (the logic the future script encodes)

FPV compatibility is bounded and rule-able:

- **Video system must match end-to-end.** Goggles ↔ air unit must share `videoSystem`
  (Walksnail goggles only show Walksnail air units, etc.).
- **Radio protocol must match.** TX (`radio`) ↔ the drone's RX must share `radioProtocol`
  (ELRS radio needs an ELRS receiver — the Pico ELRS variant has one built in).
- **Cell count must match.** Battery `cellCount` ↔ build `target.cellCount` ↔ what the
  motors/FC expect (the Pico is 1S).
- **Connector must match.** Battery `connector` ↔ charger `connector` ↔ drone.
- **Frame/prop class drives motor + prop choice** (whoop → ~2" → 1102-class motors).

## Roadmap

1. ✅ **Data model** — `catalog.json` + `kit.json` with the real current parts.
2. ✅ **Static dashboard** — `index.html` renders the kit (have/want, gaps, critical path).
3. ✅ **Compat check** — embedded in the dashboard (per-build, against `target`). A CLI
   `scripts/compat.js` can reuse the same logic later if wanted.
4. ⬜ **Price check** (`scripts/check-prices.js`) — refresh retailer prices for known URLs.
5. ⬜ **Upgrades / compare** — surface alternatives within a category.
6. ⬜ **Publish** — GitHub Pages + affiliate links + video links.

## Running the dashboard locally

`fetch()` is blocked on `file://`, so serve it over HTTP. Pure Node, no install:

```sh
npm start            # zero-dependency Node server → http://localhost:8000
```

On GitHub Pages it's served over HTTP automatically, so it just works.

## Current kit snapshot

| Part | Category | Status |
|---|---|---|
| RadioMaster Pocket | Radio (ELRS) | ✅ have |
| BetaFPV Pavo Pico | Drone | ✅ have |
| Walksnail Avatar HD Pro Kit | Air unit | 🛒 want (critical path) |
| Walksnail Avatar Goggles X | Goggles | 🛒 want (critical path) |
| 1S batteries | Battery | 🛒 want (gap) |
| 1S charger | Charger | 🛒 want (hidden gap) |
| BetaFPV 1102 18000KV | Motors | 💡 idea (spares) |

> ⚠️ Several `specs` carry `"verify": true` — they're best-guess and should be
> confirmed against the product page before you rely on them (esp. battery connector).
