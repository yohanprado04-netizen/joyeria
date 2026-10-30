const C='fynx-v24',A=['./','index.html','manifest.webmanifest','logo.jpg','icon-192.png','icon-512.png','css/tokens.css','css/base.css','css/components/header.css','css/components/home.css','css/components/products.css','css/components/cart.css','css/components/size-modal.css','css/components/contact.css','css/components/footer.css','css/components/whatsapp.css','css/components/cookies.css','css/components/admin.css','css/components/fynx.css','css/components/lightbox.css','js/store.js','js/header.js','js/catalog.js','js/lightbox.js','js/pwa.js','js/cart.js','js/contact.js','js/cookies.js','js/admin.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{if(r&&r.status===200){const k=r.clone();caches.open(C).then(c=>c.put(e.request,k));}return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});

// Notificaciones al celular para el administrador cuando se realiza un pedido
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='NOTIFY'){
    self.registration.showNotification(e.data.title||'Nuevo Pedido · Fynx Dorado',{
      body:e.data.body||'Un cliente ha solicitado un pedido por WhatsApp. Toca para confirmar la compra.',
      icon:'icon-192.png',
      badge:'icon-192.png',
      vibrate:[200,100,200,100,200],
      tag:'order-'+(e.data.id||Date.now()),
      renotify:true,
      data:{url:'./#admin'}
    }).catch(()=>{});
  }
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const targetUrl=(e.notification.data&&e.notification.data.url)||'./#admin';
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(windowClients=>{
      for(const client of windowClients){
        if('focus' in client){
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if(clients.openWindow)return clients.openWindow(targetUrl);
    })
  );
});
