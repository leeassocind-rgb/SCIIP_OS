# SCIIP_OS Performance Certification

Performance certification measures repository-scale architecture scanning, governance scanning, source inventory throughput, and memory use. Thresholds are versioned in `governance/performance-baseline.json`. A passing run writes immutable evidence fields and a certificate ID to `governance/performance-certification.json`.

Run `npm run certification:performance`. Production certification recognizes the performance domain only when the evidence status is `PASSED`.
