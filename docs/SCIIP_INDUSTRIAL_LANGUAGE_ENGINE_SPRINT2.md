# SCIIP Industrial Language Engine — Sprint 2

## Purpose

Sprint 2 introduces the deterministic Industrial Phrase Tokenizer. It converts source evidence into immutable lexical and compound tokens while preserving exact source spans.

## Supported token classes

- NUMBER
- UNIT
- WORD
- SYMBOL
- PERCENT
- VOLTAGE
- PHASE
- DIMENSION
- AREA

## Governance

The tokenizer is diagnostic-only. It performs no production writes, does not commit parser fields, and does not replace the existing parser. Its output is designed for the future phrase builder and semantic ownership engine.

## Determinism and explainability

Every token includes raw evidence, normalized evidence, value, unit, and source span. Repeated tokenization of identical input yields identical output.
