import React from "react";
import data from "../production-validation/market-data-foundation-command-center-data.json";
export default function MarketDataFoundationCommandCenter(){
 const r=data?.result||{};
 return <section aria-label="Market Data Foundation Command Center" style={{padding:24}}>
  <h1>Market Data Foundation</h1><p>{data.executiveBrief}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
   {[['Geographies',r.geographicDimensions],['Time Members',r.temporalMembers],['Enriched Records',r.enrichedRecords],['Cube Cells',r.materializedCells],['Completeness',`${r.dimensionCompletenessPct}%`],['Quality',r.qualityStatus]].map(([k,v])=><article key={k} style={{border:'1px solid #ddd',borderRadius:8,padding:16}}><small>{k}</small><strong style={{display:'block',fontSize:24}}>{v}</strong></article>)}
  </div>
 </section>;
}
