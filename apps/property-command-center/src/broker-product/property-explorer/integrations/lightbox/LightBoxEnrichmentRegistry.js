export const LIGHTBOX_EXPLORER_ENRICHMENT=Object.freeze({
  identity:Object.freeze(['parcels']),
  next:Object.freeze(['structures','assessment','true-owner','zoning','transactions','apn-lookup','lightbox-id']),
  later:Object.freeze(['location-info','fema-flood','fema-risk-index','wetlands','epa-sites']),
  policy:Object.freeze({
    canonicalAuthority:'SCIIP',
    externalProvider:'LightBox',
    mapProvider:'Google Maps',
    endpointContractRequired:true,
    browserCredentialsForbidden:true,
    mergeMode:'ENRICH_NEVER_OVERWRITE_CANONICAL_IDENTITY'
  })
});
