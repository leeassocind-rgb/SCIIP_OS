const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
export function certifyDocument(document){
 const dimensions={identity:document.documentId?100:0,reportDate:document.reportDate?100:40,pdfIntegrity:document.mimeType==='application/pdf'&&document.fileSize>0?100:0,pageProvenance:document.pageCount>0?100:25,namingConvention:/AIR-CRE-SuperSheets/i.test(document.fileName)?100:70,fingerprint:document.fingerprint?.length===64?100:0};
 const score=clamp(Object.values(dimensions).reduce((a,b)=>a+b,0)/Object.keys(dimensions).length);
 const status=score>=90?'CERTIFIED':score>=75?'STAGED':'REVIEW_REQUIRED';
 const gates={documentRegistered:true,immutableSource:true,pageLevelExtraction:'PENDING',temporalResolution:'PENDING',graphProjection:'BLOCKED_UNTIL_EXTRACTION',aiReadiness:'BLOCKED_UNTIL_EVIDENCE'};
 return Object.freeze({...document,certification:Object.freeze({score,status,dimensions:Object.freeze(dimensions),gates:Object.freeze(gates),certifiedAt:new Date().toISOString()})});
}
export function summarizeCertifications(documents=[]){
 const counts={CERTIFIED:0,STAGED:0,REVIEW_REQUIRED:0};documents.forEach(d=>{const s=d.certification?.status||'REVIEW_REQUIRED';counts[s]=(counts[s]||0)+1});
 const averageScore=documents.length?Math.round(documents.reduce((n,d)=>n+(d.certification?.score||0),0)/documents.length):0;
 return Object.freeze({documents:documents.length,...counts,averageScore,latestReportDate:documents.map(d=>d.reportDate).filter(Boolean).sort().at(-1)||null});
}