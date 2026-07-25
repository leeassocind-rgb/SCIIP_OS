var SCIIP_TRANSACTION_COORDINATOR = (function () {
  'use strict';
  function create() {
    var ledger = [], counter = 0;
    return {
      run: function (work, context) {
        if (typeof work !== 'function') throw new Error('TRANSACTION_WORK_REQUIRED');
        var transactionId='TXN-' + (++counter), startedAt=new Date().toISOString();
        try {
          var result=work({ transactionId:transactionId, context:context || {}, addCompensation:function(fn){ this.compensations=this.compensations||[]; this.compensations.push(fn); } });
          ledger.push({ transactionId:transactionId, status:'COMMITTED', startedAt:startedAt, completedAt:new Date().toISOString() });
          return { transactionId:transactionId, status:'COMMITTED', result:result };
        } catch (error) {
          ledger.push({ transactionId:transactionId, status:'ROLLED_BACK', startedAt:startedAt, completedAt:new Date().toISOString(), error:String(error.message || error) });
          return { transactionId:transactionId, status:'ROLLED_BACK', error:String(error.message || error) };
        }
      },
      ledger:function(){return JSON.parse(JSON.stringify(ledger));}
    };
  }
  return { create:create };
})();
