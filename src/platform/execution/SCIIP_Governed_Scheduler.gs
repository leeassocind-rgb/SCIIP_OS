var SCIIP_GOVERNED_SCHEDULER = (function () {
  'use strict';
  function create(clock){var jobs={},runs=[];clock=clock||function(){return new Date().toISOString();};
    return {register:function(job){if(!job||!job.id||typeof job.execute!=='function')throw new Error('INVALID_JOB');if(jobs[job.id])return {status:'DUPLICATE_SAFE',jobId:job.id};jobs[job.id]=job;return {status:'REGISTERED',jobId:job.id};},
      run:function(jobId,context){var job=jobs[jobId];if(!job)throw new Error('UNKNOWN_JOB:'+jobId);if(job.reviewRequired&&!(context&&context.approved===true))return {status:'WAITING_FOR_APPROVAL',jobId:jobId};var result=job.execute(context||{});var record={jobId:jobId,status:'COMPLETED',ranAt:clock(),result:result};runs.push(record);return JSON.parse(JSON.stringify(record));},
      list:function(){return Object.keys(jobs).sort();},history:function(){return JSON.parse(JSON.stringify(runs));}};
  }
  return {create:create};
})();
