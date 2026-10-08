SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R7
Bound Search Pipeline Function Call Graph + Argument Contract Resolution

R6 certified:
- query ingress neighborhood recovered;
- top ingress symbol: j;
- ingress classification: ASSIGNED_ARROW_CLOSURE;
- downstream linkage recovered to symbol a;
- query ingress -> downstream call graph linkage exists.

R7 resolves:
1. the immediate call graph around j and a;
2. j's formal parameter shape;
3. a's invocation sites and argument expressions;
4. any event/value extraction occurring before a is called;
5. any query normalization, trimming, lowercasing, tokenization, or object wrapping;
6. downstream handoff from a into result derivation / result ownership;
7. a canonical argument contract for the next bounded certification step.

Read-only:
- application source mutation OFF
- governed data mutation OFF
- network authority OFF
- pixel evidence OFF
- runtime invocation OFF
