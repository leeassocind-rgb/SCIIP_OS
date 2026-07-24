# SCIIP_OS v8.1 Native SuperSheet Parser

This release replaces the `pdftotext`/Poppler requirement with the JavaScript `pdf-parse` library.

## Capabilities

- Native Node.js PDF text extraction
- AIR-CRE edition-date discovery and chronological ordering
- SHA-256 source evidence fingerprints
- Address normalization and stable listing candidate IDs
- Candidate additions, removals, and field changes between editions
- Append-only dry-run output with production commit disabled

## Governance boundary

All detected records and transitions remain **candidates** until steward review. The parser performs no production writes and does not enable governed commit.
