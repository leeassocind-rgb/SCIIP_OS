SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R16A-R20-R5-R4
Runtime Loader Contract Export Symbol + Entry Import Binding

Prerequisite:
R5-R3 must have classified all entry dynamic imports as generic Vite/React lazy routing while
recovering a separate runtime loader/cache contract chunk.

This milestone:
- inspects active domain-runtime bundle function definitions
- resolves the minified Rollup/Vite export table
- scores loader/cache/capability/feature/workspace semantics
- parses index bundle imports from domain-runtime
- joins runtime exported symbols to entry-local aliases
- captures entry use neighborhoods for the strongest binding
- does not invoke the runtime or mutate governed/application behavior

All operational authority remains off.
