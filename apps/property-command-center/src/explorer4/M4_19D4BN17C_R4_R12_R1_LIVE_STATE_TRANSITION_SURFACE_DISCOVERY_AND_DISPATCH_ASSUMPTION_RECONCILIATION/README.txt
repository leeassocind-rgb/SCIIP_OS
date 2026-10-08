SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R1
Live State-Transition Surface Discovery + Dispatch-Assumption Reconciliation

R4-R12 proved:
- source-side reducer/action contracts are abundant;
- no live hook-queue dispatch function was captured;
- no live dispatch fingerprint exists;
- therefore the prior assumption that the active search result owner is exposed as a React hook dispatch surface is invalid.

R4-R12-R1 resolves the actual live state-transition surface before any further action/payload certification.

Read-only scope:
- application source mutation: OFF
- governed data mutation: OFF
- network authority: OFF
- pixel evidence: OFF

The milestone searches live runtime surfaces for:
1. React context/provider values containing callable search/result/update methods;
2. external store APIs exposed through props/context values (getState/setState/subscribe/dispatch);
3. action registries/command registries/search services;
4. global/window-scoped stores or service singletons;
5. callable provider methods adjacent to result arrays;
6. source/runtime name correlation for the discovered surface.

No state transition is invoked.
