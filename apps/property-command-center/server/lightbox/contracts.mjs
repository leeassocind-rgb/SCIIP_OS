export const LIGHTBOX_CONTRACTS=Object.freeze({
  parcelsGeometry:Object.freeze({
    id:'parcels.geometry',
    status:'VERIFIED',
    method:'GET',
    path:'/parcels/{countryCode}/geometry',
    required:Object.freeze(['countryCode','wkt']),
    optional:Object.freeze(['bufferDistance','bufferUnit','limit','offset','filter']),
    provenance:'Imported LightBox Parcels OpenAPI contract verified in Postman'
  }),
  structures:Object.freeze({
    id:'structures',
    status:'SCHEMA_REQUIRED',
    capability:'building footprints with height and elevation'
  }),
  assessment:Object.freeze({
    id:'assessment',
    status:'SCHEMA_REQUIRED',
    capability:'jurisdiction-level assessment, valuation, tax, ownership and structural details'
  }),
  trueOwner:Object.freeze({
    id:'true-owner',
    status:'SCHEMA_REQUIRED',
    capability:'true-owner people, business entities and related contact information'
  }),
  zoning:Object.freeze({
    id:'zoning',
    status:'SCHEMA_REQUIRED',
    capability:'parcel zoning districts, setbacks, FAR and building-height limits'
  }),
  transactions:Object.freeze({
    id:'transactions',
    status:'SCHEMA_REQUIRED',
    capability:'sale, lender, deed and pricing history'
  }),
  locationInfo:Object.freeze({
    id:'location-info',
    status:'SCHEMA_REQUIRED',
    capability:'building/business point attributes including broadband serviceability'
  }),
  environmental:Object.freeze({
    id:'environmental',
    status:'SCHEMA_REQUIRED',
    capability:'FEMA, wetlands and EPA overlays'
  })
});

export function contractStatus(){
  return Object.values(LIGHTBOX_CONTRACTS).map(item=>({
    id:item.id,
    status:item.status,
    capability:item.capability||null
  }));
}
