# SCIIP GIS Workspace Alpha

The GIS Workspace Alpha is the first spatial application surface in SCIIP Desktop. It consumes property and graph records containing latitude and longitude, presents filterable map layers, and exposes selected-feature detail without depending on an external map API.

## Live sources

- `PROPERTY_REGISTRY`, `PROPERTY_CURRENT`, or `ASSET_REGISTRY`
- `GRAPH_NODES`, `KNOWLEDGE_GRAPH_NODES`, or `ASSET_GRAPH_NODES`

When no live spatial registry is available, the workspace uses a certified Southern California fallback catalog.

## Alpha capabilities

- Coordinate validation
- Map bounds calculation
- Property, market, company, and graph-node layers
- Search and layer/status filtering
- Keyboard-accessible SVG markers
- Selected-feature detail
- Google Maps satellite handoff
