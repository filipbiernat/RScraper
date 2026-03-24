# TASK-002 Plan — Last Minute View

## Scope

Design and implement a dedicated Last Minute view in RDisplay for trips departing within the next 14 days, with an option to expand the window to 30 days.

This document captures the agreed product concept, data contract, UI behavior, and implementation direction.

## Product Decisions

### View Placement

- Add a dedicated route: `/last-minute`
- Keep it separate from the main Deals page and Explorer page
- Treat it as a hybrid feed, not just a filtered copy of `deals.json`

### Primary User Experience

- Show trips departing within the next 14 days by default
- Provide a `Show wider window` action that expands the range from 14 to 30 days
- Present results in two switchable tabs:
    - `1 person`
    - `2 persons`
- Group results by departure date
- Sort groups by nearest departure first
- Treat date and price as equally important visual elements on the card
- Display price per person only

### Filters

- Country
- Departure airport
- Maximum price per person
- Departure window length (default 14 days, expandable to 30 days)

### Deal Highlighting

- Show all eligible Last Minute trips within the selected window
- Strongly highlight trips that are also present in `deals.json`
- Highlighting should be stronger than a subtle badge
- Recommended presentation:
    - `Deal` badge
    - reason badge (`Price Drop`, `All-Time Low`, `Lowest for Trip`, or equivalent)
    - accent border or elevated visual treatment

### Empty State

- If no trips exist in the 14-day window, show an empty state with `Show wider window`
- After expanding to 30 days, keep current tab and filters intact
- If no trips exist even in the 30-day window, show a normal empty state with filter guidance

## Recommended Data Strategy

### Source of Truth

Do not build the Last Minute view entirely from the frontend.

Reason:

- `deals.json` contains only selected deals, not all short-term departures
- CSV files are currently loaded in the Explorer only after a specific file is selected
- Parsing all CSV files in the browser would be unnecessarily heavy and harder to maintain

### New Generated Feed

Generate a dedicated file, recommended name:

- `data/last-minute.json`

The generator should use all future trip terms from CSV data and enrich them with deal metadata derived from `deals.json` logic or shared internal computation.

## Proposed Data Contract

Each Last Minute record should include at least:

| Field                | Type             | Notes                                    |
| -------------------- | ---------------- | ---------------------------------------- |
| `country`            | `string`         | Display country                          |
| `trip`               | `string`         | Original trip name                       |
| `airport`            | `string`         | Departure airport                        |
| `persons`            | `number`         | 1 or 2                                   |
| `dateRange`          | `string`         | Original `dd.mm.yyyy - dd.mm.yyyy` label |
| `departureDate`      | `string`         | ISO date recommended                     |
| `returnDate`         | `string`         | ISO date recommended                     |
| `daysUntilDeparture` | `number`         | Relative to feed generation time         |
| `currentPrice`       | `number`         | Price per person                         |
| `offerUrl`           | `string`         | Direct offer URL                         |
| `csvFileName`        | `string`         | Link back to source CSV                  |
| `isDeal`             | `boolean`        | Whether this record is also a deal       |
| `dealReason`         | `string \| null` | Highlight reason                         |
| `dealScore`          | `number \| null` | Existing score when available            |

Optional but useful:

| Field            | Type             | Notes                            |
| ---------------- | ---------------- | -------------------------------- |
| `tripLengthDays` | `number`         | Can power a small duration badge |
| `previousPrice`  | `number \| null` | Enables price drop messaging     |
| `generatedAt`    | `string`         | Feed metadata                    |

## Record Selection Rules

### Window Rules

- Default window: departures within the next 14 days
- Expanded window: departures within the next 30 days
- `daysUntilDeparture` should be computed relative to the feed generation timestamp for consistency

### Deduplication

Use one visible record per unique combination of:

- `csvFileName`
- `dateRange`
- `persons`

If the same trip term appears in multiple deal categories, keep a single Last Minute record and preserve the strongest deal metadata.

### Deal Resolution

If a record matches multiple deal sections, recommended priority is:

1. `allTimeLow`
2. `priceDrop`
3. `lowestPerTrip`
4. `combined`

Alternative acceptable implementation:

- keep the match with the highest `dealScore`

## UI Structure

### Page Layout

1. Header
2. Intro text
3. Tabs: `1 person` / `2 persons`
4. Filter row or filter panel
5. Date-grouped result sections

### Grouping

- Use visible date sections
- Each section header represents a single departure date
- Under each date, render a responsive grid of trip cards

### Card Content

Each card should show:

- departure and return dates
- current price per person
- country
- trip name
- departure airport
- action to open the offer
- action to open the matching Explorer context

When `isDeal = true`, the card should also show:

- strong visual highlight
- deal badge
- reason badge

## Navigation Integration

### New Route

- Add `/last-minute` route in the app router

### Cross-Linking

- Main Deals page should expose navigation to Last Minute
- Each Last Minute card should allow navigation to Explorer with prefilled query parameters when possible

## Implementation Outline

### Backend / Data Generation

Suggested location:

- extend `generate_deals.py`

Implementation direction:

1. Reuse existing future-term collection logic
2. Build a Last Minute candidate list from all future terms
3. Mark records that also qualify as deals
4. Write `data/last-minute.json`

### Frontend

Suggested areas:

- new hook for loading Last Minute feed
- new page component for `/last-minute`
- reusable filtering/grouping helpers
- new translation keys in PL and EN locales

## Acceptance Criteria

- [ ] RDisplay has a dedicated `/last-minute` route
- [ ] The default view shows departures within the next 14 days
- [ ] A single action expands the window to 30 days
- [ ] Results are separated into `1 person` and `2 persons` tabs
- [ ] Results are grouped by departure date
- [ ] Trips are sorted by nearest departure first
- [ ] Price is shown per person
- [ ] Trips that are also deals are strongly highlighted
- [ ] Empty state offers expansion from 14 to 30 days
- [ ] Last Minute data comes from a dedicated generated feed, not browser-side parsing of all CSV files

## Notes

- This task records the approved concept and is intended as the implementation spec for the Last Minute feature.
- The concept was agreed before coding; implementation may be split into separate code, review, and testing documents if needed.
