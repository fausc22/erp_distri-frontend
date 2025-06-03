import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const DB_NAME = 'VertimarDB';
const DB_VERSION = 1;
const PEDIDOS_STORE = 'pedidos';
const CLIENTES_STORE = 'clientes';
const PRODUCTOS_STORE = 'productos';

export function useOfflineStorage() {
  const [db, setDb] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  // Inicializar IndexedDB
  useEffect(() => {
    initDB();
    
    // Detectar cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🌐 Conectado a internet');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('📱 Modo offline activado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initDB = () => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ Error abriendo IndexedDB:', request.error);
      toast.error('Error inicializando almacenamiento offline');
    };

    request.onsuccess = () => {
      const database = request.result;
      setDb(database);
      console.log('✅ IndexedDB inicializado correctamente');
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Store para pedidos offline
      if (!database.objectStoreNames.contains(PEDIDOS_STORE)) {
        const pedidosStore = database.createObjectStore(PEDIDOS_STORE, { 
          keyPath: 'id',
          autoIncrement: true 
        });
        
        pedidosStore.createIndex('fechaCreacion', 'fechaCreacion', { unique: false });
        pedidosStore.createIndex('sincronizado', 'sincronizado', { unique: false });
        pedidosStore.createIndex('clienteNombre', 'data.cliente_nombre', { unique: false });
      }

      // Store para clientes (cache)
      if (!database.objectStoreNames.contains(CLIENTES_STORE)) {
        const clientesStore = database.createObjectStore(CLIENTES_STORE, { 
          keyPath: 'id' 
        });
        clientesStore.createIndex('nombre', 'nombre', { unique: false });
      }

      // Store para productos (cache)
      if (!database.objectStoreNames.contains(PRODUCTOS_STORE)) {
        const productosStore = database.createObjectStore(PRODUCTOS_STORE, { 
          keyPath: 'id' 
        });
        productosStore.createIndex('nombre', 'nombre', { unique: false });
      }

      console.log('📦 Estructura de base de datos creada');
    };
  };

  // Guardar pedido offline
  const guardarPedidoOffline = async (pedidoData) => {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }

    const pedidoOffline = {
      data: pedidoData,
      fechaCreacion: new Date().toISOString(),
      sincronizado: false,
      intentosSincronizacion: 0,
      ultimoError: null
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PEDIDOS_STORE], 'readwrite');
      const store = transaction.objectStore(PEDIDOS_STORE);
      const request = store.add(pedidoOffline);

      request.onsuccess = () => {
        const pedidoId = request.result;
        console.log('💾 Pedido guardado offline con ID:', pedidoId);
        toast.success('📱 Pedido guardado offline');
        resolve(pedidoId);
      };

      request.onerror = () => {
        console.error('❌ Error guardando pedido offline:', request.error);
        reject(request.error);
      };
    });
  };

  // Obtener pedidos offline
  const obtenerPedidosOffline = async () => {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PEDIDOS_STORE], 'readonly');
      const store = transaction.objectStore(PEDIDOS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const pedidos = request.result;
        console.log(`📋 Obtenidos ${pedidos.length} pedidos offline`);
        resolve(pedidos);
      };

      request.onerror = () => {
        console.error('❌ Error obteniendo pedidos offline:', request.error);
        reject(request.error);
      };
    });
  };

  // Obtener solo pedidos pendientes de sincronización
  const obtenerPedidosPendientes = async () => {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PEDIDOS_STORE], 'readonly');
      const store = transaction.objectStore(PEDIDOS_STORE);
      const index = store.index('sincronizado');
      const request = index.getAll(false);

      request.onsuccess = () => {
        const pedidosPendientes = request.result;
        console.log(`⏳ ${pedidosPendientes.length} pedidos pendientes de sincronización`);
        resolve(pedidosPendientes);
      };

      request.onerror = () => {
        console.error('❌ Error obteniendo pedidos pendientes:', request.error);
        reject(request.error);
      };
    });
  };

  // Marcar pedido como sincronizado
  const marcarPedidoSincronizado = async (pedidoId, exitoso = true, error = null) => {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PEDIDOS_STORE], 'readwrite');
      const store = transaction.objectStore(PEDIDOS_STORE);
      const getRequest = store.get(pedidoId);

      getRequest.onsuccess = () => {
        const pedido = getRequest.result;
        if (pedido) {
          if (exitoso) {
            pedido.sincronizado = true;
            pedido.fechaSincronizacion = new Date().toISOString();
            pedido.ultimoError = null;
          } else {
            pedido.intentosSincronizacion += 1;
            pedido.ultimoError = error;
            pedido.ultimoIntento = new Date().toISOString();
          }

          const putRequest = store.put(pedido);
          putRequest.onsuccess = () => {
            console.log(`✅ Pedido ${pedidoId} actualizado`);
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Pedido no encontrado'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  };

  // Eliminar pedido sincronizado
  const eliminarPedidoSincronizado = async (pedidoId) => {
    if (!db) {
      throw new Error('Base de datos no inicializada');
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PEDIDOS_STORE], 'readwrite');
      const store = transaction.objectStore(PEDIDOS_STORE);
      const request = store.delete(pedidoId);

      request.onsuccess = () => {
        console.log(`🗑️ Pedido ${pedidoId} eliminado de almacenamiento local`);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Error eliminando pedido:', request.error);
        reject(request.error);
      };
    });
  };

  // Cache de clientes
  const guardarClienteCache = async (cliente) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CLIENTES_STORE], 'readwrite');
      const store = transaction.objectStore(CLIENTES_STORE);
      const request = store.put(cliente);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // Cache de productos
  const guardarProductoCache = async (producto) => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PRODUCTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PRODUCTOS_STORE);
      const request = store.put(producto);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // Buscar en cache de clientes
  const buscarClientesCache = async (query) => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CLIENTES_STORE], 'readonly');
      const store = transaction.objectStore(CLIENTES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const clientes = request.result;
        const filtered = clientes.filter(cliente => 
          cliente.nombre.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      };

      request.onerror = () => reject(request.error);
    });
  };

  // Buscar en cache de productos
  const buscarProductosCache = async (query) => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PRODUCTOS_STORE], 'readonly');
      const store = transaction.objectStore(PRODUCTOS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const productos = request.result;
        const filtered = productos.filter(producto => 
          producto.nombre.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      };

      request.onerror = () => reject(request.error);
    });
  };

  return {
    isOnline,
    db: !!db,
    guardarPedidoOffline,
    obtenerPedidosOffline,
    obtenerPedidosPendientes,
    marcarPedidoSincronizado,
    eliminarPedidoSincronizado,
    guardarClienteCache,
    guardarProductoCache,
    buscarClientesCache,
    buscarProductosCache
  };
}