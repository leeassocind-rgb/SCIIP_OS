# SCIIP_OS v7.0 — Epic 3 Sprint 5

## Relationship Intelligence

This is an incremental patch. It does not contain or reinstall the SCIIP_OS repository.

Capabilities:
- relationship graph normalization and duplicate suppression
- influence scoring
- explainable warm-introduction detection
- evidence-grounded AI briefing requests
- governed preview/append persistence
- Apps Script and Node certification

Install from the extracted package with:

```bash
chmod +x INSTALL.command
./INSTALL.command
```

The installer targets `~/Desktop/SCIIP_OS`, backs up every target file that already exists, records newly created files, patches only the Sprint 5 npm test command, and runs the Node certification.

Rollback:

```bash
chmod +x ROLLBACK.command
./ROLLBACK.command
```
