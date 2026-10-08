export const SPATIAL_ZOOM_BANDS=Object.freeze({REGIONAL_MAX:10,MARKET_MAX:11,SITE_MIN:14});

export function spatialBandForZoom(zoom=10){
  const z=Number(zoom)||10;
  if(z<=SPATIAL_ZOOM_BANDS.REGIONAL_MAX)return'regional';
  if(z<=SPATIAL_ZOOM_BANDS.MARKET_MAX)return'market';
  if(z>=SPATIAL_ZOOM_BANDS.SITE_MIN)return'site';
  return'neighborhood';
}

export function buildSpatialClusters(properties=[],zoom=10,{selectedPropertyId=null}={}){
  const band=spatialBandForZoom(zoom);
  if(band==='neighborhood'||band==='site')return[];
  const cellSize=band==='regional'?.09:.045;
  const cells=new Map();
  for(const property of properties){
    if(property?.id===selectedPropertyId||!hasCoordinates(property))continue;
    const key=`${Math.round(Number(property.lat)/cellSize)}:${Math.round(Number(property.lng)/cellSize)}`;
    if(!cells.has(key))cells.set(key,[]);
    cells.get(key).push(property);
  }
  return[...cells.entries()].filter(([,rows])=>rows.length>1).map(([key,rows])=>Object.freeze({
    id:`cluster:${band}:${key}`,
    band,
    propertyIds:Object.freeze(rows.map(row=>row.id)),
    count:rows.length,
    lat:average(rows.map(row=>Number(row.lat))),
    lng:average(rows.map(row=>Number(row.lng))),
    availableCount:rows.filter(row=>row.status==='AVAILABLE'||row.recordType==='AVAILABLE').length,
    comparableCount:rows.filter(row=>String(row.recordType||'').includes('COMPARABLE')).length,
    totalSf:rows.reduce((sum,row)=>sum+Number(row.buildingSf||0),0)
  }));
}

export function propertyIdsInClusters(clusters=[]){return new Set(clusters.flatMap(cluster=>cluster.propertyIds));}

function hasCoordinates(row){return Number.isFinite(Number(row?.lat))&&Number.isFinite(Number(row?.lng));}
function average(values){return values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0;}
