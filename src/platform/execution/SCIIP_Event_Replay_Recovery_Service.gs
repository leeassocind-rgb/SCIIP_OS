var SCIIP_EVENT_REPLAY_RECOVERY_SERVICE = (function () {
  'use strict';
  function create(){var checkpoints={},replays=[];
    return {checkpoint:function(stream,sequence){checkpoints[stream]=sequence;return {status:'CHECKPOINTED',stream:stream,sequence:sequence};},
      replay:function(stream,events,handler,options){options=options||{};var from=options.fromSequence!=null?options.fromSequence:(checkpoints[stream]||0)+1,count=0,last=checkpoints[stream]||0;(events||[]).filter(function(e){return e.sequence>=from;}).forEach(function(e){handler(JSON.parse(JSON.stringify(e)));count++;last=e.sequence;});checkpoints[stream]=last;var result={stream:stream,status:'REPLAYED',eventsReplayed:count,lastSequence:last};replays.push(result);return JSON.parse(JSON.stringify(result));},
      checkpointFor:function(stream){return checkpoints[stream]||0;},history:function(){return JSON.parse(JSON.stringify(replays));}};
  }
  return {create:create};
})();
