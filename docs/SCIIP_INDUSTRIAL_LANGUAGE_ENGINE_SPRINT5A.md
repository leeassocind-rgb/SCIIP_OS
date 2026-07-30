# SCIIP Industrial Language Engine — Sprint 5A

## End-to-End Pipeline Orchestration and Contract Certification

Sprint 5A certifies the first complete deterministic execution path across the five Industrial Language Engine layers.

```text
Raw industrial text
  → SILS Ontology
  → Phrase Tokenizer
  → Governed Phrase Builder
  → Semantic Interpreter
  → Property Model Builder
  → Canonical Industrial Property Model
```

## Purpose

The sprint does not add production behavior. It proves that the independent contracts created in Sprints 1–5 can operate together as one governed system.

The pipeline also provides a narrow compatibility adapter between the Sprint 4 Semantic Interpreter output and the Sprint 5 Property Model Builder input. No prior module is modified.

## Runtime posture

- Diagnostic-only
- Zero production writes
- Commit disabled
- Existing parser remains authoritative
- Deterministic and deeply immutable output
- Evidence and source spans preserved

## Contract gates

The orchestrator records four explicit contracts:

1. `TEXT_TO_TOKENS`
2. `TOKENS_TO_PHRASES`
3. `PHRASES_TO_INTERPRETATIONS`
4. `INTERPRETATIONS_TO_PROPERTY_MODEL`

Each contract records input count, output count, validity, and diagnostic notes.

## Certified scenarios

The certification covers:

- Standard warehouse specifications
- Building and land areas
- Clear height
- Dock-high and grade-level loading
- Electrical service
- Truck court
- Auto and trailer parking
- ESFR
- Column spacing
- Mixed area units
- Duplicate concepts
- Required-concept validation
- Fail-closed validation
- Empty and unknown text
- Context propagation
- Stable serialization
- Deep immutability

## Public API

```javascript
const {
  createDefaultILEPipeline
} = require("./sciip-ile-pipeline");

const pipeline = createDefaultILEPipeline();

const result = pipeline.run(
  "664,859 SF building, 42' clear, 82 dock high doors, 4,000 amps"
);
```

## Certification command

```bash
node tools/tests/ile/sciip-ile-end-to-end-certification.test.js
```

Sprint 5A remains a pre-integration certification layer. It does not replace or alter the existing SCIIP parser.
