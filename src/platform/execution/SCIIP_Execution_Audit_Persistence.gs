var SCIIP_EXECUTION_AUDIT_PERSISTENCE = (function () {
  'use strict';
  function create(){var records={},order=[];
    return {append:function(record){if(!record||!record.businessKey)throw new Error('BUSINESS_KEY_REQUIRED');if(records[record.businessKey])return {status:'DUPLICATE_SAFE',businessKey:record.businessKey};records[record.businessKey]=JSON.parse(JSON.stringify(record));order.push(record.businessKey);return {status:'APPENDED',businessKey:record.businessKey};},
      list:function(){return order.map(function(k){return JSON.parse(JSON.stringify(records[k]));});},count:function(){return order.length;}};
  }
  return {create:create};
})();
