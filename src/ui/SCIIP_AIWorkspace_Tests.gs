/** SCIIP_OS v7.0 AI Workspace Alpha Apps Script regression. */
function sciipTestAiWorkspaceAlphaV7() {
  var snapshot=SCIIP_AI_WORKSPACE.snapshot();
  var response=SCIIP_AI_WORKSPACE.ask({prompt:'Show industrial properties in Rialto with at least 4,000 amps.'});
  var failures=[];
  if(!snapshot||snapshot.status!=='AVAILABLE')failures.push('AI Workspace did not report AVAILABLE.');
  if(!snapshot.sources||snapshot.sources.length<4)failures.push('Grounding sources are missing.');
  if(!response||response.status!=='COMPLETED')failures.push('Prompt did not complete.');
  if(response.intent!=='PROPERTY_ANALYSIS')failures.push('Property intent was not detected.');
  if(!response.grounding||response.grounding.liveModel!==false)failures.push('Alpha grounding disclosure is invalid.');
  if(typeof sciipAiWorkspaceSnapshot!=='function')failures.push('AI snapshot entry point is missing.');
  if(typeof sciipAiWorkspaceAsk!=='function')failures.push('AI ask entry point is missing.');
  var output={framework:'SCIIP_AI_WORKSPACE_ALPHA_TEST',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',failures:failures,snapshot:snapshot,response:response};
  console.log(JSON.stringify(output));
  if(failures.length)throw new Error(failures.join(' | '));
  return output;
}
