# SCIIP_OS Release 5.5 Sprint 3.2 — AIR CRE Land Exclusion Gate

## Policy
AIR CRE land listings remain visible in immutable source reconciliation but are not ingested into the industrial property intelligence model.

## Governed decisions
- `INDUSTRIAL` → eligible for ingestion.
- `LAND` → `EXCLUDED` with reason `LAND_INGESTION_DISABLED`.
- `UNKNOWN` → blocked from ingestion and retained for review.

## Certification gates
- Land records ingested: 0.
- Unknown records silently ingested: 0.
- Excluded land records retain source document, page, record number, raw evidence, and section classification.
- Industrial critical-field completeness remains 100% in the regression set.
