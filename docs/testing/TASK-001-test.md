# TASK-001 Test Plan & Results

## Automated Checks

| Check | Result |
|---|---|
| `npm run build` (tsc -b + vite build) | PASS |
| ESLint on changed files | PASS (exit 0) |
| Pre-existing lint errors in `dateUtils.ts` | 5 errors â€” pre-existing, out of scope |

## Manual Verification Steps

Start dev server: `cd RDisplay && npm run dev`

### Fix #1 â€” Grid columns stable on zoom
- Open Deals view or Explorer deals section
- Enable DevTools, zoom to 125%, 150%
- **Expected**: grid cards fill row cleanly without orphaned single card; no sudden gap

### Fix #2 â€” Table column alignment
- Open Explorer â†’ select a full trip â†’ open price table
- **Expected**: "Daty wycieczki" and "Aktualna cena" columns are center-aligned, matching all other price columns

### Fix #3 â€” AppBar title without " â€“ RScraper"
- Open Explorer view
- **Expected**: AppBar header shows e.g. "Indie â€¢ Kolory Pustynnych Miast â€¢ Warszawa Chopin â€¢ 2 osoby" without " â€“ RScraper" suffix
- Browser tab title: should still show " â€“ RScraper" suffix

### Fix #4 â€” Persons filter first
- Open Explorer view
- **Expected**: "Liczba osÃ³b" selector appears at the top of the filter panel, before Country/Trip/Airport
- Selector should be enabled without selecting anything else first

### Fix #5 â€” Better default title
- Open Explorer with no filters selected
- **Expected**: Header/title does NOT say "Wizualizacja danych podrÃ³Å¼y"
- Should say "Przewodnik po cenach podrÃ³Å¼y" (PL) or "Travel Price Guide" (EN)

### Fix #6 â€” Column sorting in DataTable
- Open Explorer â†’ select a full trip â†’ open price table
- Click "Aktualna cena" header â†’ rows sort ascending (â†‘ shown)
- Click again â†’ descending (â†“ shown)
- Click third time â†’ original order (no arrow)
- Click a historical timestamp column â†’ sorts by that column (nulls last)
- Switch to different trip â†’ sort state resets

### Fix #7 â€” Country flag on DealCard
- Open Deals page
- **Expected**: each card has a small flag chip in top-left corner (í·ªí·¸ í·®í·³ í·¨í·³ í·¹í·³ í·±í·°)
- Same in Explorer section with matching deals

## Manual Testing Required

Yes â€” visual/interactive checks require browser.

## Preconditions

- Dev server running: `cd c:/Filip/SW/RScraper/RDisplay && npm run dev`
- Data files present in `c:/Filip/SW/RScraper/data/`

## Run Commands

```bash
cd c:/Filip/SW/RScraper/RDisplay && npm run dev
```

## Result

Automated: PASS
Manual: pending human verification
