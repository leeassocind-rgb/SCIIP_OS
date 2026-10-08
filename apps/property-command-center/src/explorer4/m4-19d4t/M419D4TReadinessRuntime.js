export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4T_LIGHTBOX_READINESS_IMPLEMENTATION_TARGETED_FORENSICS";
export const VERSION="4.0-m4.19d4t";

export function readinessSignals(text=""){
  const out=[];
  const lines=(text||"").split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(/configured|readiness|enabled|apiKey|baseUrl|timeoutMs|allowedOrigins|port|LIGHTBOX_NOT_CONFIGURED/i.test(line)){
      out.push({line:i+1,text:line.trim().slice(0,700)});
    }
  }
  return out;
}

export function assignmentSignals(text=""){
  const out=[];
  const patterns=[
    /\b(baseUrl|apiKey|enabled|port|timeoutMs|allowedOrigins)\s*:\s*([^,\n}]+)/g,
    /\b(baseUrl|apiKey|enabled|port|timeoutMs|allowedOrigins)\s*=\s*([^;\n]+)/g,
    /\bthis\.(baseUrl|apiKey|enabled|port|timeoutMs|allowedOrigins)\s*=\s*([^;\n]+)/g
  ];
  for(const re of patterns){
    for(const m of text.matchAll(re)){
      out.push({property:m[1],expression:(m[2]||"").trim().slice(0,500),index:m.index});
    }
  }
  return out;
}
