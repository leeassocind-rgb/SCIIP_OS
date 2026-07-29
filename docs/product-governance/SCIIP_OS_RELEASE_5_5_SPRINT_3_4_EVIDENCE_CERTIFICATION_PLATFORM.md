# SCIIP_OS Release 5.5 Sprint 3.4 — Evidence Certification Platform

Version 196.4.0 introduces the connector-agnostic evidence certification foundation.

## Governed entities

- EvidencePackage
- ParserTrace
- ReviewDecision
- GoldenTest
- CertificationRun
- DocumentFingerprint

## Policy

Every parser review must preserve source document identity, page, property identity, raw evidence, column evidence, parser trace, and current field state. Review decisions are append-only. Parser bugs and business-rule decisions may create Golden Tests, but Golden Tests remain pending until explicit approval. A UI action never changes the source observation silently.

## Certification states

- CERTIFIED: no open review items and no critical review items.
- CONDITIONALLY_CERTIFIED: optional reviews remain, but no critical review item exists.
- BLOCKED: one or more critical review items remain.

## Sprint acceptance

The platform must generate one evidence package per review item, preserve deterministic identity, expose a visible parser trace, block silent promotion, retain immutable decision history, and integrate the Evidence Inspector into every Property Command Center workspace.
