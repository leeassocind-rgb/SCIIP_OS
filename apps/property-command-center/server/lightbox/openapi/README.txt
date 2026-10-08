Drop LightBox OpenAPI JSON specifications into this directory.

Recommended filenames:
  structures.openapi.json
  assessment.openapi.json
  true-owner.openapi.json
  zoning.openapi.json
  transactions.openapi.json

Then run:
  node server/lightbox/import-openapi-contract.mjs server/lightbox/openapi/<filename>

The importer DOES NOT automatically activate a live endpoint.
It validates the document, inventories its operations, writes a review report,
and marks the capability CONTRACT_IMPORTED_PENDING_REVIEW.

Only a separately certified activation may change a capability to ACTIVE_VERIFIED.
This prevents SCIIP from inventing or silently calling undocumented endpoints.
