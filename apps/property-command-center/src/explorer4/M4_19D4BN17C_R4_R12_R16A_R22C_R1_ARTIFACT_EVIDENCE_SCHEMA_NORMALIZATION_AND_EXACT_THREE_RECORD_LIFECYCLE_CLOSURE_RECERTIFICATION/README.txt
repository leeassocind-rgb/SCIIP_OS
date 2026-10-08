SCIIP Explorer 4.0 — R22C-R1

R22C correctly reconciled all three certified record workflows and runtime continuity,
but it reported allPdfArtifactsCertified=false because the first two R22B-R2-R5 artifact
fields were read from the wrong schema level.

This repair performs read-only evidence normalization only.

It supports both:
- flat fields such as pdfDownloadCount / pdfEventCount / pdfFilename / pdfSizeBytes
- nested artifact fields such as artifact.pdfDownloadCount / artifact.pdfEventCount /
  artifact.filename / artifact.sizeBytes

No Export is rerun.

If all three normalized artifact records verify exactly one PDF download, exactly one PDF
object URL event, positive PDF size, .pdf filename, clean runtime, intended post-publish
Report Review unmount, Explorer continuity, same origin, and certified workflow path,
the exact-three-record Export micro-cohort lifecycle is closed.

Application source mutation OFF.
Governed data mutation OFF.
Network authority OFF.
Pixel evidence OFF.
Live UI interaction OFF.
Additional Export invocation OFF.
