# SCIIP_OS Release 1 — Sprint 5

## Enterprise Property Knowledge Graph

Sprint 5 converts governed SuperSheet promotions into a property-centric knowledge graph inside the Property Command Center.

### Governed model

Canonical node types:

- Property
- Market
- Assignment
- Source
- Status

Canonical relationship types:

- `LOCATED_IN`
- `SUPPORTS_ASSIGNMENT`
- `OBSERVED_IN`
- `HAS_STATUS`

### Controls

- Projection runs only after broker-controlled promotion.
- Rejected rows never enter the graph.
- Node and relationship identifiers are deterministic.
- Replaying an identical ingestion is duplicate-safe.
- Source evidence remains linked to every property observation.
- Graph history records each successful projection event.
- Existing certified SCIIP_OS runtimes are not modified.

### User experience

The Knowledge Graph workspace provides assignment-scoped search, entity-type filtering, property and relationship counts, node inspection, neighborhood traversal, and evidence linkage.
