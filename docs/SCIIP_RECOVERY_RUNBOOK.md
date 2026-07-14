# SCIIP_OS Recovery Runbook

## Recovery scope

SCIIP_OS recovery has two separate responsibilities:

1. **Repository recovery** restores source code, governance policy, deployment metadata, tests, and documentation from a verified checkpoint.
2. **Data-backend recovery** restores persistent operational data using the native recovery controls of the selected `SCIIP_STORAGE_BACKEND` adapter.

Repository checkpoints do not replace Google Workspace retention, BigQuery snapshots, Cloud SQL automated backups/PITR, or Firestore managed export and restore.

## Create a repository checkpoint

```bash
cd ~/Desktop/SCIIP_OS
bash scripts/sciip_repository_checkpoint.sh
```

The command writes a timestamped `.tar.gz`, a SHA-256 archive checksum, and an internal file manifest under `.recovery/checkpoints`.

## Restore and verify

```bash
bash scripts/sciip_repository_restore.sh \
  .recovery/checkpoints/SCIIP_OS_checkpoint_<timestamp>.tar.gz \
  .recovery/restore-test
```

The restore is accepted only when every file matches `RECOVERY_MANIFEST.sha256`.

## Backend recovery responsibilities

- **Google Sheets:** rely on Drive version history, protected backup copies, and export checkpoints. Confirm spreadsheet IDs before reconnecting the runtime.
- **BigQuery:** use table snapshots, time travel, and dataset-level restore procedures. Rebind the injected BigQuery client after validation.
- **Cloud SQL:** use automated backups and point-in-time recovery. Restore into an isolated instance before changing production connection settings.
- **Firestore:** use managed export/import and project-level disaster-recovery procedures. Validate document counts and security rules before cutover.
- **Local runtime:** restore the repository checkpoint and any separately retained local data directory.

## Recovery acceptance

Run:

```bash
npm run certification:recovery
npm run certification:production
```

A release cannot claim recovery certification without a passing round-trip restore, valid hashes, an acceptable RTO, an acceptable RPO, and this backend-specific runbook.
