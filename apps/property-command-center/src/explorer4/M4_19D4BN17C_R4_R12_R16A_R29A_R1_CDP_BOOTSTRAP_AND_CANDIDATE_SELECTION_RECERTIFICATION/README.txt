SCIIP Explorer 4.0 — R29A-R1

Repairs the R29A environment prerequisite only.

Observed failure:
STATUS: BLOCKED
REASON: CDP unavailable on port 9333

Behavior:
- Reuse port 9333 if already live.
- Otherwise launch a dedicated Chrome/Chromium remote-debugging profile on port 9333.
- Verify SCIIP at http://127.0.0.1:5173/.
- Re-run the already-installed authoritative R29A selector unchanged.
- No property click, Assignments, Generate, or Export.
- No governed-data mutation.

On a clean R29A pass, advance to R29B exact-new-400 non-export qualification.
