var SCIIP_ENTERPRISE_EVENT_BUS = (function () {
  'use strict';
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function create(clock){
    var handlers={}, events=[], deliveries=[], sequence=0; clock=clock||function(){return new Date().toISOString();};
    return {
      subscribe:function(topic,handler){if(!topic||typeof handler!=='function')throw new Error('INVALID_SUBSCRIPTION');handlers[topic]=handlers[topic]||[];handlers[topic].push(handler);return {status:'SUBSCRIBED',topic:topic,subscribers:handlers[topic].length};},
      publish:function(topic,payload,context){
        if(!topic)throw new Error('EVENT_TOPIC_REQUIRED');
        var event={eventId:'EVT-'+(++sequence),topic:topic,payload:clone_(payload||{}),context:clone_(context||{}),occurredAt:clock(),sequence:sequence};
        events.push(event);var subscribers=(handlers[topic]||[]).slice(), delivered=0;
        subscribers.forEach(function(handler,index){handler(clone_(event));deliveries.push({eventId:event.eventId,subscriber:index+1,status:'DELIVERED'});delivered++;});
        return {status:'PUBLISHED',event:clone_(event),delivered:delivered};
      },
      history:function(topic){return clone_(events.filter(function(e){return !topic||e.topic===topic;}));},
      deliveries:function(){return clone_(deliveries);}
    };
  }
  return {create:create};
})();
