SCIIP Explorer 4.0 — R26D-R2-R1-R1
Idempotent Native Runner Installer Repair + Static Recertification

Observed failure
----------------
R26D-R2-R1 passed static certification but failed during installation with:

shutil.SameFileError

Cause:
The APPLY command had already copied the package into the final Explorer milestone
directory. build_r26d_r2_r1.py then attempted to copy native_new_fifty_runner.py
from that directory back onto the exact same path.

Repair
------
No runner behavior or Export contract is changed.

The installer is made idempotent:
- if source and destination are the same file: skip copy and verify SHA-256
- if destination already exists with identical SHA-256: verify and continue
- otherwise copy and verify SHA-256

The target file uses the same idempotent install rule.

This milestone performs:
- no live UI interaction
- no Export invocation
- no governed-data mutation
- runner installation/verification only

On pass the next milestone remains:
R26D-R2-R2 — Exact New-Fifty Native Guarded Export Live Execution.
