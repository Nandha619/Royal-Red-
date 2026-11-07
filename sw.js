/* நெட்வொர்க் முதலில் (network-first): புதிய கோப்புகள் எப்போதும் உடனே தெரியும்; இணையம் இல்லையென்றால் மட்டும் பழைய நகல் */
const CACHE='np-v10';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys()){if(k!==CACHE)await caches.delete(k)}
  await self.clients.claim();
})())});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||!/^https?:/.test(r.url))return;
  e.respondWith((async()=>{
    try{
      const res=await fetch(r,{cache:'no-store'});
      if(res&&(res.ok||res.type==='opaque')){const c=await caches.open(CACHE);c.put(r,res.clone())}
      return res;
    }catch(err){
      const m=await caches.match(r);
      if(m)return m;
      throw err;
    }
  })());
});
