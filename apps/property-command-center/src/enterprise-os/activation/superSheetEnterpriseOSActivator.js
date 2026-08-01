const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function activateSuperSheetCorpus({
  sheets=[],
  identityResolver,
  runtime,
  minimumConfidence=0.7
}={}) {
  if(!runtime?.ingestEnterpriseSnapshot)throw new Error('Enterprise OS runtime is required');
  if(typeof identityResolver!=='function')throw new Error('identityResolver is required');

  const properties=[];
  const markets=[];
  const workflows=[];
  const decisions=[];
  const risks=[];
  const opportunities=[];
  const rejected=[];
  const evidence=[];

  for(const sheet of sheets){
    for(const row of sheet.rows||[]){
      const resolved=identityResolver(row);
      const confidence=Number(resolved?.confidence||0);
      if(!resolved?.entityId||confidence<minimumConfidence){
        rejected.push(freeze({
          sheetId:sheet.sheetId,
          rowId:row.rowId||null,
          reason:'IDENTITY_CONFIDENCE_BELOW_THRESHOLD',
          confidence
        }));
        continue;
      }

      const item=freeze({
        ...clone(row),
        entityId:resolved.entityId,
        identityConfidence:confidence,
        sourceSheetId:sheet.sheetId
      });
      evidence.push(freeze({
        sourceSheetId:sheet.sheetId,
        rowId:row.rowId||null,
        entityId:resolved.entityId,
        confidence
      }));

      switch(String(row.recordType||'PROPERTY').toUpperCase()){
        case 'MARKET': markets.push(item); break;
        case 'WORKFLOW': workflows.push(item); break;
        case 'DECISION': decisions.push(item); break;
        case 'RISK': risks.push(item); break;
        case 'OPPORTUNITY': opportunities.push(item); break;
        default: properties.push(item);
      }
    }
  }

  const activationState=runtime.ingestEnterpriseSnapshot({
    portfolio:properties,
    markets,
    workflows,
    decisions,
    capital:{},
    risks,
    opportunities
  });

  return freeze({
    status:'ACTIVATED',
    activationRevision:activationState.revision,
    sheetsProcessed:sheets.length,
    recordsAccepted:evidence.length,
    recordsRejected:rejected.length,
    properties:properties.length,
    markets:markets.length,
    workflows:workflows.length,
    decisions:decisions.length,
    risks:risks.length,
    opportunities:opportunities.length,
    evidence:freeze(evidence),
    rejected:freeze(rejected),
    governed:true,
    productionExecutionAuthorized:false
  });
}
