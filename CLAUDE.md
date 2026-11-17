# pulsar

<!-- Table of contents for agents and humans. Keep it under ~100 lines: point to where things live
     instead of explaining them here. `/factory:setup` fills in the TODOs with you. -->

## What this is
TODO: one paragraph — what the product does and for whom.

## Map
| Where | What |
|---|---|
| `Android/` | TODO |
| `docs/` | documentation |
| `flutter/` | TODO |
| `iOS/` | TODO |
| `kmp/` | TODO |
| `pulsar-private/` | TODO |
| `react-native/` | TODO |
| `tools/` | TODO |
| `web/` | TODO |
| `specs/` | living specs, one file per capability (see `specs/README.md`) |
| `.factory/` | factory config, verification profile, merge policy, rules, knowledge |

## Commands
- Tests (jest): `npx jest`
- Lint (eslint): `npx eslint . --max-warnings=0`
- Full gate (what "done" means): `factory check`

## Conventions
TODO: the 3–5 conventions a newcomer gets wrong (error handling, naming, module boundaries).
Path-specific rules live in `.factory/rules/` (loaded automatically for matching files).

## Deeper docs
- Specs: `specs/<capability>.md`
- Knowledge (past gotchas and fixes): `factory kb search "<topic>"`
- Architecture / ADRs: TODO (e.g. `docs/architecture.md`)

<!-- factory:start -->
## Factory
This repo is run with the factory framework (`.factory/`). Work items live on the board: `factory task show <id>`.
- Done means `factory check` prints `GATE: PASS`. Never weaken tests, lint, CI or coverage to get there.
- Search knowledge before investigating: `factory kb search "<error or topic>"`.
- `specs/<capability>.md` describe current behaviour; behaviour changes need a delta in `specs/changes/<task-id>/`.
- Never edit `.factory/policy/` or `.factory/verification/`.
- Blocked on a product decision: `factory task needs-human <id> --question "..."` and stop.
- Out-of-scope work you notice: `factory task create --title "..." --type chore` instead of doing it.
<!-- factory:end -->
