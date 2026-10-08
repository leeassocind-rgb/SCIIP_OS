SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R13A-R3-R1
Execution-Policy Reconciliation + Same-Browser Fresh-Page Selection Certification

R3 established:
- REUSED_TARGET_CERTIFIED: True
- FRESH_PAGE_SAME_BROWSER_CERTIFIED: True
- FRESH_ISOLATED_BROWSER_CERTIFIED: False
- FRESH_ISOLATED_BROWSER_OBSERVED: True
- record-two selection is reproducible in the same browser context;
- isolated-browser execution is a separate observed failure.

R3-R1 reconciles execution policy instead of requiring every runtime topology to pass.

Certified policy:
- browser profile/context: PRESERVED
- page target: FRESH PER RECORD
- same page reused across records: DISALLOWED
- fresh isolated browser per record: DISALLOWED / UNSUPPORTED
- strict sequential: REQUIRED
- halt on first failure: REQUIRED
- selected-property readback: REQUIRED
- Compare readback: REQUIRED

This milestone is evidence-only.
