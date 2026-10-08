import{
  PREVIOUS_PUBLISHED_REPORT_SNAPSHOT,
  compareInquiryHistory,
  compareWorkingSet
}from'./reportSnapshotEngine.js';

const PAGE_WIDTH=612;
const PAGE_HEIGHT=792;
const MARGIN=36;
const CONTENT_WIDTH=PAGE_WIDTH-MARGIN*2;
const freeze=value=>Object.freeze(value);

export function buildInstitutionalReportModel(
  view,
  {
    generatedAt=new Date().toISOString(),
    previousSnapshot=PREVIOUS_PUBLISHED_REPORT_SNAPSHOT,
    executiveNotes=''
  }={}
){
  const competition=compareWorkingSet(
    view.competition,
    previousSnapshot.competition,
    {fields:['status','dealType','sf','askingRate']}
  );
  const comparables=compareWorkingSet(
    view.relevantComparables,
    previousSnapshot.comparables,
    {fields:['buildingSf','rate','salePricePsf','closedAt']}
  );
  const inquiryHistory=compareInquiryHistory(
    view.inquiryHistory||view.inquiries||[],
    previousSnapshot
  );

  const narratives=buildNarratives({
    assignment:view.assignment,
    competition,
    comparables,
    inquiryHistory,
    requirements:view.matchingRequirements||[],
    marketingActivity:view.marketingActivity||[],
    previousSnapshot
  });

  return freeze({
    reportTitle:'Client Listing Report',
    clientDisplayName:view.assignment.owner||view.assignment.client,
    generatedAt,
    previousPublishedAt:previousSnapshot.publishedAt,
    assignment:freeze({...view.assignment}),
    marketIntelligence:narratives.marketIntelligence,
    executiveNotes:executiveNotes||narratives.executiveNotes,
    marketingActivity:freeze(view.marketingActivity||[]),
    requirements:freeze(view.matchingRequirements||[]),
    inquiryHistory,
    competition,
    comparables,
    freshness:freeze({
      dataThrough:generatedAt,
      comparisonBasis:`Changes measured against report published ${formatDate(previousSnapshot.publishedAt)}`
    }),
    aerial:freeze({included:false,status:'DEFERRED'})
  });
}

export function buildNarratives({
  assignment,
  competition,
  comparables,
  inquiryHistory,
  requirements,
  previousSnapshot
}){
  const newCompetition=competition.filter(row=>row.changeStatus==='NEW').length;
  const updatedCompetition=competition.filter(row=>row.changeStatus==='UPDATED').length;
  const removedCompetition=competition.filter(row=>row.changeStatus==='REMOVED').length;
  const newComparables=comparables.filter(row=>row.changeStatus==='NEW').length;
  const updatedComparables=comparables.filter(row=>row.changeStatus==='UPDATED').length;
  const activeInquiries=inquiryHistory.filter(row=>
    !['LOST','DISQUALIFIED','NO RESPONSE'].includes(row.stage)
  ).length;

  const marketIntelligence=[
    `The current large-format competitive set contains ${competition.filter(row=>row.changeStatus!=='REMOVED').length} active properties within the assignment's governed 600,000-800,000 SF criteria.`,
    `${newCompetition} competitor${newCompetition===1?' was':'s were'} added, ${updatedCompetition} materially updated, and ${removedCompetition} removed since the client report published ${formatDate(previousSnapshot.publishedAt)}.`,
    `${newComparables} comparable transaction${newComparables===1?' was':'s were'} added and ${updatedComparables} updated during the same reporting period.`,
    `${activeInquiries} of ${inquiryHistory.length} total inquiries remain active, while ${requirements.length} tenant requirement${requirements.length===1?' currently matches':'s currently match'} the building's size, clear-height, and power profile.`
  ].join(' ');

  const executiveNotes=[
    `${assignment.name} continues to offer a differentiated 664,859 SF, 42-foot-clear, high-power option for large-format occupiers in the Inland Empire.`,
    `Current priorities are to advance follow-up with active inquiries, complete targeted logistics and advanced-manufacturing outreach, and monitor competitive pricing changes before the next ownership call.`,
    `The leasing team will continue to update the working competition and comparable sets as new Daily SuperSheet information qualifies under the assignment criteria.`
  ].join(' ');

  return freeze({marketIntelligence,executiveNotes});
}

export function generateInstitutionalReportPdf(model){
  const document=new PdfDocument();

  let page=document.addPage();
  drawHeader(page,model);
  let y=694;

  y=drawSectionTitle(page,'Market Intelligence',y);
  y=drawParagraph(page,model.marketIntelligence,MARGIN,y,CONTENT_WIDTH,9.2,13.1);
  y-=10;

  y=drawSectionTitle(page,'Marketing Activity Since Last Report',y);
  y=drawMarketingActivity(page,model.marketingActivity,y);
  y-=10;

  y=drawSectionTitle(page,'Active Tenant Requirements',y);
  y=drawRequirements(page,model.requirements,y);
  y-=10;

  y=drawSectionTitle(page,'Executive Notes',y);
  y=drawNoteBox(page,model.executiveNotes,y);

  drawFooter(page,model,1,2);

  page=document.addPage();
  drawPageHeader(page,model);
  y=718;

  y=drawSectionTitle(page,'Inquiry Pipeline - Assignment Inception to Date',y);
  y=drawInquiryHistory(page,model.inquiryHistory,y);
  y-=10;

  y=drawSectionTitle(page,'Competitive Set',y);
  y=drawCompetition(page,model.competition,y);
  y-=10;

  y=drawSectionTitle(page,'Comparable Transactions',y);
  y=drawComparables(page,model.comparables,y);

  drawFooter(page,model,2,2);
  return document.build();
}

export function downloadInstitutionalReport(model){
  const bytes=generateInstitutionalReportPdf(model);
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');
  anchor.href=url;
  anchor.download=buildInstitutionalFilename(model);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  return anchor.download;
}

export function buildInstitutionalFilename(model){
  const safe=model.assignment.name.replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'');
  return `${safe}_Client_Listing_Report_${new Date(model.generatedAt).toISOString().slice(0,10)}.pdf`;
}

function drawHeader(page,model){
  page.rect(0,0,PAGE_WIDTH,PAGE_HEIGHT,[0.974,0.979,0.984]);
  page.rect(0,710,PAGE_WIDTH,82,[0.055,0.16,0.22]);
  page.text(model.reportTitle,MARGIN,759,21,'bold',[1,1,1]);
  page.text(model.clientDisplayName,MARGIN,734,13.5,'bold',[0.81,0.93,0.97]);
  page.text(model.assignment.name,PAGE_WIDTH-MARGIN,758,10,'bold',[1,1,1],'right');
  page.text(
    `${model.assignment.address}, ${model.assignment.city}, ${model.assignment.state} | ${model.assignment.buildingSf.toLocaleString()} SF`,
    PAGE_WIDTH-MARGIN,738,7.4,'regular',[0.78,0.86,0.9],'right'
  );
  page.text(
    `Report date ${formatDate(model.generatedAt)} | Data through ${formatDateTime(model.generatedAt)}`,
    MARGIN,714,6.8,'regular',[0.78,0.86,0.9]
  );
}

function drawPageHeader(page,model){
  page.rect(0,0,PAGE_WIDTH,PAGE_HEIGHT,[0.974,0.979,0.984]);
  page.text(model.clientDisplayName,MARGIN,760,8.5,'bold',[0.08,0.23,0.32]);
  page.text(model.assignment.name,PAGE_WIDTH/2,760,8,'regular',[0.35,0.39,0.45],'center');
  page.text(model.reportTitle,PAGE_WIDTH-MARGIN,760,8,'regular',[0.35,0.39,0.45],'right');
  page.line(MARGIN,749,PAGE_WIDTH-MARGIN,749,[0.82,0.85,0.89],0.7);
}

function drawFooter(page,model,pageNumber,pageCount){
  page.line(MARGIN,34,PAGE_WIDTH-MARGIN,34,[0.86,0.88,0.91],0.5);
  page.text(model.freshness.comparisonBasis,MARGIN,19,6.2,'regular',[0.42,0.46,0.51]);
  page.text(`Page ${pageNumber} of ${pageCount}`,PAGE_WIDTH-MARGIN,19,6.2,'regular',[0.42,0.46,0.51],'right');
}

function drawSectionTitle(page,title,y){
  page.text(title,MARGIN,y,11,'bold',[0.08,0.23,0.32]);
  page.line(MARGIN,y-6,PAGE_WIDTH-MARGIN,y-6,[0.72,0.77,0.82],0.7);
  return y-19;
}

function drawParagraph(page,text,x,y,width,size=9,lineHeight=13){
  for(const line of wrap(text,width,size)){
    page.text(line,x,y,size,'regular',[0.14,0.17,0.21]);
    y-=lineHeight;
  }
  return y;
}

function drawMarketingActivity(page,rows,y){
  const columns=[['Activity',145],['Status',80],['Execution detail',250],['Date',57]];
  y=drawTableHeader(page,columns,y);
  if(!rows.length)return drawEmpty(page,'No marketing activity recorded for this reporting period.',y);
  for(const row of rows.slice(0,7)){
    y=drawTableRow(page,columns,[
      row.activity,row.status,row.detail,formatShortDate(row.occurredAt)
    ],y,6.9);
  }
  return y;
}

function drawRequirements(page,rows,y){
  const columns=[['Company / requirement',150],['Size',120],['Clear / power',120],['Timing',75],['Fit',65]];
  y=drawTableHeader(page,columns,y);
  if(!rows.length)return drawEmpty(page,'No active requirements currently match the assignment.',y);
  for(const row of rows.slice(0,5)){
    y=drawTableRow(page,columns,[
      row.company,
      `${fmt(row.minSf)}-${fmt(row.maxSf)} SF`,
      `${row.minClearHeightFt}' / ${fmt(row.minPowerAmps)} amps`,
      row.timing||'-',
      `${row.fitScore}%`
    ],y,6.9);
  }
  return y;
}

function drawNoteBox(page,text,y){
  const lines=wrap(text,CONTENT_WIDTH-24,8.7);
  const height=26+lines.length*12;
  page.rect(MARGIN,y-height+6,CONTENT_WIDTH,height,[0.94,0.965,0.975]);
  page.text('BROKER-REVIEWED NARRATIVE',MARGIN+12,y-10,6,'bold',[0.12,0.38,0.48]);
  let cursor=y-25;
  for(const line of lines){
    page.text(line,MARGIN+12,cursor,8.7,'regular',[0.13,0.18,0.22]);
    cursor-=12;
  }
  return y-height;
}

function drawInquiryHistory(page,rows,y){
  const columns=[
    ['Company / prospect',122],
    ['Contact',88],
    ['Requirement',110],
    ['Stage / outcome',100],
    ['First inquiry',56],
    ['Last activity',56]
  ];
  y=drawTableHeader(page,columns,y);
  if(!rows.length)return drawEmpty(page,'No inquiries have been recorded.',y);
  for(const row of rows.slice(0,12)){
    y=drawTableRow(page,columns,[
      row.company,
      row.contactName,
      `${fmt(row.minSf)}-${fmt(row.maxSf)} SF`,
      `${row.stage} / ${row.outcome||'-'}`,
      formatShortDate(row.createdAt),
      formatShortDate(row.lastActivityAt)
    ],y,6.55,row.changeStatus);
  }
  return y;
}

function drawCompetition(page,rows,y){
  const columns=[
    ['Property',124],
    ['Location',78],
    ['Size',72],
    ['Status',82],
    ['Rate',62],
    ['Change since last report',114]
  ];
  y=drawTableHeader(page,columns,y);
  if(!rows.length)return drawEmpty(page,'No properties currently satisfy the competition criteria.',y);
  for(const row of rows.slice(0,10)){
    y=drawTableRow(page,columns,[
      row.name,
      row.city||row.address,
      `${fmt(row.sf)} SF`,
      row.status,
      row.askingRate?`$${row.askingRate.toFixed(2)}`:'TBD',
      `${row.changeStatus}: ${row.changeDetail}`
    ],y,6.35,row.changeStatus);
  }
  return y;
}

function drawComparables(page,rows,y){
  const columns=[
    ['Property / type',130],
    ['Size',82],
    ['Rate / price',86],
    ['Date',62],
    ['Change since last report',172]
  ];
  y=drawTableHeader(page,columns,y);
  if(!rows.length)return drawEmpty(page,'No transactions currently satisfy the comparable criteria.',y);
  for(const row of rows.slice(0,10)){
    const value=row.type==='LEASE'
      ?`$${Number(row.rate||0).toFixed(2)} NNN`
      :`$${fmt(row.salePricePsf)}/SF`;
    y=drawTableRow(page,columns,[
      `${row.property||row.name||row.id} - ${row.type}`,
      `${fmt(row.buildingSf)} SF`,
      value,
      formatShortDate(row.closedAt),
      `${row.changeStatus}: ${row.changeDetail}`
    ],y,6.35,row.changeStatus);
  }
  return y;
}

function drawTableHeader(page,columns,y){
  page.rect(MARGIN,y-18,CONTENT_WIDTH,20,[0.08,0.23,0.32]);
  let x=MARGIN+5;
  for(const [label,width] of columns){
    page.text(label.toUpperCase(),x,y-13,5.4,'bold',[1,1,1]);
    x+=width;
  }
  return y-20;
}

function drawTableRow(page,columns,values,y,size=6.6,status=''){
  const wrapped=values.map((value,index)=>wrap(String(value??'-'),columns[index][1]-8,size));
  const lines=Math.max(...wrapped.map(item=>item.length));
  const height=Math.max(20,7+lines*8.2);
  const color=status==='NEW'
    ?[0.93,0.97,0.94]
    :status==='UPDATED'
      ?[0.99,0.97,0.90]
      :status==='REMOVED'
        ?[0.98,0.93,0.93]
        :[0.982,0.986,0.99];
  page.rect(MARGIN,y-height,CONTENT_WIDTH,height,color);
  let x=MARGIN+5;
  for(let i=0;i<columns.length;i++){
    let cursor=y-10;
    for(const line of wrapped[i]){
      page.text(line,x,cursor,size,i===0?'bold':'regular',[0.18,0.21,0.25]);
      cursor-=8.2;
    }
    x+=columns[i][1];
  }
  page.line(MARGIN,y-height,PAGE_WIDTH-MARGIN,y-height,[0.88,0.9,0.93],0.35);
  return y-height;
}

function drawEmpty(page,message,y){
  page.rect(MARGIN,y-23,CONTENT_WIDTH,25,[0.982,0.986,0.99]);
  page.text(message,MARGIN+8,y-15,7.2,'regular',[0.4,0.44,0.5]);
  return y-25;
}

function formatDate(value){
  if(!value)return '-';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?String(value):date.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
}
function formatShortDate(value){
  if(!value)return '-';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?String(value):date.toLocaleDateString('en-US',{month:'numeric',day:'numeric',year:'2-digit'});
}
function formatDateTime(value){
  if(!value)return '-';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?String(value):date.toLocaleString('en-US',{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}
function fmt(value){return Number(value||0).toLocaleString('en-US');}
function wrap(text,width,size){
  const max=Math.max(8,Math.floor(width/(size*0.52)));
  const words=String(text).split(/\s+/);
  const lines=[];
  let line='';
  for(const word of words){
    const next=line?`${line} ${word}`:word;
    if(next.length>max&&line){lines.push(line);line=word;}
    else line=next;
  }
  if(line)lines.push(line);
  return lines.length?lines:[''];
}

class PdfDocument{
  constructor(){this.pages=[];}
  addPage(){const page=new PdfPage();this.pages.push(page);return page;}
  build(){
    const objects=[];
    const add=content=>{objects.push(content);return objects.length;};
    const regular=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    const pagesId=add('PAGES_PLACEHOLDER');
    const pageIds=[];
    for(const page of this.pages){
      const stream=page.commands.join('\n');
      const contentId=add(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`);
      const pageId=add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    }
    objects[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    const catalogId=add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    let pdf='%PDF-1.4\n%SCIIP\n';
    const offsets=[0];
    objects.forEach((object,index)=>{
      offsets[index+1]=byteLength(pdf);
      pdf+=`${index+1} 0 obj\n${object}\nendobj\n`;
    });
    const xref=byteLength(pdf);
    pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
    for(let index=1;index<=objects.length;index++){
      pdf+=`${String(offsets[index]).padStart(10,'0')} 00000 n \n`;
    }
    pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new TextEncoder().encode(pdf);
  }
}

class PdfPage{
  constructor(){this.commands=[];}
  text(text,x,y,size=10,weight='regular',color=[0,0,0],align='left'){
    const value=escapePdf(String(text));
    const estimated=String(text).length*size*0.5;
    const tx=align==='right'?x-estimated:align==='center'?x-estimated/2:x;
    this.commands.push(`${color.join(' ')} rg BT /${weight==='bold'?'F2':'F1'} ${size} Tf 1 0 0 1 ${round(tx)} ${round(y)} Tm (${value}) Tj ET`);
  }
  rect(x,y,width,height,color){
    this.commands.push(`${color.join(' ')} rg ${round(x)} ${round(y)} ${round(width)} ${round(height)} re f`);
  }
  line(x1,y1,x2,y2,color,width=1){
    this.commands.push(`${color.join(' ')} RG ${width} w ${round(x1)} ${round(y1)} m ${round(x2)} ${round(y2)} l S`);
  }
}

function escapePdf(value){
  return value
    .replace(/\\/g,'\\\\')
    .replace(/\(/g,'\\(')
    .replace(/\)/g,'\\)')
    .replace(/[\u2013\u2014]/g,'-')
    .replace(/[\u2018\u2019]/g,"'")
    .replace(/[\u201c\u201d]/g,'"')
    .replace(/[^\x20-\x7E]/g,'');
}
function byteLength(value){return new TextEncoder().encode(value).length;}
function round(value){return Math.round(value*100)/100;}
