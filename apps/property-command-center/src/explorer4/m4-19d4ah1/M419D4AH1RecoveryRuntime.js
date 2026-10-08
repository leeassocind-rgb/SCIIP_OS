export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AH1_SOURCE_BACKED_COORDINATE_RECOVERY_FORENSICS";
export const VERSION="4.0-m4.19d4ah1";

export function coordPairsNear(text="", anchorIndex=0, radius=2500){
  const start=Math.max(0,anchorIndex-radius), end=Math.min(text.length,anchorIndex+radius);
  const slice=text.slice(start,end);
  const out=[];
  const patterns=[
    /(?:lat|latitude)\s*[:=]\s*["']?(-?\d{1,3}(?:\.\d+)?)["']?[\s\S]{0,250}?(?:lng|lon|longitude)\s*[:=]\s*["']?(-?\d{1,3}(?:\.\d+)?)["']?/ig,
    /(?:lng|lon|longitude)\s*[:=]\s*["']?(-?\d{1,3}(?:\.\d+)?)["']?[\s\S]{0,250}?(?:lat|latitude)\s*[:=]\s*["']?(-?\d{1,3}(?:\.\d+)?)["']?/ig,
    /\[\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*\]/g
  ];
  for(const re of patterns){
    for(const m of slice.matchAll(re)){
      let lat,lng;
      if(/lng|lon|longitude/i.test(m[0].slice(0,20))){
        lng=Number(m[1]); lat=Number(m[2]);
      }else if(m[0].trim().startsWith("[")){
        const a=Number(m[1]),b=Number(m[2]);
        // GeoJSON is [lng,lat]; prefer that interpretation when plausible.
        if(Math.abs(a)>90 && Math.abs(b)<=90){lng=a;lat=b}
        else {lat=a;lng=b}
      }else{
        lat=Number(m[1]); lng=Number(m[2]);
      }
      if(Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180){
        out.push({lat,lng,relativeIndex:m.index,snippet:m[0].slice(0,500)});
      }
    }
  }
  return out;
}
