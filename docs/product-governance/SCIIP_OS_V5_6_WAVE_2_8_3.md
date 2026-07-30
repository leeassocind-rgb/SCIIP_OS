# SCIIP_OS v5.6 Wave 2.8.3 — GIS Code-Splitting Stabilization

## Root cause

The prior Vite strategy grouped every component whose filename contained words such as
`Property`, `Building`, `GIS`, or `Map` into one `workspace-property-gis` chunk.
Because the application also imported all workspaces statically from `main.jsx`, this
created a 2,083,166-byte monolithic bundle.

## Correction

Wave 2.8.3:

- converts 24 secondary workspaces to `React.lazy()` imports;
- adds a governed `Suspense` loading boundary;
- assigns each component to its own component chunk;
- assigns domain implementation modules to domain chunks;
- retains dedicated React, icon, and vendor chunks;
- keeps the 1.5 MiB maximum-chunk policy;
- fails when the monolithic `workspace-property-gis` chunk remains;
- runs architecture checks before and after the build.

This is a real load-path correction, not a threshold increase.
