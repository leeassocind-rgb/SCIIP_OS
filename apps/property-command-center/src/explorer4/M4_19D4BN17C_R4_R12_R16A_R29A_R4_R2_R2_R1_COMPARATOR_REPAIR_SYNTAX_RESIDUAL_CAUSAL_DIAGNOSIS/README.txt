SCIIP Explorer 4.0 — R29A-R4-R2-R2-R1

Observed residual:
R29A-R4-R2-R2 successfully changed the semantic comparator from livekeys to
new200, but the patched selector failed Python parsing at line 187 before any
candidate-selection logic could run.

This milestone is read-only. It:
- reproduces the SyntaxError with ast.parse;
- captures the exact failing line, offset, and parser message;
- captures surrounding source context;
- captures the full injected authoritative prior-200 branch and indentation;
- verifies the intended new200 comparator exists and the obsolete livekeys
  comparator is removed.

No UI interaction, property click, Assignments, Generate, or Export occurs.

On PASS the next milestone is a syntax-only repair followed by R29A
candidate-selection recertification.
