export const CANONICAL_FIELDS = Object.freeze({
  propertyId: ['property id','property_id','building id','building_id','asset id','asset_id'],
  address: ['address','property address','street address','site address'],
  city: ['city','municipality'],
  state: ['state','province'],
  postalCode: ['zip','zipcode','zip code','postal code'],
  buildingSf: ['building sf','building size','building_size','square feet','sf','available sf'],
  availableSf: ['available sf','available square feet','vacant sf'],
  landAcres: ['land acres','acres','site acres'],
  clearHeightFt: ['clear height','clear ht','clear height ft'],
  dockHighDoors: ['dock high','dh','dock doors','dock high doors'],
  powerAmps: ['power amps','amps','electrical amps'],
  askingRate: ['asking rate','rate','lease rate','rent'],
  status: ['status','availability status'],
  latitude: ['latitude','lat'],
  longitude: ['longitude','lng','lon'],
  source: ['source','data source'],
  updatedAt: ['updated at','updated','last updated','date']
});

const normalizeHeader = value => String(value ?? '').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
const aliasIndex = new Map(Object.entries(CANONICAL_FIELDS).flatMap(([field,aliases]) => aliases.map(alias => [normalizeHeader(alias),field])));

export function mapHeaders(headers=[]){
  const mappings=[]; const unmapped=[]; const seen=new Set();
  headers.forEach((header,index)=>{
    const canonical=aliasIndex.get(normalizeHeader(header));
    if(!canonical){unmapped.push({index,header});return;}
    if(seen.has(canonical)){unmapped.push({index,header,reason:'duplicate-canonical-field'});return;}
    seen.add(canonical);mappings.push({index,header,canonical});
  });
  return {mappings,unmapped,coverage:mappings.length/Math.max(headers.length,1)};
}

export function validateRequiredHeaders(mapping){
  const present=new Set(mapping.mappings.map(item=>item.canonical));
  const missing=['address'].filter(field=>!present.has(field));
  return {valid:missing.length===0,missing};
}
