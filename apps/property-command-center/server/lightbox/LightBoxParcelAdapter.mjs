import{buildPropertyConflictReport}from'./EnrichmentConflictService.mjs';
import{resolveParcelCandidate}from'./LightBoxParcelResolution.mjs';
import{LightBoxHttpClient}from'./LightBoxHttpClient.mjs';
import{LIGHTBOX_CONTRACTS}from'./contracts.mjs';

const finite=value=>Number.isFinite(Number(value));
const pointWkt=({lat,lng})=>{
  if(!finite(lat)||!finite(lng))throw new Error('Finite lat/lng are required');
  return`POINT(${Number(lng)} ${Number(lat)})`;
};

export class LightBoxParcelAdapter{
  constructor(client=new LightBoxHttpClient()){
    this.client=client;
    this.contract=LIGHTBOX_CONTRACTS.parcelsGeometry;
  }

  async queryByPoint({lat,lng,bufferDistance=100,bufferUnit='ft',limit=10,countryCode='us',subject=null}){
    const wkt=pointWkt({lat,lng});
    const result=await this.client.request({
      method:'GET',
      path:`/parcels/${encodeURIComponent(countryCode)}/geometry`,
      query:{wkt,bufferDistance,bufferUnit,limit}
    });
    const normalized=this.#normalize(result,{wkt,countryCode,bufferDistance,bufferUnit,limit});
    if(normalized.ok&&subject){
      normalized.resolution=resolveParcelCandidate(subject,normalized.parcels);
      normalized.conflictReport=buildPropertyConflictReport(subject,normalized.resolution);
    }
    return normalized;
  }

  #normalize(result,request){
    if(!result.ok)return{provider:'lightbox',contract:this.contract.id,request,...result};
    const payload=result.data||{};
    const parcels=Array.isArray(payload.parcels)?payload.parcels:
      Array.isArray(payload.data)?payload.data:
      Array.isArray(payload)?payload:[];
    return{
      ok:true,
      status:result.status,
      provider:'lightbox',
      contract:this.contract.id,
      request,
      recordCount:parcels.length,
      parcels,
      rawMetadata:payload.$metadata||payload.metadata||null
    };
  }
}

export{pointWkt};
