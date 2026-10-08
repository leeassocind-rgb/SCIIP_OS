SCIIP Explorer 4.0 — R27B-R4-R1
Non-Export Recertification Residual Causal Diagnosis

Purpose:
R27B-R4 certified records 101–127 and halted on record 128, 15881 Terminal Ct,
at targetBindingSettleCertified. This package performs read-only diagnosis only.

It consumes the structured R27B-R4 evidence and reports:
- exact failed ordinal and target;
- exact first failed stage;
- captured target-binding count;
- captured live marker inventory;
- full failed-record stage readback.

It performs no live UI interaction, no retry, no property click, no Assignments
or Generate invocation, and no Export invocation.

The next milestone is selected from evidence:
- zero live candidates -> target-surface identity deep diagnosis;
- multiple candidates -> entity-granularity collision deep diagnosis;
- indeterminate capture -> live-binding instrumentation deep diagnosis.
