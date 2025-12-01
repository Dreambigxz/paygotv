let checkInterval = null;
let userToken = null;
let vapidPublicKey = null;
baseUrl = "https://gball-bd565bb2756c.herokuapp.com/api";

async function fetchApi(url,method,body) {
  console.log('FETCHING<<>>', {url,method,body});
  const res = await fetch(`${baseUrl}/${url}/`, {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...(userToken ? { 'Authorization': `Token ${userToken}` } : {})
    }
  });
  if (res.status===401) {
    stopChecking()
  }
  if (!res.ok) throw new Error('Network response not ok');

  const json =  await res.json();
  console.log('fetchApiRES>>', {json});
  return json
}

self.addEventListener('install', (event) => {
  console.log('[SW] Installed');
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(clients.claim());
  // event.waitUntil(
  //   (async () => {
  //     const bets = await getBetsFromDB();
  //     if (bets.length) {
  //       startChecking();
  //     }
  //   })()
  // );
});


// message listener
self.addEventListener('message', async (event) => {
  if (!event.data)return //not client
  if (event.data.type === 'SET_TOKEN') {
    userToken = event.data.token;
  }
  else if (event.data.type==="showNotification") {
    showNotification_(...Object.values(event.data.notify))
  }

  else if (event.data.type === 'SET_PUBLIC_KEY') {
    vapidPublicKey = event.data.key;
    console.log('[SW] VAPID public key received');
  }
  else if (['SUBSCRIBE', "UNSUBSCRIBE"].includes(event.data.type )) {
    fetchApi('notifications','POST', JSON.stringify(event.data.data))
  }
  

});

function showNotification_(header,body) {

  if (Notification.permission !== 'granted') return;

  self.registration.showNotification(header, {icon: '/assets/icons/192x192.png',badge: '/assets/icons/72x72.png', url: '/main', body});
}

/* ✅ Network-first for HTML so pull-to-refresh reloads from server */
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only apply network-first for navigations (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // For all other requests, just pass through (or add custom caching here)
  event.respondWith(fetch(request));
});

self.addEventListener('push', function(event) {

  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || "Notification";
  const options = {
    body: data.body || "",
    icon: data.icon || "/assets/icons/192x192.png",
    data: {
      url: data.url || "/"
    }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

self.addEventListener('periodicsync', (event) => {
  console.log("periodicsync", event);
  if (event.tag === 'check-open-bets') {
    event.waitUntil(checkOpenBets("periodicsync"));
  }
});
