# SCIIP_OS Release 1 Sprint 7

## GIS Intelligence and Spatial Decisioning

Sprint 7 projects governed property-graph coordinates into an assignment-scoped spatial decision workspace. It adds deterministic Haversine proximity analysis, spatial comparable ranking, explainable site-selection scoring, and an interactive map surface without introducing an external mapping dependency.

## Governance

- Coordinates must pass explicit latitude and longitude validation.
- Spatial results are limited to properties linked to the active assignment.
- Distance calculations and scoring weights are deterministic and inspectable.
- Rankings are advisory and preserve broker judgment.
- Missing coordinates are surfaced rather than inferred.
- No spatial analysis mutates graph or ingestion history.
