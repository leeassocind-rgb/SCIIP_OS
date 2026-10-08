export function parseWktPolygon(wkt){
  if(!wkt||typeof wkt!=='string')return null;
  const match=wkt.match(/POLYGON\s*\(\((.+)\)\)/i);
  if(!match)return null;
  const points=match[1].split(',').map(token=>{
    const[lng,lat]=token.trim().split(/\s+/).map(Number);
    return Number.isFinite(lat)&&Number.isFinite(lng)?{lat,lng}:null;
  }).filter(Boolean);
  return points.length>=3?points:null;
}

export function externalParcelBoundaryFromResolution(resolution){
  const top=resolution?.top;
  const wkt=top?.boundaryWkt||
    top?.parcel?.location?.geometry?.wkt||
    top?.parcel?.geometry?.wkt||
    null;
  return parseWktPolygon(wkt);
}
