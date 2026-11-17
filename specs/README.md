# Specs

Living specifications: what the system does **now**. One file per capability, `specs/<capability>.md`.
They are the reference for builders, verifiers and reviewers, and are checked for drift against code and tests
(`factory spec check`). Full conventions: factory spec 06 §2 (plugin skill `factory:spec`).

## File format

```md
---
capability: users                 # = file stem
title: User accounts
code_id: USERS                    # optional; default upper(stem) without '-'
code: ["src/routes/users.ts"]     # globs of implementing code
tests: ["test/users*.test.ts"]    # globs of covering tests
---
# User accounts

One-paragraph purpose.

## Requirements

### REQ-USERS-001: Fetch user by id
The system SHALL return the user as JSON when `GET /users/:id` matches an existing user.

#### Scenario: existing user
- WHEN a client requests `GET /users/42` and user 42 exists
- THEN the response is 200 with the user's public fields

## Retired
- REQ-USERS-003 — removed by T-…: reason
```

## Rules

- One `### REQ-<CODE>-<nnn>: <title>` heading per requirement, only under `## Requirements`. Use SHALL statements and
  `#### Scenario:` blocks with `- WHEN` / `- THEN` / `- AND` bullets.
- IDs are never reused. Removed IDs move to `## Retired`. New id = highest existing (including retired) + 1.
- Tests name the requirement they cover (`it('REQ-USERS-002 returns 404', …)` or a `# REQ-USERS-002` comment).
- Write exact paths and symbols in backticks; drift checks verify they exist.

## Changing behaviour: spec deltas

Task branches never edit `specs/<capability>.md` directly. They add a delta
`specs/changes/<task-id>/<capability>.md` with `## ADDED Requirements`, `## MODIFIED Requirements`,
`## REMOVED Requirements` (each with `Reason:`) and `## RENAMED Requirements` sections. The PR step applies the
delta to the spec deterministically. Bug fixes that restore specified behaviour need no delta.
