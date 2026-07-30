# SCIIP Architecture Governance Remediation v2

## Root cause

The original architecture gate used regular expressions without lexical scope awareness. It counted:

- private named functions inside closures as global Apps Script functions;
- local `var` declarations inside functions as Apps Script globals.

This produced the reported false regression from 139 to 303 duplicate functions and from 3 to 439 duplicate globals.

## Correction

The v2 gate calculates brace depth after neutralizing comments and strings, and includes only file-scope declarations in enforceable duplicate metrics. Legacy raw counts remain in `diagnosticMetrics` and report details for transparency.

The uploaded repository validates at:

- enforceable duplicate functions: 93
- enforceable duplicate globals: 3
- legacy raw duplicate functions: 303
- legacy raw duplicate globals: 439
- syntax errors: 0
- duplicate processor numbers: 0
- placeholders: 0
- unbounded test ranges: 0

The existing baseline remains conservative at 139 functions and 3 globals, so the corrected gate passes without weakening the baseline.

## CI modernization

The architecture workflow moves to Node.js 24 and v5 GitHub actions. It runs the architecture analyzer regression test before the repository gate.

## Governance behavior

- Real file-scope regressions still fail.
- Local implementation details no longer create false global collisions.
- `--strict` still requires zero true file-scope duplicate functions/globals.
- `--write-baseline` writes schema-v2 baselines explicitly.
