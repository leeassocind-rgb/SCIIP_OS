SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R16A-R7
Live Bound Function Residual Causal Diagnosis

Prerequisite:
- R16A-R6 completed diagnostically.
- R6 selected window.BlobEvent as the Export function candidate.
- Invocation failed because BlobEvent is a native DOM constructor requiring `new`.

Purpose:
- classify the R6 binding as native/browser-intrinsic false positive
- exclude DOM constructors, Web API constructors, built-ins, and native-code functions
- preserve only application-owned React/module/runtime functions
- correlate remaining live application functions to R5 source candidates
- recover a corrected bounded live candidate set for recertification

Authority:
- application source mutation OFF
- governed data mutation OFF
- network authority OFF
- pixel evidence OFF
- Export/Presentation runtime invocation OFF
