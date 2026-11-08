/* NEWS STUDIO service worker (v11)
   - சொந்தக் கோப்புகள்: எப்போதும் புதியது (சர்வரிடம் 304 சரிபார்ப்பு மட்டும் — முழு பதிவிறக்கம் இல்லை);
     இணையம் மெதுவாக இருந்தாலோ இல்லாவிட்டாலோ சேமித்த நகல் உடனே
   - CDN நூலகங்கள் (pdf.js, mp4-muxer, qrcode) & எழுத்துருக்கள்: ஒருமுறை பதிவிறக்கி, பிறகு உடனே / ஆஃப்லைனிலும் */
const VER='np-v11',LIB='np-lib-v1';
const CORE=['./','index.html','settings.html','news.html','book.html','bookshelf.html',
  'settings.css','articles.css','manifest.json','icon.svg',
  'media-store.js','video-lib.js','articles-config.js','article-store.js','cutout.js','articles.js','posts.js',
  'flipbook.js','theme.js','owner-gate.js','articles-admin.js','share-hub.js'];
const LIBHOST=/^(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.gstatic\.com)$/;
const WAIT=3500; /* ms — இதற்குள் இணையம் பதிலளிக்காவிட்டால் சேமித்த நகல் */

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(VER);
    await Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()){if(k!==VER&&k!==LIB)await caches.delete(k)}
    await self.clients.claim();
  })());
});

/* சொந்தக் கோப்பு: revalidate (no-cache = If-None-Match) + நேரம் கடந்தால் cache */
async function own(e,r){
  const net=fetch(r,{cache:'no-cache'}).then(res=>{
    if(res&&res.status===200){const cp=res.clone();caches.open(VER).then(c=>c.put(r,cp)).catch(()=>{})}
    return res;
  });
  e.waitUntil(net.catch(()=>{}));
  const hit=await caches.match(r,{ignoreSearch:true});
  if(!hit)return net;
  return Promise.race([net,new Promise(ok=>setTimeout(()=>ok(hit),WAIT))]).catch(()=>hit);
}
/* version உள்ள CDN கோப்புகள்: cache-first (CORS வழியாக எடுத்தால் opaque அளவு இடம் தவிர்க்கலாம்) */
async function lib(r){
  const c=await caches.open(LIB),m=await c.match(r.url);
  if(m)return m;
  let res;
  try{res=await fetch(new Request(r.url,{mode:'cors',credentials:'omit'}))}
  catch(_){res=await fetch(r)}
  if(res&&(res.ok||res.type==='opaque'))c.put(r.url,res.clone()).catch(()=>{});
  return res;
}
/* Google Fonts CSS: stale-while-revalidate */
async function swr(e,r){
  const c=await caches.open(LIB),m=await c.match(r.url);
  const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r.url,res.clone()).catch(()=>{});return res}).catch(()=>m);
  e.waitUntil(net);
  return m||net;
}

self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||!/^https?:/.test(r.url))return;
  if(r.headers.has('range'))return; /* வீடியோ/ஆடியோ பகுதி-கோரிக்கைகளை நேரடியாக விடு (206 cache ஆகாது) */
  if(r.cache==='only-if-cached'&&r.mode!=='same-origin')return;
  const u=new URL(r.url);
  if(u.origin===self.location.origin)e.respondWith(own(e,r));
  else if(LIBHOST.test(u.hostname))e.respondWith(lib(r));
  else if(u.hostname==='fonts.googleapis.com')e.respondWith(swr(e,r));
});
