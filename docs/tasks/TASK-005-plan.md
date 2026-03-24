# TASK-005 Plan

## Goal

Fix two RDisplay regressions introduced around link-based navigation:

1. Deal and last-minute cards should not show a partial hover highlight.
2. Explorer should keep rendering person-count options even when CSV file discovery is unavailable or delayed.

## Scope

- RDisplay/src/components/DealsPage/DealCard.tsx
- RDisplay/src/components/DealsPage/DealsPage.tsx
- RDisplay/src/components/ExplorerPage.tsx
- RDisplay/src/components/Layout/AppLayout.tsx
- RDisplay/src/components/LastMinutePage/LastMinuteCard.tsx
- RDisplay/src/components/LastMinutePage/LastMinutePage.tsx
- RDisplay/src/hooks/useFilters.ts
- Supporting docs for review and testing

## Plan

1. Adjust card link styling so the card keeps full-card hover behavior without the partial CardActionArea overlay.
2. Rework person-count option derivation in useFilters:
    - Use sources.json defaults or trip overrides as the baseline.
    - Narrow to actual CSV-discovered person counts only when discovery data is available for the selected trip and airport.
    - Reset invalid selected person counts when the available set changes.
3. Run frontend build validation.
4. Submit the staged candidate to code review subagent, apply fixes if needed, then prepare test and completion notes.
