import{freezeDeep,normalize,uniq}from'./_shared.js';

export function createExecutiveCertificationBaseline(input={}){
  if(!input.id)throw new Error('Certification baseline id is required');
  if(!input.subjectId)throw new Error('Certification baseline subjectId is required');
  if(normalize(input.certificationStatus)!=='CERTIFIED')throw new Error('Baseline must be CERTIFIED');
  return freezeDeep({
    id:String(input.id),
    subjectId:String(input.subjectId),
    certificationId:String(input.certificationId||input.id),
    certificationStatus:'CERTIFIED',
    certifiedAt:input.certifiedAt||new Date().toISOString(),
    policyVersions:{...(input.policyVersions||{})},
    evidenceChecksums:{...(input.evidenceChecksums||{})},
    controlStatuses:{...(input.controlStatuses||{})},
    readinessScore:Number(input.readinessScore)||0,
    exceptions:[...(input.exceptions||[])],
    waivers:[...(input.waivers||[])],
    sourceSignalIds:uniq(input.sourceSignalIds)
  });
}
