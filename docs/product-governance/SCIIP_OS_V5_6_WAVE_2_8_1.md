# SCIIP_OS v5.6 Wave 2.8.1 — Production Schema Correction

The production repository was inspected directly. Its evidence relationship is explicit:

`recommendations[].propertyId = evidence[].source.from`

when `evidence[].source.type` is `SUPPORTED_BY`.

The correction therefore links each recommendation to the complete evidence bundle for its property rather than attempting source-file co-location. It also rebuilds the provenance graph, reconciles the decision queue, preserves human approval, creates a canonical-collapse review queue, and installs an actual Vite React chunking configuration.

Certification fails on incomplete production evidence coverage, zero provenance edges, dangling evidence targets, decision queue records without evidence, missing Vite configuration, failed build, insufficient code splitting, or an oversized post-build chunk.
