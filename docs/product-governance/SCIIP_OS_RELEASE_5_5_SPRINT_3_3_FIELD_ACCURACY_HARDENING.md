# Release 5.5 Sprint 3.3 — AIR CRE Field Accuracy Hardening

The connector now uses evidence-specific parsers for rate structure and loading configuration. Missing optional values are not promoted to review unless source evidence indicates a malformed or unparsed value. Land ingestion remains disabled.

Certification gates:

- 100% critical completeness on the regression set
- zero critical review items
- zero land records ingested
- zero rate-type false-positive reviews on the regression set
- zero paired loading false positives on the regression set
- source and column evidence preserved
- deterministic, duplicate-safe output
