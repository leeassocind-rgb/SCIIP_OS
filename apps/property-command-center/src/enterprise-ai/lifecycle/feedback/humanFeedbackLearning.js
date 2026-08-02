const freeze=v=>Object.freeze(v);
export function processHumanFeedback({feedback=[]}={}){
 const accepted=feedback.filter(f=>f.status==='ACCEPTED');
 const rejected=feedback.filter(f=>f.status==='REJECTED');
 const corrections=feedback.filter(f=>f.correction);
 return freeze({
  total:feedback.length,accepted:accepted.length,rejected:rejected.length,corrections:corrections.length,
  learningSignals:freeze(corrections.map((f,i)=>freeze({signalId:`FB-${String(i+1).padStart(4,'0')}`,subjectId:f.subjectId,correction:f.correction,reviewer:f.reviewer}))),
  humanReviewed:true,trainingApprovalRequired:true,autoTrain:false,permanentHistory:true
 });
}
