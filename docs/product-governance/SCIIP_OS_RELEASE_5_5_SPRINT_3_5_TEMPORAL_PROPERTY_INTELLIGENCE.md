# SCIIP_OS Release 5.5 Sprint 3.5 — Temporal Property Intelligence

Version 196.5.0 converts the certified AIR CRE observation corpus into governed, append-only property timelines and market events.

## Governance
- Canonical address/city/ZIP identity with deterministic IDs
- Source document, page, row, and fingerprint retained on every event
- Removed listings are classified as `NO_LONGER_OBSERVED`, never silently promoted to leased or sold
- Field changes preserve before/after values
- Event IDs are deterministic and replay safe

## Outputs
- `reports/supersheets/SCIIP_AIR_CRE_TEMPORAL_INTELLIGENCE.json`
- Property Command Center `Temporal Intelligence` workspace

## Supported events
`FIRST_OBSERVED`, `NEW_AVAILABILITY`, `NO_LONGER_OBSERVED`, `RATE_REDUCED`, `RATE_INCREASED`, `RATE_CHANGED`, `AVAILABLE_SF_CHANGED`, `STATUS_CHANGED`, `POWER_CHANGED`, and `PROPERTY_UPDATED`.
