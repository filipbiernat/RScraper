# TASK-001 Plan — Explorer & Deals UX Fixes (7 feedback items)

## Scope

Apply all seven user-reported UX fixes across the RDisplay web interface.

## Affected Files

| File | Changes |
|---|---|
| `RDisplay/src/components/DealsPage/ExpandableDealGrid.tsx` | Fix #1: force grid columns to match `initialCount` |
| `RDisplay/src/components/DataTable/DataTable.tsx` | Fix #2: align first two columns; Fix #6: add column sorting |
| `RDisplay/src/components/ExplorerPage.tsx` | Fix #3: separate display title from document.title |
| `RDisplay/src/components/FilterPanel/FilterPanel.tsx` | Fix #4: move PersonSelector to top |
| `RDisplay/src/hooks/useFilters.ts` | Fix #4: make persons available independently |
| `RDisplay/src/i18n/pl.json` | Fix #5: better default title (PL) |
| `RDisplay/src/i18n/en.json` | Fix #5: better default title (EN) |
| `RDisplay/src/components/DealsPage/DealCard.tsx` | Fix #7: add country flag chip top-left |

## Fix Details

### Fix #1 — Grid columns vs. initialCount mismatch
- **Root cause**: `repeat(auto-fill, minmax(280px, 1fr))` calculates columns from actual pixel width; `initialCount` uses MUI breakpoints. These diverge on zoom.
- **Solution**: Change `gridTemplateColumns` to `repeat(${initialCount}, minmax(0, 1fr))`, forcing exact column count to match visible card count.

### Fix #2 — Table alignment inconsistency
- **Solution**: Add `textAlign: 'center'` to the "Trip Dates" and "Current Price" header cells, and to the `dateRange` and `currentPrice` data cells in the row renderer.

### Fix #3 — Remove " – RScraper" from AppBar header
- **Solution**: In `ExplorerPage.tsx`, split title into `displayTitle` (for AppBar, no suffix) and `documentTitle` (for `document.title`, with suffix). Pass `displayTitle` to `AppLayout`.

### Fix #4 — Person selector first
- **Solution**:
  - In `FilterPanel.tsx`: move `<PersonSelector>` before `<CountrySelector>`.
  - In `useFilters.ts`: compute available persons from all CSV files (not country+trip+airport-filtered), disable person dependency on airport; adjust auto-select and reset cascade so changing `persons` does not reset other filters but changing `country/trip/airport` does not reset persons.
  - PersonSelector enabled as long as there are available options (not locked behind airport).
  - Available persons: all unique person counts seen in any CSV file (from `csvFileEntries`).

### Fix #5 — Better default title
- Change `app.defaultTitle` in `pl.json`: `"Przewodnik po cenach podróży"` 
- Change `app.defaultTitle` in `en.json`: `"Travel Price Guide"`

### Fix #6 — Column sorting in DataTable
- Add `sortColumn: string | null` and `sortDirection: 'asc' | 'desc'` state.
- Clicking any column header toggles sort: first click = asc, second = desc, third = back to unsorted (null).
- Sort applies to all visible rows across all year groups.
- Add `↑` / `↓` visual indicator to active sort column header.
- Sortable columns: `dateRange` (string), `currentPrice` (number), and each timestamp column (number, with nulls last).

### Fix #7 — Country flag on DealCard
- Add a country→flag emoji mapping for known countries (Hiszapania, Indie, Chiny, Tunezja, Sri Lanka).
- Render a small `Chip` in the top-left corner of `DealCard` (mirroring the score badge in top-right).
- Fallback: if country not in map, show first two uppercase letters.

## Checks After Implementation

```bash
cd RDisplay && npm run build
```

## Acceptance Criteria

- [ ] Explorer deals grid never shows a dangling last card due to zoom
- [ ] All DataTable columns consistently center-aligned
- [ ] AppBar shows only trip/country info (no " – RScraper")
- [ ] PersonSelector is the first filter shown and enabled independently
- [ ] Default title no longer says "Wizualizacja danych podróży"
- [ ] Clicking column headers in DataTable sorts rows; arrow indicator shown
- [ ] DealCard shows country flag chip in top-left corner
