SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R16A-R8
Application-Owned Function Alias + Role Resolution

Prerequisite:
- R16A-R7 PASSED.
- R7 rejected native/browser intrinsics.
- 13 application-owned live runtime functions were observed.
- No live function carried an exact R5 Export/Presentation name or direct semantic signature.

Purpose:
- consume R5 source candidates and R7 live application-owned candidates
- compare function arity, source length, normalized lexical fingerprints, React ownership and neighboring handler context
- resolve minified/aliased live function roles
- classify live functions as Export, Presentation, shared action, or unrelated
- produce a bounded application-owned candidate set for live recertification

Authority:
- application source mutation OFF
- governed data mutation OFF
- network authority OFF
- pixel evidence OFF
- Export/Presentation runtime invocation OFF
