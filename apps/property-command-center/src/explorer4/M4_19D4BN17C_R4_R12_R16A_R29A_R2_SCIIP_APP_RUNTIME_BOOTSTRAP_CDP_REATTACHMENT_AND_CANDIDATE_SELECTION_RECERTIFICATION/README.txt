SCIIP Explorer 4.0 — R29A-R2

Observed prerequisite chain:
1. R29A blocked because CDP 9333 was unavailable.
2. R29A-R1 attempted CDP bootstrap and then proved the SCIIP app itself was not running at 127.0.0.1:5173.

This milestone repairs the runtime prerequisite chain:
- start or reuse apps/property-command-center on 127.0.0.1:5173;
- wait for the SCIIP app to become reachable;
- start or reuse Chrome CDP on 9333;
- ensure a CDP page is attached to the SCIIP app;
- rerun the authoritative R29A selector unchanged.

Safety:
- no property click;
- no Assignments invocation;
- no Generate invocation;
- no Export invocation;
- no governed-data mutation.

On PASS, advance to R29B exact-new-400 non-export live qualification.
