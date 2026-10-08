SCIIP Explorer 4.0 — R26D-R2-R3-R2
Residual Runner Invocation Contract Repair + Residual-Twenty Execution Recertification

Observed failure
----------------
The residual wrapper reached the execution boundary but the native runner immediately returned:

USAGE: native_new_fifty_runner.py <repo> <target-file>

No residual Export execution occurred.

Cause
-----
The wrapper invoked:

python native_residual_twenty_runner.py <target-file>

but the certified runner contract requires:

python native_residual_twenty_runner.py <repo> <target-file>

Repair
------
Only the subprocess invocation is corrected.

The repaired invocation passes:
1. the SCIIP_OS repository root
2. the exact residual-20 target file

Preserved without change:
- reference 50 not re-exported
- previously certified new 30 not re-exported
- residual cohort remains records 81-100 only
- Alondra Building 1 canonical binding remains active
- strict sequential execution
- halt on first failure
- maximum one guarded Export click per residual record
- artifact/runtime guards
- no retry of the failed prior wrapper execution, because that prior run never entered live record processing
