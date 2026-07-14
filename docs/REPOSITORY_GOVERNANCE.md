# SCIIP_OS Repository Governance

Phase 5 establishes the mandatory CI gate for SCIIP_OS. The gate runs on pushes to `main`, pull requests, and manual dispatches using Node.js 20.

It blocks syntax errors, duplicate processor numbers, duplicate globals, public-function conflicts, processor naming violations, missing architecture foundation files, direct storage writes, and regression in `SCIIP_STORAGE_RUNTIME` adoption.

The policy is baseline-aware. Existing architecture remains deployable, but modernization metrics may not move backward.
