# Lessons Learned

All agents must check this file before starting work in a known problem area.
All agents must append new findings after solving non-trivial, novel, or recurring issues.

## Format

```md
### YYYY-MM-DD — Short Title

Task: TASK-###
Context: Component, feature area, or workflow
Problem: What went wrong or was tricky
Solution: What worked
Discovered By: Agent name
```

## Entries

### 2026-03-24 — Align Autonomous Agents With Real Tooling

Task: TASK-003
Context: Agent configuration and orchestration prompts
Problem: Autonomous agent prompts can silently become misleading when they assume helper agents or runtime checks that the repository does not actually provide.
Solution: When porting an agent from another project, rewrite its testing and workflow steps to match the subagents and validation surfaces that exist in the target repository instead of copying assumptions verbatim.
Discovered By: GitHub Copilot

### 2026-03-24 — Keep Test Prompts And Templates Stack-Specific

Task: TASK-004
Context: Testing subagent and workflow artifacts
Problem: Generic or copied test prompts can drift into wrong assumptions about the stack, which makes generated test reports and run commands misleading.
Solution: Whenever a testing subagent is added or updated, align both the agent prompt and `docs/testing/TEMPLATE-test.md` with the repository's actual frontend and backend commands.
Discovered By: GitHub Copilot
