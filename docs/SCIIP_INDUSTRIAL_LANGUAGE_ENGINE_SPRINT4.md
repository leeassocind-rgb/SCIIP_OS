# SCIIP Industrial Language Engine — Sprint 4

## Semantic Interpreter

Sprint 4 introduces deterministic semantic interpretation between governed phrases and the SCIIP Industrial Language Standard (SILS).

The interpreter accepts raw text or a Sprint 3 phrase-builder result and produces ontology-validated, source-traceable interpretations. Each accepted result includes the SILS concept, semantic value, confidence, token evidence, source span, explainable reasoning, and governance metadata.

### Governed mappings

- Electrical specification → POWER
- Clear height → CLEAR_HEIGHT
- Dock-high count → DOCK_HIGH
- Grade-level count → GRADE_LEVEL
- Truck-court depth → TRUCK_COURT
- Auto parking → AUTO_PARKING
- Trailer parking → TRAILER_PARKING
- Building area → BUILDING_AREA
- Land area → LAND_AREA
- Column spacing → COLUMN_SPACING
- Fire suppression → ESFR or SPRINKLER based on phrase evidence

### Safety posture

The interpreter is diagnostic-only. It performs no production writes, cannot commit parser output, and leaves the existing parser authoritative. Integration into semantic intelligence is intentionally deferred to a later governed sprint.
