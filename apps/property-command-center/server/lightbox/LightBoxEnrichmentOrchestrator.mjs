import{VerifiedContractRegistry}from'./VerifiedContractRegistry.mjs';
import{LightBoxEnrichmentService}from'./LightBoxEnrichmentService.mjs';

export class LightBoxEnrichmentOrchestrator{
  constructor({service=new LightBoxEnrichmentService(),registry=new VerifiedContractRegistry()}={}){
    this.service=service;
    this.registry=registry;
  }

  readiness(){
    const registry=this.registry.readiness();
    return{
      provider:'LightBox',
      mode:'GOVERNED_PROGRESSIVE_ENRICHMENT',
      canonicalAuthority:'SCIIP',
      activeContracts:registry.active.map(row=>row.id),
      pendingContracts:registry.awaiting.map(row=>row.id)
    };
  }

  async enrichSelectedProperty(subject,{requested=['parcels']}={}){
    const result={
      provider:'LightBox',
      subjectId:subject?.id||null,
      canonicalAuthority:'SCIIP',
      startedAt:new Date().toISOString(),
      enrichments:{},
      blocked:{},
      errors:{}
    };

    for(const capability of requested){
      if(capability==='parcels'){
        if(!this.registry.isActive('parcels.geometry')){
          result.blocked[capability]={code:'CONTRACT_NOT_ACTIVE'};
          continue;
        }
        const parcelResult=await this.service.parcelByPoint({
          lat:subject?.lat,lng:subject?.lng,
          subject,
          bufferDistance:100,bufferUnit:'ft',limit:10,countryCode:'us'
        });
        if(parcelResult?.ok)result.enrichments.parcels=parcelResult;
        else result.errors.parcels=parcelResult?.error||{code:'PARCEL_ENRICHMENT_FAILED'};
        continue;
      }

      const contracts=this.registry.byCapability(capability);
      const active=contracts.find(row=>row.status==='ACTIVE_VERIFIED');
      if(!active){
        result.blocked[capability]={
          code:'CONTRACT_NOT_ACTIVE',
          message:`${capability} is not ACTIVE_VERIFIED`
        };
        continue;
      }
      // This line is intentionally unreachable until a certified adapter is registered.
      result.blocked[capability]={code:'ADAPTER_NOT_CERTIFIED'};
    }
    result.completedAt=new Date().toISOString();
    return result;
  }
}
