# Release 5.5 Sprint 2 — AIR CRE Certified Connector

Version 190.0.0. Repository-driven implementation validated against representative AIR CRE SuperSheets dated June 10, July 10, and July 28, 2026.

The connector uses native positional extraction through `pdftotext -layout`, deterministic document and property identity, page/record evidence, field confidence, immutable outputs, and blocked silent promotion. The Command Center retains its permanent daily PDF drop box and can import governed extraction JSON.

## Daily command

```bash
npm run supersheets:aircre:extract -- --input ~/Desktop/SCIIP_PRODUCTION_SUPERSHEETS --output reports/supersheets/SCIIP_AIR_CRE_CERTIFIED_EXTRACTION.json
```
