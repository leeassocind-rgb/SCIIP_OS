const empty = value => value === null || value === undefined || String(value).trim() === '';
const number = value => {
  if(empty(value)) return null;
  const parsed=Number(String(value).replace(/[$,%\s]/g,'').replace(/,/g,''));
  return Number.isFinite(parsed)?parsed:null;
};
const text = value => empty(value)?null:String(value).trim();
const title = value => text(value)?.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()) ?? null;
const upper = value => text(value)?.toUpperCase() ?? null;

export function normalizeRow(raw,mapping,rowNumber){
  const row={};
  mapping.mappings.forEach(({index,canonical})=>{row[canonical]=raw[index]});
  const normalized={
    propertyId:text(row.propertyId), address:text(row.address), city:title(row.city), state:upper(row.state), postalCode:text(row.postalCode),
    buildingSf:number(row.buildingSf), availableSf:number(row.availableSf), landAcres:number(row.landAcres), clearHeightFt:number(row.clearHeightFt),
    dockHighDoors:number(row.dockHighDoors), powerAmps:number(row.powerAmps), askingRate:number(row.askingRate), status:title(row.status),
    latitude:number(row.latitude), longitude:number(row.longitude), source:text(row.source), updatedAt:text(row.updatedAt), sourceRow:rowNumber
  };
  const errors=[]; const warnings=[];
  if(!normalized.address) errors.push('Address is required');
  if(normalized.latitude!==null && (normalized.latitude < -90 || normalized.latitude > 90)) errors.push('Latitude is outside valid range');
  if(normalized.longitude!==null && (normalized.longitude < -180 || normalized.longitude > 180)) errors.push('Longitude is outside valid range');
  ['buildingSf','availableSf','landAcres','clearHeightFt','dockHighDoors','powerAmps'].forEach(field=>{if(normalized[field]!==null&&normalized[field]<0)errors.push(`${field} cannot be negative`)});
  if(!normalized.city) warnings.push('City is missing');
  if(!normalized.state) warnings.push('State is missing');
  return {raw,normalized,errors,warnings,status:errors.length?'REJECTED':warnings.length?'WARNING':'ACCEPTED'};
}

export function buildBusinessKey(row){
  return [row.address,row.city,row.state,row.postalCode].map(value=>String(value??'').trim().toLowerCase()).join('|');
}

export function normalizeBatch(rows,mapping){
  const seen=new Map();
  return rows.map((raw,index)=>{
    const result=normalizeRow(raw,mapping,index+2);
    if(result.status!=='REJECTED'){
      const key=buildBusinessKey(result.normalized);
      if(seen.has(key)){result.warnings.push(`Duplicate candidate of source row ${seen.get(key)}`);result.status='WARNING';}
      else seen.set(key,result.normalized.sourceRow);
    }
    return result;
  });
}
