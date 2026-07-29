import React from "react";
import data from "../production-validation/property-lifecycle-intelligence-data.json";
export default function PropertyLifecycleIntelligenceCenter(){
 const s=data.summary||{}; const counts=s.eventTypeCounts||{};
 return <section aria-label="Property Lifecycle Intelligence"><h1>Property Lifecycle Intelligence</h1><p>Canonical, governed property histories derived from recalculated temporal events.</p><div><strong>{s.propertiesWithLifecycle||0}</strong> properties · <strong>{s.totalLifecycleEvents||0}</strong> lifecycle events</div><ul>{Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=><li key={k}>{k.replaceAll('_',' ')}: {v}</li>)}</ul></section>;
}
