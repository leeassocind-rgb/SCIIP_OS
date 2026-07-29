# SCIIP_OS Release 1 Sprint 6 — AI Property Copilot

## Purpose
Sprint 6 introduces an evidence-grounded AI Property Copilot inside the Property Command Center. It reasons exclusively over the governed Enterprise Property Knowledge Graph created in Sprint 5.

## Product guarantees
- No unsupported factual claims.
- Every substantive answer exposes the graph evidence used.
- Confidence is explicit and reproducible.
- Recommendations do not execute automatically.
- Broker approval is required for consequential actions.
- Responses may be preserved into assignment memory but never overwrite broker-authored content.

## Capabilities
- Natural-language property filtering.
- Assignment summaries.
- Comparable-support review.
- Market-evidence summaries.
- Explainable property recommendations.
- Evidence inspection and graph-neighborhood review.
- Preserved response history.

## Architecture
The copilot consists of deterministic intent detection, constraint extraction, graph retrieval, evidence assembly, confidence calculation, and policy enforcement. This release does not require an external model or API key.
