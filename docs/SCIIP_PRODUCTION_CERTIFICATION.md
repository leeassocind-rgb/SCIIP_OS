# SCIIP_OS Production Readiness Certification

Phase 6 introduces evidence-based release certification.

## Profiles

- **Foundation** certifies Runtime, Storage, GIS, Knowledge Graph, AI, Identity, Security, and Deployment. UI, API, Performance, and Recovery may be deferred while those layers are built.
- **Production** requires every domain. It fails closed until all evidence is present.

## Commands

```bash
npm run certification:foundation
npm run certification:production
npm run certification:test
```

Certification writes JSON and Markdown evidence into `governance/`. A certificate ID is generated from the complete result.
