R29B performs the exact New-400 non-export live qualification required after R1-R7.

Contract:
- consume the exact R1-R7 New-400 artifact,
- fresh CDP page per record,
- strict sequential records 401-800,
- halt on first failure,
- bounded Explorer settle,
- enter Explorer,
- canonical address/SF-aware property marker binding,
- selected-property settle,
- enter Assignments,
- certify and invoke Generate Client Listing Report,
- certify Report Review,
- certify exactly one visible enabled Download Client Listing Report control,
- certify exportReport source contract,
- preserve same origin,
- never invoke Export.

The runner writes structured evidence after every executed record so any residual can be diagnosed without replaying already-certified records.
