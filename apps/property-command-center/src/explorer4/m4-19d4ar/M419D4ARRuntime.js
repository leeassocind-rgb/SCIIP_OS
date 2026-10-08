import crypto from "node:crypto";

export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AR_SOURCE_NATIVE_AVAILABLE_SF_PATH_QUALIFICATION_USING_QUALIFIED_LIGHTBOX_PARCEL";
export const VERSION="4.0-m4.19d4ar";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export const AVAILABLE_KEYS=[
  "availableSf","availableSF","available_sq_ft","availableSquareFeet","available_area",
  "availableArea","availableBuildingSf","availableBuildingSF","available_space_sf"
];

export const PHYSICAL_AREA_KEYS=[
  "buildingSf","buildingSF","buildingSize","building_size","buildingArea","building_area",
  "grossBuildingArea","gross_building_area","gla","squareFeet","square_feet","sqft","sf",
  "structureArea","improvementArea","improvement_area"
];

export function walk(value,path="$",out=[]){
  if(value&&typeof value==="object"){
    if(Array.isArray(value)){
      value.forEach((v,i)=>walk(v,`${path}[${i}]`,out));
    }else{
      for(const [k,v] of Object.entries(value)){
        const p=`${path}.${k}`;
        out.push({path:p,key:k,value:v});
        walk(v,p,out);
      }
    }
  }
  return out;
}

export function numeric(v){
  if(v===null||v===undefined)return null;
  if(typeof v==="string"&&v.trim()==="")return null;
  const n=Number(String(v).replace(/,/g,""));
  return Number.isFinite(n)?n:null;
}

export function classifyKey(k=""){
  if(AVAILABLE_KEYS.some(x=>x.toLowerCase()===k.toLowerCase())) return "MARKET_AVAILABILITY";
  if(PHYSICAL_AREA_KEYS.some(x=>x.toLowerCase()===k.toLowerCase())) return "PHYSICAL_BUILDING_AREA";
  if(/avail.*(sf|sq|square|area)|(?:sf|sq|square|area).*avail/i.test(k)) return "MARKET_AVAILABILITY_CANDIDATE";
  if(/building.*(sf|sq|square|area|size)|(?:sf|sq|square|area|size).*building/i.test(k)) return "PHYSICAL_BUILDING_AREA_CANDIDATE";
  return null;
}
