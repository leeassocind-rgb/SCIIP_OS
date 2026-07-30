# SCIIP_OS v5.6 Wave 2.9.0 — Severe Repository Consolidation

This is a deliberately aggressive repository hygiene pass.

It archives generated material outside the repository, removes local backups, build output, dependency folders, high-volume transient reports, and generated runtime data copies, then removes those paths from Git tracking. It preserves the authoritative production-validation datasets under `src/production-validation`, regenerates runtime assets before each Property Command Center build, and retains the 1.5 MiB JavaScript certification threshold.

The installer does not create a commit or tag. Review the resulting Git diff before establishing the new baseline.
