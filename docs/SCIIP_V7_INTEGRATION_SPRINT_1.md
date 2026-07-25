# SCIIP_OS v7.0 Integration Sprint 1

This sprint introduces canonical shared application state, an isolated application event bus, cross-workspace property synchronization, unified global search, and desktop/mobile context parity. It adds no processor family and preserves the v6.1 production-ready rollback baseline.

## Contracts

`SCIIP_APP_STATE` supports `get`, `set`, `patch`, `subscribe`, `unsubscribe`, `reset`, `snapshot`, and `restore`.

`SCIIP_APP_EVENTS` supports `publish`, `subscribe`, `unsubscribe`, `once`, bounded event history, and subscriber error isolation.

Property selection updates Property Explorer context, GIS focus context, Knowledge Graph focus context, AI grounding context, Executive selected-context state, and mobile context through the same contracts.

## Tests

Node: `npm run certification:integration-sprint1`

Apps Script: run `sciipTestV7IntegrationSprint1()`.

Deployment: `cd ~/Desktop/SCIIP_OS && npm run deployment:push`
