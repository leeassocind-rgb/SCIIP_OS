const decodeText = buffer => new TextDecoder('utf-8').decode(buffer);
const parseDelimited = (text,delimiter=',') => {
  const rows=[]; let row=[]; let field=''; let quoted=false;
  for(let i=0;i<text.length;i++){
    const char=text[i];
    if(char==='"'){
      if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;
    }else if(char===delimiter&&!quoted){row.push(field);field='';}
    else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(cell=>String(cell).trim()!==''))rows.push(row);row=[];field='';}
    else field+=char;
  }
  row.push(field);if(row.some(cell=>String(cell).trim()!==''))rows.push(row);return rows;
};
const xmlText = xml => new DOMParser().parseFromString(xml,'application/xml');
const u16=(v,o)=>new DataView(v).getUint16(o,true); const u32=(v,o)=>new DataView(v).getUint32(o,true);
async function inflateRaw(bytes){const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return new Uint8Array(await new Response(stream).arrayBuffer());}
async function unzip(buffer){
  const bytes=new Uint8Array(buffer); const files=new Map(); let eocd=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(u32(buffer,i)===0x06054b50){eocd=i;break;}}
  if(eocd<0)throw new Error('Invalid XLSX ZIP container');
  const entries=u16(buffer,eocd+10);let offset=u32(buffer,eocd+16);
  for(let index=0;index<entries;index++){
    if(u32(buffer,offset)!==0x02014b50)throw new Error('Invalid XLSX central directory');
    const method=u16(buffer,offset+10),compressed=u32(buffer,offset+20),nameLen=u16(buffer,offset+28),extraLen=u16(buffer,offset+30),commentLen=u16(buffer,offset+32),localOffset=u32(buffer,offset+42);
    const name=new TextDecoder().decode(bytes.slice(offset+46,offset+46+nameLen));
    if(u32(buffer,localOffset)!==0x04034b50)throw new Error('Invalid XLSX local file header');
    const localNameLen=u16(buffer,localOffset+26),localExtraLen=u16(buffer,localOffset+28),start=localOffset+30+localNameLen+localExtraLen,payload=bytes.slice(start,start+compressed);
    if(method===0)files.set(name,payload);else if(method===8)files.set(name,await inflateRaw(payload));
    offset+=46+nameLen+extraLen+commentLen;
  }
  return files;
}
function columnIndex(ref='A1'){let n=0;for(const char of ref.match(/[A-Z]+/i)?.[0]||'A')n=n*26+char.toUpperCase().charCodeAt(0)-64;return n-1;}
async function parseXlsx(buffer){
  const files=await unzip(buffer); const decoder=new TextDecoder();
  const sharedXml=files.get('xl/sharedStrings.xml'); const shared=sharedXml?[...xmlText(decoder.decode(sharedXml)).querySelectorAll('si')].map(si=>[...si.querySelectorAll('t')].map(t=>t.textContent).join('')):[];
  const workbook=xmlText(decoder.decode(files.get('xl/workbook.xml'))); const first=workbook.querySelector('sheet'); if(!first)throw new Error('Workbook has no worksheets');
  const relId=first.getAttribute('r:id'); const rels=xmlText(decoder.decode(files.get('xl/_rels/workbook.xml.rels'))); const target=[...rels.querySelectorAll('Relationship')].find(r=>r.getAttribute('Id')===relId)?.getAttribute('Target');
  if(!target)throw new Error('Unable to resolve first worksheet'); const path=target.startsWith('/')?target.slice(1):`xl/${target.replace(/^\.\//,'')}`;
  const sheet=xmlText(decoder.decode(files.get(path))); const rows=[];
  sheet.querySelectorAll('row').forEach(node=>{const row=[];node.querySelectorAll('c').forEach(cell=>{const index=columnIndex(cell.getAttribute('r'));const type=cell.getAttribute('t');const value=cell.querySelector('v')?.textContent??cell.querySelector('is t')?.textContent??'';row[index]=type==='s'?shared[Number(value)]??'':value;});rows.push(Array.from({length:Math.max(row.length,1)},(_,i)=>row[i]??''));});
  return rows;
}
export async function parseSuperSheet(file){
  const name=file.name.toLowerCase(); const buffer=await file.arrayBuffer(); let matrix;
  if(name.endsWith('.csv'))matrix=parseDelimited(decodeText(buffer),',');
  else if(name.endsWith('.tsv'))matrix=parseDelimited(decodeText(buffer),'\t');
  else if(name.endsWith('.json')){const parsed=JSON.parse(decodeText(buffer));const records=Array.isArray(parsed)?parsed:parsed.rows;if(!Array.isArray(records)||!records.length)throw new Error('JSON must contain a non-empty array');const headers=[...new Set(records.flatMap(Object.keys))];matrix=[headers,...records.map(record=>headers.map(key=>record[key]??''))];}
  else if(name.endsWith('.xlsx'))matrix=await parseXlsx(buffer);
  else throw new Error('Supported formats are .xlsx, .csv, .tsv, and .json');
  if(matrix.length<2)throw new Error('SuperSheet must include a header row and at least one data row');
  return {fileName:file.name,fileSize:file.size,headers:matrix[0].map(String),rows:matrix.slice(1),format:name.split('.').pop().toUpperCase()};
}
export {parseDelimited};
