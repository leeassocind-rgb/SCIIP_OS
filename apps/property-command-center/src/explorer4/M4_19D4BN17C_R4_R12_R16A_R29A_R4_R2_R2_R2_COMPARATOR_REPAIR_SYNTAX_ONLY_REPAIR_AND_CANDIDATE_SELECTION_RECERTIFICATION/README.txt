SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2

R29A-R4-R2-R2-R1 proved the exact remaining defect:
line 187 of choose_prior200 is indented four spaces, placing the repaired
'if' outside the active try block. The preceding assignment is correctly
inside the try block at eight spaces and the return is already nested beneath
the if.

This milestone performs only the authorized syntax repair:
- indent line 187 from 4 spaces to 8 spaces;
- preserve the corrected new200 disjointness comparator;
- verify the entire selector with ast.parse;
- verify the selector with Python py_compile;
- preserve the page-ready Explorer settle repair and its 2-second/3-sample guard;
- rerun authoritative R29A candidate selection.

No property click, Assignments, Generate, or Export is authorized.
