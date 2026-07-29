const clean=value=>String(value??'').trim();
const slug=value=>clean(value).toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-|-$/g,'');
export function createTwinId(property={}){
 const explicit=clean(property.propertyId||property.id); if(explicit)return `TWIN-${slug(explicit)}`;
 const address=clean(property.address); const city=clean(property.city); if(!address)throw new Error('Property identity requires propertyId or address');
 return `TWIN-${slug(`${address}-${city}`)}`;
}
export function normalizePropertyIdentity(property={}){
 return {twinId:createTwinId(property),propertyId:clean(property.propertyId||property.id)||null,address:clean(property.address)||null,city:clean(property.city)||null,state:clean(property.state)||null,postalCode:clean(property.postalCode)||null};
}
