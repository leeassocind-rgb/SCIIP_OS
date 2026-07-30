# SCIIP_OS v5.6 Wave 2.8 — Provenance Reconstruction and Performance Correction

This sprint corrects three production issues:

1. Reconstructs evidence and recommendation lineage from original repository JSON/JSONL/NDJSON files.
2. Rebuilds deterministic recommendation-to-evidence links and provenance edges.
3. Applies an actual Vite manual chunk strategy rather than merely producing a plan.

The production gate intentionally fails when zero recommendation-evidence links remain or when Vite chunking cannot be applied. This prevents false-positive certification.
