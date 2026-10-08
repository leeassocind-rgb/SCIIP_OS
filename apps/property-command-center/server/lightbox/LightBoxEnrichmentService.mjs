import{LightBoxCache}from'./LightBoxCache.mjs';
import{LIGHTBOX_CONTRACTS,contractStatus}from'./contracts.mjs';
import{LightBoxParcelAdapter}from'./LightBoxParcelAdapter.mjs';
import{GuardedCapabilityAdapter}from'./GuardedCapabilityAdapter.mjs';

export class LightBoxEnrichmentService{
  constructor({parcelAdapter=new LightBoxParcelAdapter(),cache=new LightBoxCache()}={}){
    this.cache=cache;
    this.adapters={
      parcels:parcelAdapter,
      structures:new GuardedCapabilityAdapter(LIGHTBOX_CONTRACTS.structures),
      assessment:new GuardedCapabilityAdapter(LIGHTBOX_CONTRACTS.assessment),
      trueOwner:new GuardedCapabilityAdapter(LIGHTBOX_CONTRACTS.trueOwner),
      zoning:new GuardedCapabilityAdapter(LIGHTBOX_CONTRACTS.zoning),
      transactions:new GuardedCapabilityAdapter(LIGHTBOX_CONTRACTS.transactions),
      locationInfo:new GuardedCapabilityAdapter(LIGHTBOX_CONTRACTS.locationInfo),
      environmental:new GuardedCapabilityAdapter(LIGHTBOX_CONTRACTS.environmental)
    };
  }

  health(){
    return{
      provider:'lightbox',
      identityBackbone:'parcels',
      contracts:contractStatus(),
      policy:'NO_UNVERIFIED_ENDPOINT_CALLS'
    };
  }

  async parcelByPoint(input){
    const key=`parcel:${Number(input?.lat).toFixed(6)}:${Number(input?.lng).toFixed(6)}:${input?.bufferDistance||100}:${input?.bufferUnit||'ft'}`;
    const cached=this.cache.get(key);
    if(cached)return{...cached,cache:{hit:true,...this.cache.stats()}};
    const result=await this.adapters.parcels.queryByPoint(input);
    if(result?.ok)this.cache.set(key,result);
    return{...result,cache:{hit:false,...this.cache.stats()}};
  }

  async capability(id,input){
    const adapter=this.adapters[id];
    if(!adapter)return{ok:false,status:404,error:{code:'UNKNOWN_LIGHTBOX_CAPABILITY',message:`Unknown capability: ${id}`}};
    if(id==='parcels')return this.parcelByPoint(input);
    return adapter.enrich(input);
  }
}
