export class GuardedCapabilityAdapter{
  constructor(contract){
    this.contract=contract;
  }

  async enrich(){
    return{
      ok:false,
      status:501,
      provider:'lightbox',
      contract:this.contract.id,
      error:{
        code:'LIGHTBOX_SCHEMA_REQUIRED',
        message:`${this.contract.id} is catalog-confirmed but its endpoint schema has not yet been imported and verified.`
      }
    };
  }
}
