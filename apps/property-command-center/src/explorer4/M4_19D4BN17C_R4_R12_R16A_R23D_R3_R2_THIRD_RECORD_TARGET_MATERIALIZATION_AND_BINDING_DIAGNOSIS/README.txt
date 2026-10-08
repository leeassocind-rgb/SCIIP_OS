SCIIP Explorer 4.0 — R23D-R3-R2

R23D-R3-R1 proved the third-record failure happened before target selection:
the fresh page existed, but exact Explorer control count was zero and the target also had zero exact/contains candidates.

R23D-R3-R2 diagnoses the chain in the correct order.

On one fresh page it:
1. samples exact and Explorer-like controls from 0 to 3 seconds;
2. if exactly one Explorer control materializes, clicks only Explorer;
3. then samples 8700 - 8750 Rex Rd exact, contains, and marker surfaces from 0 to 3 seconds;
4. does not click the property;
5. does not invoke Assignments;
6. does not invoke Export.

This determines whether the correct permanent repair is a bounded Explorer-entry settle guard,
a property target binding repair, a marker binding, or a search/filter-state repair.
