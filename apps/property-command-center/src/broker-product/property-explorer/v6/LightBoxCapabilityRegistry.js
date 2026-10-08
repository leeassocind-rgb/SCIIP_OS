export const LIGHTBOX_CAPABILITIES=Object.freeze([
  {id:'parcels',label:'Parcels',role:'IDENTITY',priority:1,phase:'ACTIVE_FOUNDATION',target:['parcel boundary','ownership','land use','tax','property characteristics']},
  {id:'structures',label:'Structures',role:'SPATIAL_ENRICHMENT',priority:2,phase:'NEXT',target:['building footprints','height','elevation']},
  {id:'assessment',label:'Assessment',role:'PROPERTY_ENRICHMENT',priority:3,phase:'NEXT',target:['assessment','valuation','tax attributes','ownership','structural details']},
  {id:'true-owner',label:'True Owner',role:'OWNERSHIP_ENRICHMENT',priority:4,phase:'NEXT',target:['true owner people','business entities','contact data']},
  {id:'zoning',label:'Zoning',role:'LAND_USE_ENRICHMENT',priority:5,phase:'NEXT',target:['district','setbacks','FAR','height limits']},
  {id:'transactions',label:'Transactions',role:'CAPITAL_MARKETS',priority:6,phase:'NEXT',target:['sale history','lender','deed','pricing']},
  {id:'location-info',label:'Location Info',role:'INFRASTRUCTURE',priority:7,phase:'LATER',target:['business/building point','broadband serviceability']},
  {id:'fema-flood',label:'FEMA Flood',role:'RISK',priority:8,phase:'LATER',target:['flood zone','base flood elevation']},
  {id:'fema-risk-index',label:'FEMA Risk Index',role:'RISK',priority:9,phase:'LATER',target:['hazard risk','social vulnerability','resilience']},
  {id:'wetlands',label:'Wetlands',role:'ENVIRONMENTAL',priority:10,phase:'LATER',target:['wetland constraints']},
  {id:'epa-sites',label:'EPA Sites',role:'ENVIRONMENTAL',priority:11,phase:'LATER',target:['Superfund','Brownfield']},
  {id:'apn-lookup',label:'APN Lookup',role:'IDENTITY_RESOLUTION',priority:12,phase:'NEXT',target:['APN to LightBox base objects']},
  {id:'lightbox-id',label:'LightBox ID Lookup',role:'IDENTITY_RESOLUTION',priority:13,phase:'NEXT',target:['base object type','references','spatial metadata']}
]);

export function lightBoxCapabilityPlan(){
  return{
    identityBackbone:'parcels',
    visualizationBackbone:'google-maps',
    securityModel:'SERVER_SIDE_PROXY_ONLY',
    browserSecretAllowed:false,
    next:LIGHTBOX_CAPABILITIES.filter(item=>item.phase==='NEXT').map(item=>item.id),
    later:LIGHTBOX_CAPABILITIES.filter(item=>item.phase==='LATER').map(item=>item.id)
  };
}
