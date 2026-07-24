# SCIIP_OS v9 Sprint 27 — Production Baseline Replay Foundation

Creates the immutable June 4, 2026 AIR availability baseline immediately before the first June 5 SuperSheet.

## Safety model
- Native `.xlsx` reader; no `xlsx` npm dependency.
- `.xls` and `.xlsm` are not accepted.
- XLSX is authoritative listing evidence; KMZ is spatial evidence only.
- Baseline generation creates no market events.
- Missing listings become removal candidates during later replay; disappearance alone never proves a lease or sale.
- Canonical writes and commits remain disabled.

## Run
```bash
npm run run:v9:sprint27:production-baseline -- \
  --xlsx /path/to/baseline_xlsx \
  --kmz /path/to/baseline_kmz \
  --date 2026-06-04 \
  --output reports/v9-sprint27-production-baseline.json
```
