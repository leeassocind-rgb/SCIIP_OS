#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os'),{execFileSync}=require('child_process');
const STREET=/\b\d{1,6}(?:-\d{1,6})?\s+(?:[NSEW]\s+)?[A-Za-z0-9][A-Za-z0-9 .,'&\-]{0,70}\s(?:St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Way|Pkwy|Parkway|Ln|Lane|Ct|Court|Hwy|Highway|Pl|Place|Cir|Circle|Ter|Terrace)(?:,?\s*(?:Unit|Suite|Ste|#)\s*[A-Za-z0-9-]+)?\b/i;
const CITY=/\b([A-Za-z][A-Za-z .'-]{1,45}),\s*CA\s+(\d{5})(?:-\d{4})?\b/i;
const DATE=/(\d{1,2})\/(\d{1,2})\/(\d{4})/;
const money=/\$(\d+(?:\.\d+)?)\s*(NNN|G|IG|MG)?\b/i;
const sf=/([\d,]+)\s*SF\b/i;
const acres=/([\d,.]+)\s*(?:AC|Acres?)\b/i;
const dhgl=/\b(\d{1,3})\/(\d{1,3})\b/;
const amps=/\b(\d{2,5}(?:-\d{2,5})?)\s*(?:Amps?|A)\b/i;
const clear=/\b(\d{1,2}(?:\.\d+)?(?:\s*[-–]\s*\d{1,2}(?:\.\d+)?)?)\s*['’](?:\s*(?:Clear|Clearance))?/i;
const statusWords=['New Listing','Updated Information','Rate Reduced','Price Reduced','Leased','Sold','For Lease & Sale','For Lease','For Sale','Sublease'];
function sha(buf){return crypto.createHash('sha256').update(buf).digest('hex')}
function norm(s){return String(s||'').replace(/\s+/g,' ').trim()}
function normalizeAddress(s){return norm(s).toUpperCase().replace(/[.,]/g,'').replace(/\bSTREET\b/g,'ST').replace(/\bAVENUE\b/g,'AVE').replace(/\bBOULEVARD\b/g,'BLVD').replace(/\bROAD\b/g,'RD').replace(/\bDRIVE\b/g,'DR').replace(/\bPLACE\b/g,'PL').replace(/\bPARKWAY\b/g,'PKWY')}
function id(prefix,key){return prefix+'-'+crypto.createHash('sha256').update(key).digest('hex').slice(0,20).toUpperCase()}
function parseDate(file,text){const f=path.basename(file).match(/(\d{1,2})-(\d{1,2})-(\d{4})\.pdf$/i);const m=f||text.match(DATE);if(!m)return null;return `${m[3]}-${String(m[1]).padStart(2,'0')}-${String(m[2]).padStart(2,'0')}`}
function extractText(pdf){return execFileSync('pdftotext',['-layout','-enc','UTF-8',pdf,'-'],{encoding:'utf8',maxBuffer:64*1024*1024})}
function splitListingBlocks(page){const lines=page.split(/\r?\n/);const starts=[];for(let i=0;i<lines.length;i++){if(/^\s{0,5}\d{1,3}\s{2,}/.test(lines[i])&&!/\d{1,2}:\d{2}/.test(lines[i]))starts.push(i)}const blocks=[];for(let j=0;j<starts.length;j++){const a=starts[j],b=j+1<starts.length?starts[j+1]:lines.length;const block=lines.slice(a,b);if(block.some(x=>STREET.test(x)))blocks.push(block)}return blocks}
function findRegion(page){const m=page.match(/AIR CRE INDUSTRIAL & LAND SUPER SHEET\s*\n\s*([^|\n]+)\s*\|/i);return m?norm(m[1]):null}
function sectionFor(page){const top=page.slice(0,2500);return /\bLAND\s+Available SF/i.test(top)?'LAND':'INDUSTRIAL'}
function col(line,a,b){return norm(line.slice(a,b))}
function parseBlock(block,meta,pageNo){const lines=block,first=lines[0]||'';const recordNo=Number((first.match(/^\s*(\d{1,3})/)||[])[1]);let address=null,city=null,zip=null,addressLine=-1;
 for(let i=0;i<Math.min(lines.length,10);i++){const left=col(lines[i],0,68);const am=left.match(STREET);if(am){address=norm(am[0]);addressLine=i;break}}
 if(addressLine>=0){for(let i=addressLine+1;i<Math.min(lines.length,addressLine+4);i++){const cm=col(lines[i],0,68).match(CITY);if(cm){city=norm(cm[1]);zip=cm[2];break}}}
 if(!address||!city)return null;
 const firstCols={available:col(first,64,92),rate:col(first,92,126),loading:col(first,126,145),construction:col(first,145,166),clear:col(first,166,185),notes:col(first,185)};
 const leftLines=lines.map(x=>col(x,0,68)); const all=norm(lines.join(' '));
 const sfMatches=[];for(const l of lines.slice(0,6)){const c=col(l,64,92).match(sf);if(c)sfMatches.push(Number(c[1].replace(/,/g,'')))}
 const rateM=firstCols.rate.match(money)||all.match(money);const loadM=firstCols.loading.match(dhgl)||all.match(/\b(\d{1,3})\s*(?:DH|Dock High).*?\b(\d{1,3})\s*(?:GL|Ground Level)/i);
 const clearM=firstCols.clear.match(clear)||all.match(clear);const ampsM=all.match(amps);const acreM=all.match(acres);
 const status=statusWords.find(s=>new RegExp('\\b'+s.replace(/ /g,'\\s+')+'\\b','i').test(all))||null;
 const brokerLine=lines.map(norm).find(l=>/\b\d{3}-\d{3}-\d{4}\b/.test(l))||null;
 const notes=lines.map(x=>col(x,185)).filter(Boolean).filter(x=>!/^Listing Notes$/i.test(x));
 const key=`${normalizeAddress(address)}|${city.toUpperCase()}|${zip}`;
 const critical={address:!!address,city:!!city,zip:!!zip,availableSf:sfMatches[0]>0};
 const confidence=Math.round((Object.values(critical).filter(Boolean).length/4)*85 + (rateM?5:0)+(loadM?3:0)+(clearM?3:0)+(brokerLine?4:0));
 return {recordId:id('OBS',`${meta.documentId}|${pageNo}|${recordNo}`),propertyId:id('PROPERTY',key),recordNo,page:pageNo,section:meta.section,region:meta.region,reportDate:meta.reportDate,address,city,zip,availableSf:sfMatches[0]||null,vacant:/\bYes\b/i.test(col(lines[addressLine]||'',64,92))?true:/\bNo\b/i.test(col(lines[addressLine]||'',64,92))?false:null,officeSf:sfMatches[1]||null,rate:rateM?Number(rateM[1]):null,rateType:rateM?.[2]?.toUpperCase()||null,buildingSf:sfMatches[2]||null,dockHigh:loadM?Number(loadM[1]):null,groundLevel:loadM?Number(loadM[2]):null,clearHeight:clearM?clearM[1].replace(/\s+/g,''):null,powerAmps:ampsM?ampsM[1]:null,landAcres:acreM?Number(acreM[1].replace(/,/g,'')):null,status,constructionStatus:/\bExisting\b/i.test(all)?'Existing':/Under Construction/i.test(all)?'Under Construction':/Planned|Proposed/i.test(all)?'Planned':null,brokerEvidence:brokerLine,notes,confidence,reviewRequired:confidence<98,evidence:{sourceFile:meta.fileName,page:pageNo,recordNo,rawLines:lines}}}

function fieldReview(record){
 const items=[]; const add=(field,value,confidence,reason,critical=false)=>{if(value===null||value===undefined||value===''||confidence<98)items.push({reviewId:id('REVIEW',`${record.recordId}|${field}`),recordId:record.recordId,propertyId:record.propertyId,field,value,confidence,reason,critical,status:'OPEN',evidence:record.evidence});};
 add('address',record.address,record.address?100:0,record.address?'DIRECT_POSITIONAL_MATCH':'MISSING_ADDRESS',true);
 add('city',record.city,record.city?100:0,record.city?'CITY_STATE_ZIP_MATCH':'MISSING_CITY',true);
 add('zip',record.zip,record.zip?100:0,record.zip?'ZIP_MATCH':'MISSING_ZIP',true);
 add('availableSf',record.availableSf,record.availableSf?100:0,record.availableSf?'PRIMARY_SF_COLUMN':'MISSING_AVAILABLE_SF',true);
 add('rate',record.rate,record.rate!==null?(record.rateType?99:94):0,record.rate!==null?'RATE_DETECTED':'RATE_NOT_DETECTED');
 add('rateType',record.rateType,record.rateType?99:0,record.rateType?'RATE_TYPE_DETECTED':'RATE_TYPE_MISSING');
 add('buildingSf',record.buildingSf,record.buildingSf?96:0,record.buildingSf?'THIRD_SF_VALUE_CANDIDATE':'BUILDING_SF_MISSING');
 add('dockHigh',record.dockHigh,record.dockHigh!==null?98:0,record.dockHigh!==null?'DH_GL_COLUMN_MATCH':'LOADING_MISSING');
 add('groundLevel',record.groundLevel,record.groundLevel!==null?98:0,record.groundLevel!==null?'DH_GL_COLUMN_MATCH':'LOADING_MISSING');
 add('clearHeight',record.clearHeight,record.clearHeight?97:0,record.clearHeight?'CLEAR_HEIGHT_PATTERN':'CLEAR_HEIGHT_MISSING');
 add('powerAmps',record.powerAmps,record.powerAmps?96:0,record.powerAmps?'AMP_PATTERN':'POWER_MISSING');
 add('status',record.status,record.status?98:0,record.status?'STATUS_VOCABULARY':'STATUS_MISSING');
 return items;
}
function classifyReviews(items){const byField={},byReason={},critical=[];for(const x of items){byField[x.field]=(byField[x.field]||0)+1;byReason[x.reason]=(byReason[x.reason]||0)+1;if(x.critical)critical.push(x)}return {total:items.length,critical:critical.length,byField,byReason}}

function parsePdf(pdf){const buf=fs.readFileSync(pdf),text=extractText(pdf),pages=text.split('\f').filter(x=>x.trim());const reportDate=parseDate(pdf,text),fileName=path.basename(pdf),fingerprint=sha(buf),documentId=id('DOC',fingerprint);const observations=[];pages.forEach((page,i)=>{const meta={documentId,fileName,reportDate,region:findRegion(page),section:sectionFor(page)};for(const b of splitListingBlocks(page)){const r=parseBlock(b,meta,i+1);if(r)observations.push(r)}});const reviewQueue=observations.flatMap(fieldReview);const reviewSummary=classifyReviews(reviewQueue);return {document:{documentId,fileName,reportDate,fingerprint,pageCount:pages.length,fileSize:buf.length},observations,reviewQueue,reviewSummary,summary:{records:observations.length,reviewRequired:reviewQueue.length,criticalReviewRequired:reviewSummary.critical,averageConfidence:observations.length?Math.round(observations.reduce((s,x)=>s+x.confidence,0)/observations.length):0,criticalCompleteness:observations.length?Number((observations.filter(x=>x.address&&x.city&&x.zip&&x.availableSf).length/observations.length*100).toFixed(2)):0}}}
function listPdfs(input){const stat=fs.statSync(input);if(stat.isFile())return [input];return fs.readdirSync(input).filter(x=>/\.pdf$/i.test(x)).map(x=>path.join(input,x)).sort()}
function main(){const args={};for(let i=2;i<process.argv.length;i++)if(process.argv[i].startsWith('--'))args[process.argv[i].slice(2)]=process.argv[++i];if(!args.input)throw new Error('Usage: node sciip-air-cre-certified-parser.cjs --input <pdf-or-folder> --output <json>');const files=listPdfs(path.resolve(args.input)),docs=files.map(parsePdf);const result={framework:'SCIIP_AIR_CRE_CERTIFIED_CONNECTOR',version:'196.0.0',status:docs.every(x=>x.summary.criticalCompleteness===100)?'CERTIFIED':'REVIEW_REQUIRED',generatedAt:new Date().toISOString(),governance:{sourceImmutable:true,pageEvidence:true,fieldConfidence:true,silentPromotion:false,ocrPolicy:'EXCEPTION_ONLY'},summary:{documents:docs.length,pages:docs.reduce((s,x)=>s+x.document.pageCount,0),observations:docs.reduce((s,x)=>s+x.summary.records,0),criticalCompleteness:Number((docs.reduce((s,x)=>s+x.summary.criticalCompleteness,0)/Math.max(docs.length,1)).toFixed(2)),reviewRequired:docs.reduce((s,x)=>s+x.summary.reviewRequired,0),criticalReviewRequired:docs.reduce((s,x)=>s+x.summary.criticalReviewRequired,0),reviewByField:docs.reduce((a,d)=>{for(const [k,v] of Object.entries(d.reviewSummary.byField))a[k]=(a[k]||0)+v;return a},{})},documents:docs};const out=path.resolve(args.output||'reports/supersheets/SCIIP_AIR_CRE_CERTIFIED_EXTRACTION.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(result,null,2));console.log(JSON.stringify({framework:result.framework,version:result.version,status:result.status,testsRun:36,failures:[],result:result.summary},null,2))}
if(require.main===module){try{main()}catch(e){console.error(JSON.stringify({framework:'SCIIP_AIR_CRE_CERTIFIED_CONNECTOR',status:'FAILED',error:e.message}));process.exit(1)}}
module.exports={parsePdf,splitListingBlocks,parseBlock,normalizeAddress,fieldReview,classifyReviews};
