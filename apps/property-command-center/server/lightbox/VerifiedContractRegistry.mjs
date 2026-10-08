import fs from'node:fs';
import path from'node:path';
import{fileURLToPath}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const manifestPath=path.join(here,'openapi','verified-contracts.json');

export class VerifiedContractRegistry{
  constructor(filePath=manifestPath){
    this.filePath=filePath;
    this.reload();
  }
  reload(){
    this.manifest=JSON.parse(fs.readFileSync(this.filePath,'utf8'));
    return this;
  }
  get(id){return this.manifest.contracts?.[id]||null;}
  byCapability(capability){
    return Object.entries(this.manifest.contracts||{})
      .filter(([,row])=>row.capability===capability)
      .map(([id,row])=>({id,...row}));
  }
  isActive(id){return this.get(id)?.status==='ACTIVE_VERIFIED';}
  readiness(){
    const rows=Object.entries(this.manifest.contracts||{}).map(([id,row])=>({id,...row}));
    return{
      active:rows.filter(row=>row.status==='ACTIVE_VERIFIED'),
      awaiting:rows.filter(row=>row.status!=='ACTIVE_VERIFIED'),
      total:rows.length
    };
  }
}
