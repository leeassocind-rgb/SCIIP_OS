const freeze=value=>Object.freeze(value);

export const PREVIOUS_PUBLISHED_REPORT_SNAPSHOT=freeze({
  id:'RPS-A-BROOKFIELD-2026-07-21',
  assignmentId:'A-BROOKFIELD',
  publishedAt:'2026-07-21T16:00:00-07:00',
  competition:freeze([
    freeze({
      id:'P-IEW-701',
      name:'Slover Logistics Center',
      address:'10800 Slover Ave',
      city:'Fontana',
      sf:720000,
      status:'AVAILABLE',
      dealType:'SUBLEASE',
      askingRate:1.20
    }),
    freeze({
      id:'P-IEW-704',
      name:'Former Competitive Property',
      address:'San Bernardino, CA',
      city:'San Bernardino',
      sf:690000,
      status:'AVAILABLE',
      dealType:'DIRECT',
      askingRate:1.15
    })
  ]),
  comparables:freeze([
    freeze({
      id:'COMP-L-701',
      property:'IE West Lease Comp',
      type:'LEASE',
      buildingSf:710000,
      rate:1.17,
      closedAt:'2026-07-15'
    })
  ]),
  inquiryStages:freeze({
    'INQ-701':'NEW',
    'INQ-702':'QUALIFIED',
    'INQ-703':'NEW'
  })
});

export function compareWorkingSet(currentRows,previousRows,{fields=[]}={}){
  const currentById=new Map(currentRows.map(row=>[row.id,row]));
  const previousById=new Map(previousRows.map(row=>[row.id,row]));
  const output=[];

  for(const current of currentRows){
    const previous=previousById.get(current.id);
    if(!previous){
      output.push(freeze({
        ...current,
        changeStatus:'NEW',
        changeDetail:'Added since the last published client report'
      }));
      continue;
    }

    const changes=[];
    for(const field of fields){
      if(normalize(current[field])!==normalize(previous[field])){
        changes.push(`${label(field)} changed from ${display(previous[field])} to ${display(current[field])}`);
      }
    }

    output.push(freeze({
      ...current,
      changeStatus:changes.length?'UPDATED':'UNCHANGED',
      changeDetail:changes.length?changes.join('; '):'No material change since the last published report'
    }));
  }

  for(const previous of previousRows){
    if(!currentById.has(previous.id)){
      output.push(freeze({
        ...previous,
        changeStatus:'REMOVED',
        changeDetail:'No longer qualifies for the current working set',
        retainedForReporting:true
      }));
    }
  }

  return freeze(output);
}

export function compareInquiryHistory(inquiries,previousSnapshot){
  return freeze(inquiries.map(inquiry=>{
    const previousStage=previousSnapshot.inquiryStages?.[inquiry.id];
    if(!previousStage){
      return freeze({
        ...inquiry,
        changeStatus:'NEW',
        changeDetail:'New inquiry since the last published report'
      });
    }
    if(previousStage!==inquiry.stage){
      return freeze({
        ...inquiry,
        changeStatus:'UPDATED',
        changeDetail:`Stage changed from ${previousStage} to ${inquiry.stage}`
      });
    }
    return freeze({
      ...inquiry,
      changeStatus:'UNCHANGED',
      changeDetail:'No stage change since the last published report'
    });
  }));
}

export function buildCurrentReportSnapshot({
  assignmentId,
  publishedAt,
  competition,
  comparables,
  inquiries
}){
  return freeze({
    id:`RPS-${assignmentId}-${publishedAt}`,
    assignmentId,
    publishedAt,
    competition:freeze(competition.map(row=>freeze(stripChange(row)))),
    comparables:freeze(comparables.map(row=>freeze(stripChange(row)))),
    inquiryStages:freeze(Object.fromEntries(inquiries.map(row=>[row.id,row.stage])))
  });
}

function stripChange(row){
  const copy={...row};
  delete copy.changeStatus;
  delete copy.changeDetail;
  delete copy.retainedForReporting;
  return copy;
}
function normalize(value){return value==null?'':String(value);}
function display(value){
  if(value==null||value==='')return 'not reported';
  if(typeof value==='number')return Number.isInteger(value)?value.toLocaleString():value.toFixed(2);
  return String(value);
}
function label(field){
  return ({
    askingRate:'Asking rate',
    status:'Status',
    dealType:'Deal type',
    sf:'Building size',
    rate:'Lease rate',
    salePricePsf:'Sale price',
    closedAt:'Transaction date',
    buildingSf:'Building size'
  })[field]||field;
}
