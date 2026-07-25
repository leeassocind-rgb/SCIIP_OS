/** Persists immutable commit plans; execution is reserved for Release 3. */
var SCIIP_IDP_COMMIT_PREP_V7 = SCIIP_IDP_COMMIT_PREP_V7 || {};
SCIIP_IDP_COMMIT_PREP_V7.persistPlan = function(jobId,reviewRecords,actor){
  var plan=SCIIP_IDP_REVIEW_V7.prepareCommitPlan(jobId,reviewRecords,actor);
  SCIIP_IDP_PERSISTENCE_V7.appendObject(SCIIP_IDP_RELEASE2_V7.SHEETS.COMMIT_PLANS,SCIIP_IDP_RELEASE2_V7.HEADERS.COMMIT_PLANS,{planId:plan.planId,jobId:jobId,createdAt:plan.createdAt,createdBy:plan.createdBy,status:plan.status,approvedCount:plan.counts.approved,rejectedCount:plan.counts.rejected,blockedCount:plan.counts.blocked,operationCount:plan.operationCount,rollbackToken:plan.rollbackToken,operationsJson:SCIIP_IDP_RELEASE2_V7.json(plan.operations)});
  SCIIP_IDP_PERSISTENCE_V7.appendHistory(jobId,'COMMIT_PLAN_PREPARED',plan.status,actor,{planId:plan.planId,operationCount:plan.operationCount,rollbackToken:plan.rollbackToken}); return plan;
};
