SCIIP Explorer 4.0 — R21-R1-R1
Active Chunk Hash + Source Owner Parity Resolution

R21-R1 found the local app live with two entry scripts but zero production-style reachable chunks.
That can occur when Vite is serving source modules directly rather than a production dist graph.

This repair is topology-aware:
- recursively follows static imports, re-exports, and dynamic imports;
- distinguishes /src/ dev modules from /assets/ built chunks;
- maps live /src/ modules back to local source files;
- checks exact hash parity where possible and semantic owner parity when Vite transforms imports/HMR;
- locates live modules containing the actual Export/Presentation controls identified by R21;
- never treats dist files on disk as runtime proof.

READ ONLY. No application/governed mutation, pixel evidence, or live workflow action.
