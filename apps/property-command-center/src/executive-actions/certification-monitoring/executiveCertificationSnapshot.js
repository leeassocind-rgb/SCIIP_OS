import{freezeDeep,normalize,uniq}from'./_shared.js';

export function createExecutiveCertificationSnapshot(input={}){
  if(!input.id)throw new Error('Monitoring snapshot id is required');
  if(!input.subjectId)throw new Error('Monitoring snapshot subjectId is required');
  return freezeDeep({
    id:String(input.id),
    subjectId:String(input.subjectId),
    observedAt:input.observedAt||new Date().toISOString(),
    policyVersions:{...(input.policyVersions||{})},
    evidenceChecksums:{...(input.evidenceChecksums||{})},
    controlStatuses:Object.fromEntries(
      Object.entries(input.controlStatuses||{}).map(([key,value])=>[key,normalize(value)])
    ),
    readinessScore:Number(input.readinessScore)||0,
    exceptions:[...(input.exceptions||[])],
    waivers:[...(input.waivers||[])],
    sourceSignalIds:uniq(input.sourceSignalIds),
    metadata:{...(input.metadata||{})}
  });
}
