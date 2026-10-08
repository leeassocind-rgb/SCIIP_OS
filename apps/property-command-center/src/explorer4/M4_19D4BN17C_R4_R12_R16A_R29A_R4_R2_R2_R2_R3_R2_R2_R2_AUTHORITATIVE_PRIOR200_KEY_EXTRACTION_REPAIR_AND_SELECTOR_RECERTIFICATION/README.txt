Repairs the diagnosed R29A authoritative prior-200 key extraction defect.

The preceding diagnosis proved both 200-record artifacts collapsed to one comparison key because normalized identity dictionaries were round-tripped through marker_identity(). This patch extracts comparison keys directly from the raw authoritative records and removes only the certified historical `select ` UI-action prefix before comparing cohorts.

The authoritative selector is then rerun unchanged. No export is invoked by this package.
