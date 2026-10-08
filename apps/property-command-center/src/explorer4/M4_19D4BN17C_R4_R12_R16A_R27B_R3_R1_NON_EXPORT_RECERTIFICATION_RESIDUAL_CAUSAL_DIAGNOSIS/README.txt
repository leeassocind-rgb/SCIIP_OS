R27B-R3-R1 is read-only diagnosis only.

R27B-R3 still halted on record 101 after replacing invalid runtime handler-name
introspection with the R27B-R2-R3 source-certified exportReport binding.

This milestone does NOT retry the record and does NOT invoke Export.
It consumes the structured R27B-R3 outcome and identifies the first false
workflow-stage field so the next repair is based on observed evidence rather
than another speculative control change.
