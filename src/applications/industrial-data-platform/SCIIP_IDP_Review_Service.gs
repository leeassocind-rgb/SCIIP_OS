/** Pure review model, decisions and commit-plan preparation. */
var SCIIP_IDP_REVIEW_V7 = SCIIP_IDP_REVIEW_V7 || {};
SCIIP_IDP_REVIEW_V7.build = function(preview,existingRecords,entityIndex){
  existingRecords=existingRecords||{}; entityIndex=entityIndex||{};
  return (preview.records||[]).map(function(item){
    var current=existingRecords[item.businessKey]||null;
    var changes=current?SCIIP_IDP_CHANGE_V7.detect(item.record,current):[];
    var matches=SCIIP_IDP_ENTITY_RESOLUTION_V7.resolveRecord(item.record,entityIndex);
    var blocked=!item.validation.valid || item.classification==='DUPLICATE_IN_FILE';
    return {recordId:'REC-'+item.rowNumber+'-'+Math.abs(SCIIP_IDP_REVIEW_V7.hash(item.businessKey)),rowNumber:item.rowNumber,businessKey:item.businessKey,classification:item.classification,reviewStatus:blocked?'BLOCKED':'PENDING',record:item.record,validation:item.validation,current:current,changes:changes,entityMatches:matches};
  });
};
SCIIP_IDP_REVIEW_V7.hash = function(s){var h=0,i; s=String(s||''); for(i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;} return h;};
SCIIP_IDP_REVIEW_V7.applyDecision = function(reviewRecord,decision){
  var allowed={APPROVE:true,REJECT:true,HOLD:true}; if(!allowed[decision])throw new Error('Unsupported review decision: '+decision);
  if(reviewRecord.reviewStatus==='BLOCKED' && decision==='APPROVE')throw new Error('Blocked records cannot be approved.');
  var copy=JSON.parse(JSON.stringify(reviewRecord)); copy.reviewStatus=decision==='APPROVE'?'APPROVED':(decision==='REJECT'?'REJECTED':'HELD'); return copy;
};
SCIIP_IDP_REVIEW_V7.prepareCommitPlan = function(jobId,reviewRecords,actor){
  var operations=[],counts={approved:0,rejected:0,blocked:0,held:0};
  (reviewRecords||[]).forEach(function(r){
    if(r.reviewStatus==='APPROVED'){counts.approved++; operations.push({operationId:'OP-'+operations.length,recordId:r.recordId,businessKey:r.businessKey,operationType:r.classification==='UPDATE_CANDIDATE'?'UPDATE_PROPERTY':'CREATE_PROPERTY',after:r.record,before:r.current||null,changes:r.changes,entityMatches:r.entityMatches});}
    else if(r.reviewStatus==='REJECTED')counts.rejected++; else if(r.reviewStatus==='BLOCKED')counts.blocked++; else counts.held++;
  });
  return {planId:SCIIP_IDP_RELEASE2_V7.id('PLAN'),jobId:jobId,createdAt:SCIIP_IDP_RELEASE2_V7.now(),createdBy:actor||'UNKNOWN',status:(counts.blocked||counts.held)?'READY_WITH_EXCEPTIONS':'READY',counts:counts,operationCount:operations.length,rollbackToken:SCIIP_IDP_RELEASE2_V7.id('ROLLBACK'),operations:operations,commitExecutable:operations.length>0};
};
