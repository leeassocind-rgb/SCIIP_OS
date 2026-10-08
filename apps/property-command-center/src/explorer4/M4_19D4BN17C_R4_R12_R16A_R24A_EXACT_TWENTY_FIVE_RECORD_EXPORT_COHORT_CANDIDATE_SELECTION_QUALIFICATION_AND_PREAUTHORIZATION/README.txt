SCIIP Explorer 4.0 — R24A Exact Twenty-Five Record Export Cohort Candidate Selection + Preauthorization

R24 certified the next bounded progressive expansion:
- reference cohort: 10
- next cohort: 25
- new records required: 15

R24A:
1. consumes the exact-ten closed reference cohort;
2. opens one fresh Explorer page;
3. requires bounded Explorer-entry settle before inventory;
4. inventories visible actionable property controls;
5. excludes the ten reference records from the new-candidate pool;
6. deterministically selects the first fifteen unique new records in DOM order;
7. constructs the exact twenty-five candidate cohort;
8. preauthorizes the fifteen new records for non-export live qualification.

No property workflow execution is performed.
No Assignments invocation.
No Export invocation.
No application mutation.
No governed-data mutation.

Preserved downstream policy:
- fresh page per record
- strict sequential
- halt on first failure
- Explorer settle: 3 samples within 2 seconds
- target-binding settle: 3 samples within 5 seconds
- exact-first / unique-contains fallback
- ambiguous contains forbidden
- selected-property settle: 3 samples within 2 seconds
- one Export click maximum per record
- full PDF/runtime continuity guards

If PASSED:
R24B Fifteen-New-Record Non-Export Live Qualification.
