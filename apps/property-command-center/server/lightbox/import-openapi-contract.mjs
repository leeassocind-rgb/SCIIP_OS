import fs from'node:fs';
import path from'node:path';
import{fileURLToPath}from'node:url';
import{analyzeOpenApiContract}from'./OpenApiContractIntake.mjs';

const file=process.argv[2];
if(!file){
  console.error('Usage: node server/lightbox/import-openapi-contract.mjs <openapi.json>');
  process.exit(2);
}
const abs=path.resolve(file);
const analysis=analyzeOpenApiContract(abs);
const here=path.dirname(fileURLToPath(import.meta.url));
const reports=path.join(here,'openapi','reports');
fs.mkdirSync(reports,{recursive:true});
const out=path.join(reports,`${path.basename(file).replace(/\.json$/i,'')}.review.json`);
fs.writeFileSync(out,JSON.stringify({
  framework:'SCIIP_LIGHTBOX_OPENAPI_CONTRACT_INTAKE',
  generatedAt:new Date().toISOString(),
  source:abs,
  ...analysis
},null,2)+'\n');
console.log(JSON.stringify({
  framework:'SCIIP_LIGHTBOX_OPENAPI_CONTRACT_INTAKE',
  status:analysis.status,
  operationCount:analysis.operationCount,
  capabilities:analysis.capabilities,
  report:out
},null,2));
