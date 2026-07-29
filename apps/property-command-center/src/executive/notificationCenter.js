const rank={CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3};
export function governedNotifications(snapshot){
 return (snapshot?.priorities||[]).map((item,index)=>Object.freeze({
  id:`EXEC-NOTICE-${snapshot.assignmentId}-${index+1}`,
  severity:item.severity,
  title:item.title,
  workspace:item.workspace,
  brokerControlled:true,
  consequentialActionBlocked:true
 })).sort((a,b)=>(rank[a.severity]??9)-(rank[b.severity]??9));
}
