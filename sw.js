const CACHE='world-dungeon-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // network first for the page so updates show up, cache fallback offline
    if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r;}).catch(()=>caches.match('./index.html')));return;}
    e.respondWith(caches.match(req).then(h=>h||fetch(req)));return;
  }
  if(url.host.includes('fonts.googleapis.com')||url.host.includes('fonts.gstatic.com')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(h=>h||fetch(req).then(r=>{c.put(req,r.clone());return r;}))));
  }
});
