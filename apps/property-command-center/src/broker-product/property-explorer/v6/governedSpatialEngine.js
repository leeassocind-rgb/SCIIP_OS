const EARTH_RADIUS_FT=20902231;

export function haversineFeet(a,b){
  if(!a||!b)return Infinity;
  const lat1=Number(a.lat),lng1=Number(a.lng),lat2=Number(b.lat),lng2=Number(b.lng);
  if(![lat1,lng1,lat2,lng2].every(Number.isFinite))return Infinity;
  const toRad=value=>value*Math.PI/180;
  const dLat=toRad(lat2-lat1),dLng=toRad(lng2-lng1);
  const q=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2*EARTH_RADIUS_FT*Math.asin(Math.sqrt(q));
}

function points(path=[]){
  const safePath=Array.isArray(path)?path:[];
  return safePath
    .map(item=>Array.isArray(item)?{lng:Number(item[0]),lat:Number(item[1])}:{lat:Number(item?.lat),lng:Number(item?.lng)})
    .filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
}

export function polygonBounds(path=[]){
  const pts=points(path);
  if(!pts.length)return null;
  return pts.reduce((b,p)=>({
    minLat:Math.min(b.minLat,p.lat),maxLat:Math.max(b.maxLat,p.lat),
    minLng:Math.min(b.minLng,p.lng),maxLng:Math.max(b.maxLng,p.lng)
  }),{minLat:Infinity,maxLat:-Infinity,minLng:Infinity,maxLng:-Infinity});
}

function boundsGapFeet(a,b){
  if(!a||!b)return Infinity;
  const latGap=Math.max(0,a.minLat-b.maxLat,b.minLat-a.maxLat);
  const lngGap=Math.max(0,a.minLng-b.maxLng,b.minLng-a.maxLng);
  const latMid=(Math.max(a.minLat,b.minLat)+Math.min(a.maxLat,b.maxLat))/2 || (a.minLat+b.minLat)/2;
  const latFt=latGap*364000;
  const lngFt=lngGap*364000*Math.cos(latMid*Math.PI/180);
  return Math.hypot(latFt,lngFt);
}

export function buildGovernedNeighborContext(subject,properties,{maxFeet=5280,adjacencyToleranceFeet=45,limit=24}={}){
  if(!subject)return{neighbors:[],summary:{adjacent:0,nearby:0,total:0}};
  const subjectBounds=polygonBounds(subject.boundaryPath);
  const rows=[];
  for(const property of properties||[]){
    if(!property||property.id===subject.id)continue;
    const centroidFeet=haversineFeet(subject,property);
    const boundaryGap=boundsGapFeet(subjectBounds,polygonBounds(property.boundaryPath));
    const distanceFeet=Math.min(centroidFeet,boundaryGap);
    if(distanceFeet>maxFeet)continue;
    const adjacent=Number.isFinite(boundaryGap)&&boundaryGap<=adjacencyToleranceFeet;
    rows.push({
      property,
      propertyId:property.id,
      relationshipType:adjacent?'ADJOINING':'NEARBY',
      distanceFeet:adjacent?0:Math.round(distanceFeet),
      boundaryGapFeet:Number.isFinite(boundaryGap)?Math.round(boundaryGap):null,
      spatialEvidence:Boolean(property.boundaryPath?.length&&subject.boundaryPath?.length),
      provenanceStatus:property.provenance?.gateStatus||property.provenance?.status||'UNVERIFIED'
    });
  }
  rows.sort((a,b)=>a.distanceFeet-b.distanceFeet||String(a.property.address).localeCompare(String(b.property.address)));
  const neighbors=rows.slice(0,limit);
  return{
    neighbors,
    summary:{
      adjacent:neighbors.filter(row=>row.relationshipType==='ADJOINING').length,
      nearby:neighbors.filter(row=>row.relationshipType==='NEARBY').length,
      total:neighbors.length
    }
  };
}

export function statusSymbol(property){
  const type=String(property?.recordType||'BASE_INVENTORY').toUpperCase();
  const status=String(property?.status||'').toUpperCase();
  if(type==='LEASE_COMPARABLE'||type==='SALE_COMPARABLE')return'comparable';
  if(type==='AVAILABLE'||status.includes('AVAILABLE'))return'available';
  if(status.includes('CONSTRUCTION'))return'construction';
  if(property?.assignment)return'assignment';
  return'base';
}

export function propertySpatialIdentity(property){
  return{
    id:property?.id||null,
    apn:property?.parcelId||property?.apn||null,
    hasBoundary:Array.isArray(property?.boundaryPath)&&property.boundaryPath.length>=3,
    source:property?.provenance?.geometrySource?.file||null,
    sourceType:property?.provenance?.sourceType||null,
    verified:(property?.provenance?.gateStatus||property?.provenance?.status)==='VERIFIED'
  };
}
