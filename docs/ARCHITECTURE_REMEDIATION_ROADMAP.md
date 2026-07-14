# SCIIP_OS Architecture Remediation Roadmap

## Phase 1 — Governance and regression control
- Commit the complete working tree and tag a recoverable baseline.
- Generate machine-readable architecture reports.
- Block new syntax errors, placeholders, unbounded test ranges, and collision regressions.
- Add GitHub Actions using Node 20.

## Phase 2 — Collision removal
- Resolve duplicate processor numbers first.
- Consolidate duplicate `SCIIP_TEST` definitions to v4.2.
- Namespace shared helpers and remove duplicate global functions.
- Run strict architecture gate when zero collisions remain.

## Phase 3 — Runtime and concurrency compliance
- Migrate production processors to `SCIIP_RUNTIME_PROCESSOR_BASE`.
- Add `LockService` around business-key check plus commit.
- Add transaction rollback/failure-injection tests.

## Phase 4 — Real storage adapter
- Implement `SCIIP_STORAGE_ADAPTER` with provider interface, durable ledger, query, archive, restore, and migration operations.
- Replace planning-only storage wrappers with targeted processors backed by fixtures and integration tests.

## Phase 5 — UI and production
- Create read models and API contracts for UI.
- Add environment configuration, deployment approvals, monitoring, audit logs, and release tags.
- Promote only after live-input, duplicate-rerun, concurrency, rollback, and recovery certification.
