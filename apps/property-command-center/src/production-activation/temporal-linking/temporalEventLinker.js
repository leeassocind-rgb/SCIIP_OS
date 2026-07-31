const freeze=value=>Object.freeze(value);
const timestamp=value=>new Date(value).getTime();

export function linkTemporalEvents({events=[],windowDays=365}={}) {
  const sorted=[...events]
    .filter(event=>event.occurredAt||event.date)
    .sort((a,b)=>timestamp(a.occurredAt||a.date)-timestamp(b.occurredAt||b.date));

  const links=[];
  const maximumGap=windowDays*86400000;

  for(let index=0;index<sorted.length;index++){
    for(let next=index+1;next<sorted.length;next++){
      const from=sorted[index];
      const to=sorted[next];
      if(from.propertyId!==to.propertyId)continue;
      const gap=timestamp(to.occurredAt||to.date)-timestamp(from.occurredAt||from.date);
      if(gap<0||gap>maximumGap)continue;

      links.push(freeze({
        id:`TEMP-${links.length+1}`,
        from:from.id,
        to:to.id,
        propertyId:from.propertyId,
        type:'PRECEDES',
        gapDays:Number((gap/86400000).toFixed(2)),
        evidence:freeze({sameProperty:true,withinWindow:true})
      }));
    }
  }

  return freeze({
    events:freeze(sorted),
    links:freeze(links),
    eventCount:sorted.length,
    linkCount:links.length,
    duplicateSafe:true
  });
}
