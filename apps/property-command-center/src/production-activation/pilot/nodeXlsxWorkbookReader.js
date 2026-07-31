import fs from 'node:fs';
import zlib from 'node:zlib';

const u16=(buffer,offset)=>buffer.readUInt16LE(offset);
const u32=(buffer,offset)=>buffer.readUInt32LE(offset);
const decodeXml=value=>String(value||'')
  .replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>')
  .replaceAll('&quot;','"').replaceAll('&apos;',"'");
const columnIndex=ref=>{
  const letters=String(ref||'A1').match(/[A-Z]+/i)?.[0]||'A';
  let value=0;
  for(const char of letters.toUpperCase())value=value*26+char.charCodeAt(0)-64;
  return value-1;
};

function unzip(buffer){
  const files=new Map();
  let eocd=-1;
  for(let index=buffer.length-22;index>=Math.max(0,buffer.length-65557);index--){
    if(u32(buffer,index)===0x06054b50){eocd=index;break}
  }
  if(eocd<0)throw new Error('Invalid XLSX ZIP container');
  const entries=u16(buffer,eocd+10);
  let offset=u32(buffer,eocd+16);
  for(let index=0;index<entries;index++){
    if(u32(buffer,offset)!==0x02014b50)throw new Error('Invalid XLSX central directory');
    const method=u16(buffer,offset+10);
    const compressed=u32(buffer,offset+20);
    const nameLength=u16(buffer,offset+28);
    const extraLength=u16(buffer,offset+30);
    const commentLength=u16(buffer,offset+32);
    const localOffset=u32(buffer,offset+42);
    const name=buffer.subarray(offset+46,offset+46+nameLength).toString('utf8');
    const localNameLength=u16(buffer,localOffset+26);
    const localExtraLength=u16(buffer,localOffset+28);
    const start=localOffset+30+localNameLength+localExtraLength;
    const payload=buffer.subarray(start,start+compressed);
    if(method===0)files.set(name,payload);
    else if(method===8)files.set(name,zlib.inflateRawSync(payload));
    else throw new Error(`Unsupported XLSX compression method: ${method}`);
    offset+=46+nameLength+extraLength+commentLength;
  }
  return files;
}

const attributes=tag=>Object.fromEntries(
  [...String(tag).matchAll(/([\w:.-]+)="([^"]*)"/g)].map(match=>[match[1],decodeXml(match[2])])
);
const xmlText=xml=>decodeXml(String(xml||'').replace(/<[^>]+>/g,''));

function parseSharedStrings(xml){
  if(!xml)return[];
  return [...xml.matchAll(/<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/g)]
    .map(match=>[...match[1].matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g)]
      .map(item=>decodeXml(item[1])).join(''));
}

function parseSheet(xml,shared){
  const rows=[];
  for(const rowMatch of xml.matchAll(/<(?:\w+:)?row\b[^>]*>([\s\S]*?)<\/(?:\w+:)?row>/g)){
    const row=[];
    for(const cellMatch of rowMatch[1].matchAll(/<(?:\w+:)?c\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?c>/g)){
      const attrs=attributes(cellMatch[1]);
      const index=columnIndex(attrs.r);
      const inline=cellMatch[2].match(/<(?:\w+:)?is\b[^>]*>([\s\S]*?)<\/(?:\w+:)?is>/)?.[1];
      const value=cellMatch[2].match(/<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/)?.[1] ??
        (inline ? xmlText(inline) : '');
      row[index]=attrs.t==='s'?shared[Number(value)]??'':decodeXml(value);
    }
    rows.push(Array.from({length:Math.max(row.length,1)},(_,index)=>row[index]??''));
  }
  return rows;
}

export function readXlsxWorkbook(filePath){
  if(!fs.existsSync(filePath))throw new Error(`Workbook not found: ${filePath}`);
  const files=unzip(fs.readFileSync(filePath));
  const workbookXml=files.get('xl/workbook.xml')?.toString('utf8');
  const relationshipsXml=files.get('xl/_rels/workbook.xml.rels')?.toString('utf8');
  if(!workbookXml||!relationshipsXml)throw new Error('Workbook metadata is incomplete');

  const relationships=new Map(
    [...relationshipsXml.matchAll(/<Relationship\b([^>]*)\/?>/g)]
      .map(match=>attributes(match[1]))
      .map(item=>[item.Id,item.Target])
  );
  const shared=parseSharedStrings(files.get('xl/sharedStrings.xml')?.toString('utf8'));
  const sheets=[];

  for(const match of workbookXml.matchAll(/<(?:\w+:)?sheet\b([^>]*)\/?>/g)){
    const attrs=attributes(match[1]);
    const target=relationships.get(attrs['r:id']);
    if(!target)continue;
    const normalized=target.startsWith('/')?target.slice(1):
      target.startsWith('xl/')?target:`xl/${target.replace(/^\.\//,'')}`;
    const xml=files.get(normalized)?.toString('utf8');
    if(!xml)continue;
    const matrix=parseSheet(xml,shared);
    sheets.push(Object.freeze({
      name:attrs.name,
      headers:Object.freeze((matrix[0]||[]).map(String)),
      rows:Object.freeze(matrix.slice(1).map(row=>Object.freeze(row))),
      rowCount:Math.max(0,matrix.length-1)
    }));
  }

  return Object.freeze({
    filePath,
    fileName:filePath.split('/').pop(),
    fileSize:fs.statSync(filePath).size,
    sheets:Object.freeze(sheets)
  });
}
