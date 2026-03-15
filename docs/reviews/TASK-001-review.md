# Code Review: TASK-001 — Explorer & Deals UX Fixes

**Status:** NEEDS_REVISION

**Summary:** All 7 fixes are implemented and functionally correct, but the sort state in `DataTable.tsx` is not cleared when the user switches to a different CSV file, causing a misleading stale sort indicator. Three additional minor issues are present.

---

## Staging Status

All 8 code files are staged and confirmed via `git diff --cached --stat`.  
`docs/tasks/TASK-001-plan.md` is **not staged** (untracked `docs/` directory). Per project guardrails, task docs must be staged alongside code.  
`agents-setup.diff` is untracked — not in the staged candidate. No scope contamination.

---

## Issues Found

### [MAJOR] DataTable.tsx — sort state not reset on data change

**Location:** `RDisplay/src/components/DataTable/DataTable.tsx` — the `useEffect` that responds to `data` changes (existing effect, `[data]` dependency).

**Problem:** When the user selects a different CSV file, `data` changes and the effect correctly resets `expandedYears`. It does NOT reset `sortColumn` or `sortDirection`. If the active sort column was a timestamp key from the previous dataset, that key will not exist in the new dataset's `priceHistory`. `sortTerms` will treat both `aVal` and `bVal` as `null` for every row, so no sort happens — but the column header still shows an arrow indicator, falsely suggesting the data is ordered. This is a reliability defect that silently misleads users.

**Required fix:**

```tsx
React.useEffect(() => {
    if (data?.yearGroups) {
        const defaultExpanded = data.yearGroups
            .filter((group) => group.isExpanded)
            .map((group) => group.year);
        setExpandedYears(new Set(defaultExpanded));
        setSortColumn(null); // ADD
        setSortDirection("asc"); // ADD
    }
}, [data]);
```

---

### [MINOR] FilterPanel.tsx — filter summary text order is stale

**Location:** `RDisplay/src/components/FilterPanel/FilterPanel.tsx` — the "Selected filters" summary box at the bottom.

**Problem:** The summary still renders `country → trip → airport → persons`, while the UI now shows them in `persons → country → trip → airport` order. The inconsistency is visible on initial render before any filter is selected.

**Required fix:** Update the summary line to reflect the new display order:

```tsx
{filters.persons ? t('filter.personsCount', { count: filters.persons }) : t('filter.noPersons')} → {filters.country || t('filter.noCountry')} → {filters.trip || t('filter.noTrip')} → {filters.departureAirport || t('filter.noAirport')}
```

---

### [MINOR] DealCard.tsx — country flag Chip has no aria-label

**Location:** `RDisplay/src/components/DealsPage/DealCard.tsx` — the new flag Chip.

**Problem:** The Chip's `label` is a raw emoji character string (e.g., `🇪🇸`). Screen readers will announce the Unicode sequences verbatim. The fallback path (`country.slice(0, 2).toUpperCase()`) is meaningfully readable but the emoji path is not.

**Required fix:** Add `aria-label={deal.country}` to the flag Chip:

```tsx
<Chip
  label={getCountryFlag(deal.country)}
  aria-label={deal.country}
  size="small"
  sx={{ ... }}
/>
```

---

### [MINOR] DataTable.tsx — `docs/tasks/TASK-001-plan.md` not staged

**Location:** Staging candidate.

**Problem:** `docs/tasks/TASK-001-plan.md` exists in the working tree (untracked `docs/` directory) but is not staged. The project guardrail requires task docs to be staged alongside code before commit handoff.

**Required fix:** `git add docs/tasks/TASK-001-plan.md`

---

## Passing Items

- **Fix #1 (ExpandableDealGrid):** `repeat(${initialCount}, minmax(0, 1fr))` is correct. Breakpoint-driven `initialCount` and `effectiveInitialCount` logic is clean.
- **Fix #2 (table alignment):** `textAlign: 'center'` added to both `dateRange` and `currentPrice` header and data cells. Covers all intended columns.
- **Fix #3 (ExplorerPage title split):** `generateDisplayTitle` (no suffix) passed to `AppLayout`; `currentDocumentTitle` with suffix used only in `document.title`. Correct.
- **Fix #4 (persons independence):** `getAvailablePersonCounts` removed; inline `Set<number>` across all CSV entries is correct. `updateFilter` no longer resets `persons` on country/trip/airport changes. PersonSelector enabled when `availableOptions.persons.length > 0`. Cascade is correct.
- **Fix #5 (i18n titles):** pl.json → `"Przewodnik po cenach podróży"`, en.json → `"Travel Price Guide"`. Both match plan exactly.
- **Fix #6 (sorting logic):** asc → desc → null cycle is correct. Null-last handling is correct (`null` pushed below any real value). Timestamp column sort via `priceHistory.find` with `?? null` is correct.
- **Fix #7 (flag chip):** `countryFlags` mapping covers known countries. Two-char uppercase fallback is safe. Chip positioned `top: -10, left: 12` mirrors the score badge pattern. No `dangerouslySetInnerHTML`, no XSS vectors.
- **TypeScript:** `TripTerm` imported cleanly. `getAvailablePersonCounts` import removed. No visible implicit `any`.
- **Security:** No raw HTML injection. `window.open` uses `noopener,noreferrer`. All user data flows through MUI components.

---

## Recommendations

- Address the MAJOR issue before committing — it's a one-line fix in an existing effect.
- The two MINOR code issues (filter summary order, aria-label) are low-risk but fix them in the same pass to keep the commit clean.
- Stage `docs/tasks/TASK-001-plan.md` before commit.

---

**Review Report Path:** `docs/reviews/TASK-001-review.md`

**Commit Readiness:** not ready

**Candidate Scope Match:** matched (all 8 expected files present in staged diff)

**Rejection Type:** Logic/Quality Rejection

**Next Steps:** Revise — fix the `useEffect` sort reset (MAJOR), update filter summary order (MINOR), add `aria-label` to flag Chip (MINOR), stage `docs/tasks/TASK-001-plan.md`
