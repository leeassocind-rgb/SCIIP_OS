const DATE_PATTERN=/(?:^|[-_])(\d{1,2})[-_](\d{1,2})[-_](\d{4})(?:\D|$)/;
export function parseReportDate(fileName=''){
 const match=String(fileName).match(DATE_PATTERN);if(!match)return null;
 const month=Number(match[1]),day=Number(match[2]),year=Number(match[3]);
 const date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
 return date.toISOString().slice(0,10);
}
export async function sha256File(file){
 const bytes=await file.arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
}
export function createDocumentId({fingerprint,reportDate,fileName}){
 const token=(fingerprint||fileName||'unknown').slice(0,16).toUpperCase();
 return `SUPERSHEET-${reportDate||'UNDATED'}-${token}`;
}
export async function inspectPdf(file){
 if(!file||!String(file.name).toLowerCase().endsWith('.pdf'))throw new Error('Daily SuperSheet upload requires a PDF file.');
 const buffer=await file.arrayBuffer();const text=new TextDecoder('latin1').decode(buffer);
 const pageCount=Math.max(1,(text.match(/\/Type\s*\/Page\b/g)||[]).length);
 const fingerprint=await sha256File(file);const reportDate=parseReportDate(file.name);
 return Object.freeze({documentId:createDocumentId({fingerprint,reportDate,fileName:file.name}),fileName:file.name,reportDate,fingerprint,pageCount,fileSize:file.size,mimeType:file.type||'application/pdf'});
}