# SCIIP Industrial Language Standard (SILS)

**Version:** 1.0.0  
**Status:** Development  
**Execution mode:** Diagnostic only

## Purpose

SILS is the governed, parser-independent vocabulary for industrial real estate language across SCIIP_OS. It separates domain meaning from parser implementation so PDFs, spreadsheets, APIs, OCR, and AI-assisted workflows can reason over the same deterministic concepts.

## Principles

1. Business language is governed data.
2. Runtime decisions are deterministic and explainable.
3. AI may propose; governed engines decide.
4. Ontology changes are versioned and certified.
5. Existing parser behavior remains authoritative until integration is certified.
6. SILS performs zero production writes.

## Package

- `sils/VERSION.json` — release and safety metadata.
- `sils/categories.json` — governed concept categories.
- `sils/concepts.json` — canonical concepts, aliases, units, examples, negative indicators, and validation guidance.
- `sciip-language-ontology.js` — immutable runtime, validation, indexes, lookup, export, and diagnostics.
- `tools/tests/ile/sciip-language-ontology.test.js` — deterministic certification test.

## Runtime API

```javascript
const { createDefaultOntology } = require('../tools/supersheets/parser-platform/sciip-language-ontology');
const ontology = createDefaultOntology();

ontology.version();
ontology.statistics();
ontology.validate();
ontology.getConcept('POWER');
ontology.findConceptByAlias('amp service');
ontology.findConcept('4,000 amps of power');
ontology.getCategory('UTILITIES');
ontology.export();
```

## Governance

Construction fails closed when SILS contains duplicate concept IDs, duplicate aliases, unknown categories, invalid value types, malformed collections, or missing required metadata. Runtime objects and nested data are deeply immutable.

## Sprint 1 Boundary

Sprint 1 establishes language governance only. It does not change extraction, parser outputs, production data, or commit behavior. Phrase tokenization, phrase construction, semantic ownership, and parser adapters belong to later certified sprints.
