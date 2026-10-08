const freeze=value=>Object.freeze(value);
export const INITIAL_REPORT_HISTORY=freeze([
 freeze({id:'RPT-A-BROOKFIELD-2026-07-22-V11',assignmentId:'A-BROOKFIELD',title:'Client Listing Report',version:11,status:'PUBLISHED',publishedAt:'2026-07-22T16:00:00-07:00',generatedBy:'Spencer Casement',filename:'Locust_Gateway_Client_Listing_Report_2026-07-22.pdf',snapshotId:'RPS-A-BROOKFIELD-2026-07-22'}),
 freeze({id:'RPT-A-BROOKFIELD-2026-07-08-V10',assignmentId:'A-BROOKFIELD',title:'Client Listing Report',version:10,status:'PUBLISHED',publishedAt:'2026-07-08T16:00:00-07:00',generatedBy:'Spencer Casement',filename:'Locust_Gateway_Client_Listing_Report_2026-07-08.pdf',snapshotId:'RPS-A-BROOKFIELD-2026-07-08'})
]);
export function nextReportVersion(history,assignmentId){return Math.max(0,...history.filter(x=>x.assignmentId===assignmentId).map(x=>Number(x.version||0)))+1;}
export function createReportRecord({assignmentId,title='Client Listing Report',filename,snapshotId,publishedAt=new Date().toISOString(),generatedBy='CURRENT_USER',history=[]}){if(!assignmentId||!filename||!snapshotId)throw new Error('Missing report record field');const version=nextReportVersion(history,assignmentId);return freeze({id:`RPT-${assignmentId}-${publishedAt}-V${version}`,assignmentId,title,version,status:'PUBLISHED',publishedAt,generatedBy,filename,snapshotId});}
export function appendReportRecord(history,record){return history.some(x=>x.id===record.id)?freeze(history):freeze([...history,record].sort((a,b)=>String(b.publishedAt).localeCompare(String(a.publishedAt))));}
export function getLastPublishedReport(history,assignmentId){return history.filter(x=>x.assignmentId===assignmentId&&x.status==='PUBLISHED').sort((a,b)=>String(b.publishedAt).localeCompare(String(a.publishedAt)))[0]||null;}
export function buildReportSnapshotId(assignmentId,publishedAt){return `RPS-${assignmentId}-${publishedAt}`;}
