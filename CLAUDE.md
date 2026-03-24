# Claude Instructions — RScraper

## Agent Location

The canonical custom-agent location for this repository is `.claude/agents/`.

Available agents:

- `.claude/agents/orchestrator.agent.md` — main orchestration agent, waits for human approval at key gates
- `.claude/agents/autonomous-orchestrator.agent.md` — fully autonomous variant, no approval gates, runs commits
- `.claude/agents/ninja.agent.md` — solo autonomous executor that plans, implements, tests, and commits itself while delegating review only
- `.claude/agents/planning-subagent.agent.md`
- `.claude/agents/implement-subagent.agent.md`
- `.claude/agents/code-review-subagent.agent.md`
- `.claude/agents/testing-subagent.agent.md`

## Workflow Artifacts

- `docs/knowledge/lessons-learned.md` stores reusable findings.
- `docs/tasks/TASK-###-plan.md` and `docs/tasks/TASK-###-complete.md` store task lifecycle artifacts.
- `docs/reviews/TASK-###-review.md` stores review reports.
- `docs/testing/TASK-###-test.md` stores test plans, manual verification steps, and results.
- `docs/reviews/TEMPLATE-review.md` and `docs/testing/TEMPLATE-test.md` are reusable report templates.

## Language Rules

- Communicate with the human in Polish.
- Keep code, comments, documentation, and commit messages in English.

## Project Guardrails

**Python (RScraper/):**

- Target Python 3.8+; use `requests` and `beautifulsoup4` only — no new scraping dependencies without review.
- Data output goes to CSV files in `data/`; never modify existing CSV structure without review.
- Configuration must stay in `sources.json`; no hardcoded URLs or trip data.

**TypeScript / React (RDisplay/):**

- TypeScript strict; no implicit `any`.
- Functional components and hooks only.
- Material-UI (MUI) v5 components and theme; no inline style overrides that bypass the theme.

**General:**

- Check `docs/knowledge/lessons-learned.md` before work in a known area and append reusable lessons after non-trivial fixes.
- Use task IDs in the form `TASK-001`, `TASK-002`, ... for task-scoped docs.
- Keep fixes, re-review, re-testing, and documentation updates under the same `TASK-###` as the original implementation thread.
- Before any commit handoff, ensure the full task candidate is cached: code + updated docs for the same `TASK-###`, with no unstaged leftovers for that task.
- `orchestrator` never runs `git commit`; `autonomous-orchestrator` may commit only after passing review, completing required testing, and only when no manual test stop is still pending; `Ninja` is an explicit exception and may commit autonomously after passing its mandatory review and testing loop.

## Temporary Files Policy

- Never use `/tmp` for agent-created temporary files in this repository workflow.
- Use `./tmp/` inside the workspace.
- Create the folder when needed (`mkdir -p ./tmp`) and clean temporary artifacts after use.
- If a tool reports write restrictions, retry with a workspace-local `./tmp/` path.
