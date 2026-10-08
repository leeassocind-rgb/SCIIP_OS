SCIIP Explorer 4.0 — R26D-R2-R3-R1

Observed block
--------------
R26D-R2-R3 stopped before live execution with:
STATUS: BLOCKED
REASON: exact record-81 residual diagnosis required

Cause
-----
The prior diagnostic evidence stores:
executionSummary.firstFailureOrdinal
executionSummary.firstFailureTarget

R26D-R2-R3 incorrectly read:
firstFailureOrdinal
from the top level.

Repair
------
Only the evidence lookup is changed.

The repaired wrapper now consumes:
- executionSummary.firstFailureOrdinal == 81
- executionSummary.firstFailureTarget == 112 W Alondra Blvd

No execution contract is weakened or broadened.

Preserved:
- reference 50 never re-exported
- already certified new 30 never re-exported
- residual cohort remains exactly records 81-100 (20 records)
- Alondra Building 1 binding repair remains active
- strict sequential
- halt on first failure
- maximum one guarded Export click per residual record
- artifact and runtime guards
