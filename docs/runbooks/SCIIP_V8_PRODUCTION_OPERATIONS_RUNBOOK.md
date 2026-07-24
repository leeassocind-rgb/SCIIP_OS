# SCIIP_OS v8.0 Production Operations Runbook

1. Confirm environment, identity, permissions, quotas, backups, and compiled deployment integrity.
2. Keep production commit disabled until real SuperSheet certification is complete.
3. Register each source with owner, steward, spreadsheet ID, worksheet, schema fingerprint, and business domain.
4. Execute non-destructive profiling and end-to-end dry run.
5. Resolve blocking schema, entity, relationship, GIS, evidence, provenance, transaction, and duplicate exceptions.
6. Obtain steward approval and preserve the approval evidence.
7. Authorize a limited pilot batch with checkpoint and rollback coverage.
8. Review executive import report before expanding the rollout.

## Incident response

Freeze new commits, preserve transaction and audit identifiers, isolate the affected source, restore from the latest checkpoint when required, rerun duplicate-safe validation, and document the resolution.
