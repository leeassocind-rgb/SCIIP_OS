R29B-R2-R3-R2-R4-R3-R4 consumes the syntax-safe diagnosis showing that record 401 reaches line 380:

({target:targetPage,cdp}=await createFreshPage());

but never reaches the next synchronous breadcrumb.

This milestone temporarily instruments createFreshPage itself:
- function entry,
- every internal await begin/end,
- return boundaries.

Execution is externally bounded to 8 seconds, and the authoritative R29B runner is restored byte-for-byte afterward.

Governed data mutation OFF.
Property click OFF.
Assignments invocation OFF.
Generate invocation OFF.
Export invocation OFF.
