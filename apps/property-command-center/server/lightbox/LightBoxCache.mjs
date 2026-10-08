export class LightBoxCache{
  constructor({ttlMs=15*60*1000,maxEntries=500}={}){
    this.ttlMs=ttlMs;
    this.maxEntries=maxEntries;
    this.map=new Map();
  }
  get(key){
    const row=this.map.get(key);
    if(!row)return null;
    if(Date.now()-row.createdAt>this.ttlMs){
      this.map.delete(key);
      return null;
    }
    this.map.delete(key);
    this.map.set(key,row);
    return row.value;
  }
  set(key,value){
    if(this.map.has(key))this.map.delete(key);
    this.map.set(key,{createdAt:Date.now(),value});
    while(this.map.size>this.maxEntries){
      const oldest=this.map.keys().next().value;
      this.map.delete(oldest);
    }
    return value;
  }
  clear(){this.map.clear();}
  stats(){return{entries:this.map.size,ttlMs:this.ttlMs,maxEntries:this.maxEntries};}
}
