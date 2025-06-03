// hooks/usePedidos.js
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useOfflineStorage } from '../useOfflineStorage';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function usePedidos() {
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [pedidosOffline, setPedidosOffline] = useState([]);
  
  const { 
    isOnline, 
    guardarPedidoOffline, 
    obtenerPedidosOffline,
    obtenerPedidosPendientes,
    marcarPedidoSincronizado,
    eliminarPedidoSincronizado,
    guardarClienteCache,
    guardarProductoCache 
  } = useOfflineStorage();

  // Buscar clientes
  const buscarClientes = async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      let resultados = [];
      
      if (isOnline) {
        const response = await axios.get(`${apiUrl}/pedidos/filtrar-cliente?q=${encodeURIComponent(query)}`);
        resultados = response.data.success ? response.data.data : [];
        
        // Guardar en cache
        for (const cliente of resultados) {
          await guardarClienteCache(cliente);
        }
      } else {
        // Buscar en cache offline
        const { buscarClientesCache } = useOfflineStorage();
        resultados = await buscarClientesCache(query);
      }
      
      return resultados;
    } catch (error) {
      console.error('Error buscando clientes:', error);
      toast.error('Error al buscar clientes');
      return [];
    }
  };

  // Buscar productos
  const buscarProductos = async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      let resultados = [];
      
      if (isOnline) {
        const response = await axios.get(`${apiUrl}/pedidos/filtrar-producto?q=${encodeURIComponent(query)}`);
        resultados = response.data.success ? response.data.data : [];
        
        // Guardar en cache
        for (const producto of resultados) {
          await guardarProductoCache(producto);
        }
      } else {
        // Buscar en cache offline
        const { buscarProductosCache } = useOfflineStorage();
        resultados = await buscarProductosCache(query);
      }
      
      return resultados;
    } catch (error) {
      console.error('Error buscando productos:', error);
      toast.error('Error al buscar productos');
      return [];
    }
  };

  // Registrar nuevo pedido
  const registrarPedido = async (datosFormulario) => {
    const { cliente, productos, observaciones, empleado } = datosFormulario;

    if (!cliente || !productos || productos.length === 0) {
      toast.error('Debe seleccionar un cliente y al menos un producto');
      return { success: false };
    }

    // Calcular totales
    const subtotal = productos.reduce((acc, prod) => acc + (prod.cantidad * prod.precio), 0);
    const totalIva = productos.reduce((acc, prod) => acc + (prod.iva || 0), 0);
    const total = subtotal + totalIva;

    // Preparar datos del pedido
    const pedidoData = {
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono || '',
      cliente_direccion: cliente.direccion || '',
      cliente_ciudad: cliente.ciudad || '',
      cliente_provincia: cliente.provincia || '',
      cliente_condicion: cliente.condicion_iva || '',
      cliente_cuit: cliente.cuit || '',
      subtotal: subtotal.toFixed(2),
      iva: totalIva.toFixed(2),
      total: total.toFixed(2),
      estado: 'Registrado',
      empleado_id: empleado?.id || 1,
      empleado_nombre: empleado?.nombre || 'Usuario',
      observaciones: observaciones || '',
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        unidad_medida: p.unidad_medida || 'Unidad',
        cantidad: p.cantidad,
        precio: parseFloat(p.precio),
        iva: parseFloat(p.iva || 0),
        subtotal: parseFloat((p.cantidad * p.precio).toFixed(2))
      }))
    };

    setLoading(true);

    try {
      if (isOnline) {
        // Intentar guardar online
        console.log('🌐 Guardando pedido online...');
        const response = await axios.post(`${apiUrl}/pedidos/registrar-pedido`, pedidoData);
        
        if (response.data.success) {
          // Guardar en cache para uso offline futuro
          await guardarClienteCache(cliente);
          for (const producto of productos) {
            await guardarProductoCache(producto);
          }
          
          toast.success('✅ Pedido registrado exitosamente');
          return { success: true, pedidoId: response.data.pedidoId };
        } else {
          throw new Error(response.data.message || 'Error del servidor');
        }
      } else {
        // Guardar offline
        console.log('📱 Guardando pedido offline...');
        const pedidoId = await guardarPedidoOffline(pedidoData);
        
        toast.success('📱 Pedido guardado offline. Se sincronizará automáticamente cuando haya conexión.');
        return { success: true, pedidoId, offline: true };
      }
    } catch (error) {
      console.error('❌ Error al registrar pedido:', error);
      
      // Si falla online, intentar guardar offline como respaldo
      if (isOnline) {
        console.log('⚠️ Error online, intentando guardar offline como respaldo...');
        try {
          const pedidoId = await guardarPedidoOffline(pedidoData);
          toast.error('Error al enviar a la base de datos. Pedido guardado offline para sincronización posterior.');
          return { success: true, pedidoId, offline: true, fallback: true };
        } catch (offlineError) {
          console.error('❌ Error guardando offline:', offlineError);
          toast.error('Error al registrar el pedido');
          return { success: false, error: 'Error al guardar offline' };
        }
      } else {
        toast.error('Error al guardar pedido offline');
        return { success: false, error: error.message };
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos offline
  const cargarPedidosOffline = async () => {
    setLoading(true);
    try {
      const [todosPedidos, solosPendientes] = await Promise.all([
        obtenerPedidosOffline(),
        obtenerPedidosPendientes()
      ]);
      
      setPedidosOffline(todosPedidos);
      console.log(`📋 Cargados ${todosPedidos.length} pedidos offline (${solosPendientes.length} pendientes)`);
      return { todosPedidos, pendientes: solosPendientes };
    } catch (error) {
      console.error('❌ Error cargando pedidos offline:', error);
      toast.error('Error al cargar pedidos offline');
      return { todosPedidos: [], pendientes: [] };
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar pedidos pendientes
  const sincronizarPedidos = async () => {
    if (!isOnline) {
      toast.error('❌ No hay conexión a internet');
      return { success: false, sincronizados: 0, fallidos: 0 };
    }

    setLoading(true);
    
    try {
      const pedidosPendientes = await obtenerPedidosPendientes();
      
      if (pedidosPendientes.length === 0) {
        toast.info('✅ No hay pedidos pendientes para sincronizar');
        return { success: true, sincronizados: 0, fallidos: 0 };
      }

      let sincronizados = 0;
      let fallidos = 0;

      for (const pedido of pedidosPendientes) {
        try {
          console.log(`🔄 Sincronizando pedido ${pedido.id}...`);
          
          const response = await axios.post(`${apiUrl}/pedidos/registrar-pedido`, pedido.data);
          
          if (response.data.success) {
            await marcarPedidoSincronizado(pedido.id, true);
            sincronizados++;
            console.log(`✅ Pedido ${pedido.id} sincronizado exitosamente`);
          } else {
            await marcarPedidoSincronizado(pedido.id, false, response.data.message);
            fallidos++;
          }
        } catch (error) {
          console.error(`❌ Error sincronizando pedido ${pedido.id}:`, error);
          await marcarPedidoSincronizado(pedido.id, false, error.message);
          fallidos++;
        }
      }

      if (sincronizados > 0) {
        toast.success(`✅ ${sincronizados} pedidos sincronizados exitosamente`);
      }
      
      if (fallidos > 0) {
        toast.error(`❌ ${fallidos} pedidos fallaron al sincronizar`);
      }

      return { success: fallidos === 0, sincronizados, fallidos };
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      toast.error('Error durante la sincronización');
      return { success: false, sincronizados: 0, fallidos: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Cargar pedidos online
  const cargarPedidosOnline = async () => {
    if (!isOnline) {
      toast.error('No hay conexión para cargar pedidos online');
      return [];
    }

    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/pedidos/obtener-pedidos`);
      
      if (response.data.success) {
        setPedidos(response.data.data);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al cargar pedidos');
      }
    } catch (error) {
      console.error('Error cargando pedidos online:', error);
      toast.error('Error al cargar pedidos online');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener detalle de un pedido
  const obtenerDetallePedido = async (pedidoId) => {
    if (!isOnline) {
      toast.error('No hay conexión para obtener detalles');
      return null;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/pedidos/detalle-pedido/${pedidoId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener detalle');
      }
    } catch (error) {
      console.error('Error obteniendo detalle:', error);
      toast.error('Error al obtener detalle del pedido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar pedido offline
  const eliminarPedidoOffline = async (pedidoId) => {
    try {
      await eliminarPedidoSincronizado(pedidoId);
      toast.success('✅ Pedido eliminado');
      
      // Recargar lista
      await cargarPedidosOffline();
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando pedido:', error);
      toast.error('Error al eliminar pedido');
      return { success: false };
    }
  };

  // Reintentar sincronización de un pedido específico
  const reintentarPedido = async (pedidoId) => {
    try {
      // Resetear contador de intentos y error
      await marcarPedidoSincronizado(pedidoId, false, null);
      toast.info('🔄 Pedido marcado para reintento');
      
      // Recargar lista
      await cargarPedidosOffline();
      return { success: true };
    } catch (error) {
      console.error('❌ Error marcando reintento:', error);
      toast.error('Error al marcar reintento');
      return { success: false };
    }
  };

  return {
    // Estados
    loading,
    isOnline,
    pedidos,
    pedidosOffline,
    
    // Funciones de búsqueda
    buscarClientes,
    buscarProductos,
    
    // Funciones de pedidos
    registrarPedido,
    cargarPedidosOffline,
    cargarPedidosOnline,
    obtenerDetallePedido,
    
    // Funciones de sincronización
    sincronizarPedidos,
    eliminarPedidoOffline,
    reintentarPedido
  };
}