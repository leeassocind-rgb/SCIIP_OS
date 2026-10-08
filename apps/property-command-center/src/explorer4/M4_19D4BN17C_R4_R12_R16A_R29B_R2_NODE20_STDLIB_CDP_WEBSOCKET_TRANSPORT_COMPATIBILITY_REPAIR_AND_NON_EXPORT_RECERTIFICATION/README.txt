R29B-R2 repairs the exact Node 20 transport failure observed at record 401:

  failure: WebSocket is not defined

The R29B runner relied on a browser-style global WebSocket that is unavailable in Node.js 20.20.2.

This package:
- changes only the R29B runner's CDP WebSocket transport,
- installs a dependency-free RFC6455 client using Node stdlib net + crypto,
- supports masked client frames, 16-bit and 64-bit payload lengths, ping/pong, close, and text CDP messages,
- runs node --check,
- preserves fresh-page, strict-sequential, halt-on-first-failure, and non-export contracts,
- reruns authoritative R29B.

No governed-data mutation and no Export invocation.
