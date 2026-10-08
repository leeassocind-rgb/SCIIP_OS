SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R16A-R10
Role-Specific Alias Invocation Contract Residual Diagnosis

Prerequisite:
- R16A-R9 completed diagnostically.
- R9 bound application-owned Export alias reactProps.onClick -> source alias E.
- Invocation succeeded without exception using NO_ARGS.
- No certifiable Export state transition occurred.

Purpose:
- determine the exact invocation contract expected by the R8/R9 Export alias
- inspect source formal parameters and nearby source call sites
- inspect live React props, element metadata, sibling handlers, and closure source
- classify required invocation shape:
  * no args
  * browser/React event object
  * property/context payload
  * event + context payload
  * chained handler / sibling control activation
- keep Export/Presentation runtime invocation OFF

Authority:
- application source mutation OFF
- governed data mutation OFF
- network authority OFF
- pixel evidence OFF
- Export/Presentation runtime invocation OFF
