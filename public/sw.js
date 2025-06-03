const CACHE_NAME = 'vertimar-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/ventas/RegistrarVenta',
  '/ventas/PedidosOffline',
  '/_next/static/css/app.css',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('❌ Error al cachear:', error);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  // Solo interceptar requests GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si encontramos en cache, devolver
        if (response) {
          return response;
        }

        // Si no está en cache, intentar fetch
        return fetch(event.request)
          .then((response) => {
            // Verificar que la respuesta sea válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar respuesta porque es un stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Si no hay conexión, devolver página offline si existe
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Background Sync para sincronizar pedidos
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pedidos') {
    console.log('🔄 Sincronizando pedidos en background...');
    event.waitUntil(sincronizarPedidos());
  }
});

// Función para sincronizar pedidos automáticamente
async function sincronizarPedidos() {
  try {
    // Obtener pedidos pendientes del IndexedDB
    const pedidosPendientes = await obtenerPedidosPendientes();
    
    if (pedidosPendientes.length === 0) {
      console.log('✅ No hay pedidos pendientes para sincronizar');
      return;
    }

    console.log(`🔄 Sincronizando ${pedidosPendientes.length} pedidos...`);

    for (const pedido of pedidosPendientes) {
      try {
        const response = await fetch('/api/ventas/crear-venta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pedido.data)
        });

        if (response.ok) {
          // Marcar como sincronizado
          await marcarPedidoComoSincronizado(pedido.id);
          console.log(`✅ Pedido ${pedido.id} sincronizado exitosamente`);
        }
      } catch (error) {
        console.error(`❌ Error sincronizando pedido ${pedido.id}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error en sincronización automática:', error);
  }
}

// Funciones auxiliares para IndexedDB (simplificadas para el SW)
function obtenerPedidosPendientes() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VertimarDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pedidos'], 'readonly');
      const store = transaction.objectStore('pedidos');
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => {
        const pedidos = getRequest.result.filter(p => !p.sincronizado);
        resolve(pedidos);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

function marcarPedidoComoSincronizado(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VertimarDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pedidos'], 'readwrite');
      const store = transaction.objectStore('pedidos');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const pedido = getRequest.result;
        if (pedido) {
          pedido.sincronizado = true;
          pedido.fechaSincronizacion = new Date().toISOString();
          store.put(pedido);
        }
        resolve();
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}