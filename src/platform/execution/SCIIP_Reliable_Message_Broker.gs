var SCIIP_RELIABLE_MESSAGE_BROKER = (function () {
  'use strict';
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function create(options){
    options=options||{};var queues={}, acknowledgements=[], counter=0, maxAttempts=options.maxAttempts||3;
    function queue_(name){queues[name]=queues[name]||[];return queues[name];}
    return {
      enqueue:function(queue,message){var envelope={messageId:'MSG-'+(++counter),queue:queue,payload:clone_(message||{}),attempts:0,status:'READY'};queue_(queue).push(envelope);return clone_(envelope);},
      consume:function(queue,handler){var q=queue_(queue);if(!q.length)return {status:'EMPTY'};var msg=q.shift();msg.attempts++;
        try{var result=handler(clone_(msg));msg.status='ACKNOWLEDGED';acknowledgements.push({messageId:msg.messageId,status:'ACKNOWLEDGED',attempts:msg.attempts});return {status:'ACKNOWLEDGED',message:clone_(msg),result:clone_(result)};}
        catch(error){msg.status=msg.attempts>=maxAttempts?'DEAD_LETTERED':'RETRY';acknowledgements.push({messageId:msg.messageId,status:msg.status,attempts:msg.attempts,error:String(error.message||error)});if(msg.status==='RETRY')q.push(msg);else queue_(queue+'.dead-letter').push(msg);return {status:msg.status,message:clone_(msg),error:String(error.message||error)};}
      },
      depth:function(queue){return queue_(queue).length;},
      inspect:function(queue){return clone_(queue_(queue));},
      acknowledgements:function(){return clone_(acknowledgements);}
    };
  }
  return {create:create};
})();
