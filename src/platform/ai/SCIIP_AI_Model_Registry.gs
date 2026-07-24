var SCIIP_AI_MODEL_REGISTRY = (function(){
  var models={};
  function register(m){if(!m||!m.id||!m.version)throw new Error('MODEL_ID_VERSION_REQUIRED');var k=m.id+'@'+m.version;if(models[k])return models[k];models[k]={id:m.id,version:m.version,provider:m.provider||'INTERNAL',capabilities:(m.capabilities||[]).slice(),status:m.status||'APPROVED',maxTokens:m.maxTokens||4096};return models[k];}
  function resolve(id,version){var m=models[id+'@'+version];if(!m||m.status!=='APPROVED')throw new Error('MODEL_NOT_APPROVED');return m;}
  function list(){return Object.keys(models).sort().map(function(k){return models[k];});}
  return {register:register,resolve:resolve,list:list,reset:function(){models={};}};
})();
