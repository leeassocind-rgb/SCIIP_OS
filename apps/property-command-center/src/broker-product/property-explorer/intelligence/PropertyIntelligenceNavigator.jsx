import React from'react';
const GROUP_LABELS={CORE:'Core',PROPERTY:'Property',CAPITAL:'Capital',LOCATION:'Location',GOVERNANCE:'Governance'};
export default function PropertyIntelligenceNavigator({sections,activeSection,onSelect}){
  const groups=[];
  for(const section of sections||[]){
    let group=groups.find(row=>row.id===section.group);
    if(!group){group={id:section.group,label:GROUP_LABELS[section.group]||section.group,items:[]};groups.push(group);}
    group.items.push(section);
  }
  return <div className="explorer3__pi-nav">
    {groups.map(group=><div className="explorer3__pi-nav-group" key={group.id}>
      <span className="explorer3__pi-nav-label">{group.label}</span>
      <div className="explorer3__pi-nav-items">
        {group.items.map(section=><button type="button" key={section.id} className={activeSection===section.id?'is-active':''} onClick={()=>onSelect?.(section.id)}>
          {section.label}{section.status==='REVIEW_REQUIRED'&&<i className="is-review"/>}
        </button>)}
      </div>
    </div>)}
  </div>;
}
