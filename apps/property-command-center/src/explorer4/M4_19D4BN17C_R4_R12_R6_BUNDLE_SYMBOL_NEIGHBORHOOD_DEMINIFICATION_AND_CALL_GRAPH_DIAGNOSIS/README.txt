SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R6
Bundle Symbol Neighborhood Deminification + Call-Graph Diagnosis

R5 certified:
- active bundle is correct;
- result derivation, result ownership, selection, and dispatcher/service candidates are present;
- cross-stage symbol overlap is present;
- query ingress bound-function extraction returned zero candidates.

R6 resolves the minified/inline query-ingress boundary by:
1. scanning larger neighborhoods around Search SCIIP / broker-global-search / searchQuery / searchTerm literals;
2. extracting surrounding assignment expressions, arrow closures, callbacks, JSX handler references, and inline function bodies;
3. building a lightweight symbol call graph from those neighborhoods;
4. linking ingress-side symbols to already-resolved derivation, owner, selection, and dispatcher symbols;
5. classifying query ingress as named function, assigned closure, inline callback, imported alias, or property-bound handler;
6. emitting the exact next milestone based on the recovered call graph.

Read-only:
- application source mutation OFF
- governed data mutation OFF
- network authority OFF
- pixel evidence OFF
- runtime invocation OFF
