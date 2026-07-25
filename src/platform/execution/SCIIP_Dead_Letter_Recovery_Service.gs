var SCIIP_DEAD_LETTER_RECOVERY_SERVICE = (function () {
  'use strict';
  function create(broker){var recoveries=[];
    return {recover:function(queue,validator){var dead=broker.inspect(queue+'.dead-letter'),recovered=0,rejected=0;dead.forEach(function(msg){if(!validator||validator(msg)){broker.enqueue(queue,msg.payload);recovered++;}else rejected++;});var record={queue:queue,recovered:recovered,rejected:rejected,reviewRequired:true};recoveries.push(record);return JSON.parse(JSON.stringify(record));},history:function(){return JSON.parse(JSON.stringify(recoveries));}};
  }
  return {create:create};
})();
