SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R16A-R20-R5-R3
Dynamic Import Role + Cache Contract Diagnosis

R5-R2 recovered 79 dynamic imports, all centered in the active Vite entry chunk, but zero strict
loader-like candidates. This milestone separates generic React.lazy/Vite preload routing from the
actual runtime workspace/capability loader contract.

It:
- reclassifies dynamic imports using Vite modulepreload/__vite__mapDeps/lazy signatures
- scans all active chunks for Map/cache, capability registry, status, workspace, and feature-gate contracts
- inspects entry imports from domain-runtime/domain-platform/domain-product
- identifies the runtime chunk that should be symbol-bound next

Read-only only. No application/governed mutation, network, pixel, or live workflow authority.
