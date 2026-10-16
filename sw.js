const V='lagerbuch-5';
const CORE=['./','index.html','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const html=r.mode==='navigate'||r.destination==='document'||/\/$|index\.html$/.test(new URL(r.url).pathname);
  if(html){ // App-Seite: immer zuerst die neueste Version holen, offline aus dem Speicher
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('./',cp))}return res})
      .catch(()=>caches.match('./').then(h=>h||caches.match('index.html'))));return}
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r);
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net}));
});
