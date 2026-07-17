# SCIIP_OS Deployment Compiler

The source repository remains modular. The compiler creates a deterministic, reduced-file Apps Script deployment under `dist/apps-script`.

Commands:

- `npm run deployment:compile`
- `npm run deployment:test`
- `npm run deployment:push`

Never edit files in `dist/apps-script`; rebuild them from `src`.
