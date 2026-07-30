# SCIIP Industrial Language Engine — Sprint 5

## Governed Industrial Property Model Builder

Sprint 5 introduces the canonical model assembly layer for the SCIIP Industrial Language Engine (ILE).

### Purpose

The Property Model Builder converts independently interpreted industrial concepts into one governed, deterministic representation of an industrial asset.

```text
SuperSheet
  → Tokenizer
  → Phrase Builder
  → Semantic Interpreter
  → Property Model Builder
  → Existing SCIIP Evidence and Confidence Pipeline
```

### Operating posture

- Diagnostic-only
- Zero production writes
- Existing parser remains authoritative
- Immutable canonical output
- Deterministic duplicate resolution
- Fail-closed validation available

### Canonical sections

The model supports:

- Identity
- Building, office, warehouse, land, and yard areas
- Clear height and column spacing
- Electrical service
- Dock-high and grade-level loading
- Truck court
- Auto and trailer parking
- ESFR and sprinkler systems
- HVAC, rail, cranes, solar, and battery storage

### Duplicate resolution

When multiple interpretations map to the same concept, the builder selects the candidate using:

1. Highest confidence
2. Widest evidence span
3. Earliest source location
4. Stable lexical ordering

All discarded candidates remain available in the conflict ledger.

### Unit governance

- Areas normalize to square feet
- Lengths normalize to feet
- Counts normalize to whole non-negative values
- Electrical service normalizes to amps
- Presence concepts normalize to booleans

### Validation

The builder supports:

- Required concept validation
- Optional fail-closed behavior
- Industrial plausibility warnings
- Stable evidence and concept ordering

### Public API

```javascript
const {
  buildPropertyModel,
  validateModel,
  normalizeArea,
  normalizeLength,
  normalizeCount
} = require("./sciip-property-model-builder");
```

### Certification

Run:

```bash
node tools/tests/ile/sciip-property-model-builder.test.js
```

Expected result:

```json
{
  "status": "PASSED",
  "testsRun": 33,
  "productionWrites": 0,
  "commitEnabled": false,
  "existingParserAuthoritative": true
}
```
