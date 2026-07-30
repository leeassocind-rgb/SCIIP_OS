# SCIIP Industrial Language Engine — Sprint 3

## Governed Phrase Builder

Sprint 3 converts deterministic Sprint 2 tokens into governed industrial phrases while preserving exact source evidence. It remains diagnostic-only and does not alter the production parser.

### Pipeline

`Source text → Phrase Tokenizer → Phrase Builder → governed phrase evidence`

### Supported phrase families

Electrical specifications, clear height, dock-high and grade-level counts, truck-court depth, auto and trailer parking, building and land area, column spacing, and fire-suppression systems.

### Governance guarantees

- Deterministic phrase assembly
- Exact source-span preservation
- Non-overlapping phrase arbitration
- Deeply immutable output
- Zero production writes
- Existing parser remains authoritative

Sprint 4 will map these phrases to SILS ontology concepts.
