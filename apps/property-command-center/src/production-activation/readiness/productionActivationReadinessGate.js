import fs from 'node:fs';
const freeze=value=>Object.freeze(value);
export function certifyProductionActivation({pilotReport,phase4Certified=true,productionBuildPassed=true,rollbackReady=true}={}){
  if(typeof pilotReport==='string')pilotReport=JSON.parse(fs.readFileSync(pilotReport,'utf8'));
  if(!pilotReport)throw new Error('Pilot report is required');
  const gates=freeze({
    realFilePilot:pilotReport.status==='PASSED',schemaCoverage:Number(pilotReport.schema?.coveragePct||0)>=90,
    actionableRows:Number(pilotReport.actionableRows||0)>0,controlledStaging:Number(pilotReport.stagedRows||0)>0,
    duplicateSafe:Boolean(pilotReport.duplicateSafe),approvalRequired:Boolean(pilotReport.approvalRequired),
    masterInventoryProtected:pilotReport.masterInventoryMutationAllowed===false,phase4Certified:Boolean(phase4Certified),
    productionBuildPassed:Boolean(productionBuildPassed),rollbackReady:Boolean(rollbackReady)
  });
  const passed=Object.values(gates).every(Boolean);
  return freeze({framework:'SCIIP_PHASE5_SPRINT50_PRODUCTION_ACTIVATION_READINESS',status:passed?'ACTIVATION_READY':'ACTIVATION_BLOCKED',gates,pilot:freeze({fileName:pilotReport.fileName,inputRows:pilotReport.inputRows,actionableRows:pilotReport.actionableRows,stagedRows:pilotReport.stagedRows,rejectedRows:pilotReport.rejectedRows,filteredRows:pilotReport.filteredRows,duplicateRows:pilotReport.duplicateRows,schemaCoveragePct:pilotReport.schema?.coveragePct,digest:pilotReport.digest}),activationMode:'CONTROLLED_PILOT',writebackMode:'APPROVAL_GATED',rollbackReady:Boolean(rollbackReady),autonomousConsequentialActions:'BLOCKED'});
}
