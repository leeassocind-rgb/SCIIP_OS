import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AN_LIGHTBOX_ADDRESS_RESOLUTION_SINGLE_READ_PREAUTHORIZATION";
export const VERSION="4.0-m4.19d4an";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function nonEmpty(v){return typeof v==="string"&&v.trim().length>0}

export function extractRouteBlocks(text=""){
  const lines=text.split(/\r?\n/);
  const blocks=[];
  for(let i=0;i<lines.length;i++){
    const m=lines[i].match(/url\.pathname\s*===\s*['"`]([^'"`]+)['"`]\s*&&\s*req\.method\s*===\s*['"`]([A-Z]+)['"`]/);
    if(!m)continue;
    const start=i;
    let end=Math.min(lines.length-1,i+80);
    for(let j=i+1;j<Math.min(lines.length,i+100);j++){
      if(/url\.pathname\s*===/.test(lines[j])){end=j-1;break}
    }
    blocks.push({route:m[1],method:m[2],text:lines.slice(start,end+1).join("\n"),startLine:start+1,endLine:end+1});
  }
  return blocks;
}
