# .factory

Configuration and state of the factory framework for this repository.

| Path | What | Who edits |
|---|---|---|
| `config.yaml` | project, orchestrator, budgets, agents, git, review, routines | humans |
| `verification/profile.yaml` | what `factory check` runs, path classes, diff-guard rules | humans only (agents are denied) |
| `verification/checks/*.sh` | custom checks (print one JSON result line) | humans only |
| `policy/merge.yaml` | merge router policy (read from the base branch) | humans only |
| `toolsets.yaml` | skills, MCP servers, permissions per agent role | humans |
| `strategies/`, `prompts/` | overrides of built-in strategies and prompt templates (same name shadows) | humans, proposals |
| `rules/*.md` | path-scoped rules for agents (exposed as `.claude/rules/factory`) | proposals, compound step, humans |
| `knowledge/*.md` | notes on past problems, searchable with `factory kb search` | compound step, `factory kb add` |
| `skills/<name>/SKILL.md` | repo skills (linked into `.claude/skills/`) | humans |
| `features.yaml` | feature catalog generated from `specs/` (`factory spec features --write`) | generated |
| `spec-baseline.json` | accepted spec-drift findings | `factory spec check --update-baseline` |
| `logs/` | merge decisions and verifier/reviewer verdicts (committed) | the framework |
| `learning/` | signals, ratings, improvement proposals (committed) | the framework; humans apply/reject proposals |
| `board/`, `runs/`, `state/` | tasks, run artifacts, indexes, worktrees, locks (gitignored) | the framework |

## Rules (`rules/<id>.md`)

Rules are loaded by Claude Code for files matching `paths`. Keep each under 50 lines and at most 40 files.
Every rule says where it came from and when it can be retired. Example: `rules/example.md.sample`.

## Knowledge notes (`knowledge/<id>.md`)

One problem per note, ≤ 150 lines, with `## Summary` and `## Fix` sections and verbatim `error_signatures`
so an agent hitting the same error finds it. Example: `knowledge/example.md.sample`.
Notes are normally written by the compound step at the end of a task, or with `factory kb add`.
