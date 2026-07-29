# SCIIP_OS Release 1 — Sprint 4

## Governed SuperSheet Ingestion

Sprint 4 makes the Property Command Center data-driven through a broker-controlled ingestion workspace.

### Delivered

- Drag-and-drop ingestion for XLSX, CSV, TSV, and JSON SuperSheets.
- Canonical property schema mapping with aliases for common industrial real estate headers.
- Row-level normalization, validation, warnings, and rejection controls.
- Duplicate-candidate detection using stable property business keys.
- Explicit promotion of accepted and warning rows; rejected rows cannot promote.
- Duplicate-safe browser ingestion ledger keyed by deterministic batch identity.
- Validation preview for up to 250 rows while the full batch is evaluated.
- Eight governed certification tests.

### Governance boundaries

- Uploading never mutates canonical SCIIP_OS records.
- Promotion requires an explicit broker action.
- Rejected rows are excluded from promotion.
- Warning rows remain visible and traceable.
- Exact replay of a promoted batch is blocked by deterministic ingestion identity.
- The local ledger is an application-layer audit record; server-side permanent history is a later production integration step.

### Certification

```bash
npm run property-command-center:certify:sprint4
```
