import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useOfflineStorage } from '../useOfflineStorage';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useVentaSubmit() {
  const [loading, setLoading] = useState(false);
  const { 
    isOnline, 
    guardarPedidoOffline, 
    guardarClienteCache, 
    guardarProductoCache 
  } = useOfflineStorage();

  const registrarVenta = async (cliente, productos, total) => {
    if (!cliente || productos.length === 0) {
      toast.error('Debe seleccionar un cliente y agregar al menos un producto.');
      return false;
    }

    // Preparar datos de la venta
    const ventaData = {
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono,
      cliente_direccion: cliente.direccion,
      cliente_ciudad: cliente.ciudad,
      cliente_provincia: cliente.provincia,
      cliente_condicion: cliente.condicion_iva,
      cliente_cuit: cliente.cuit,
      tipo_documento: 'Factura',
      tipo_fiscal: 'A',
      total: total.toFixed(2),
      estado: 'Registrada',
      empleado_id: 1,
      empleado_nombre: 'Fausto',
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        unidad_medida: p.unidad_medida,
        cantidad: p.cantidad,
        precio: parseFloat(p.precio),
        iva: parseFloat(p.iva || 0),
        subtotal: parseFloat(p.subtotal)
      })),
    };

    setLoading(true);

    try {
      if (isOnline) {
        // Si hay conexión, intentar guardar en la base de datos
        console.log('🌐 Guardando venta online...');
        await axios.post(`${apiUrl}/ventas/crear-venta`, ventaData);
        
        // Guardar cliente y productos en cache para uso offline futuro
        await guardarClienteCache(cliente);
        for (const producto of productos) {
          await guardarProductoCache(producto);
        }
        
        toast.success('✅ Venta registrada con éxito');
        return true;
      } else {
        // Si no hay conexión, guardar offline
        console.log('📱 Guardando venta offline...');
        await guardarPedidoOffline(ventaData);
        
        toast.success('📱 Pedido guardado offline. Se sincronizará automáticamente cuando haya conexión.');
        return true;
      }
    } catch (error) {
      console.error('❌ Error al registrar la venta:', error);
      
      // Si falla la venta online, intentar guardar offline como respaldo
      if (isOnline) {
        console.log('⚠️ Error online, intentando guardar offline como respaldo...');
        try {
          await guardarPedidoOffline(ventaData);
          toast.error('Error al enviar a la base de datos. Pedido guardado offline para sincronización posterior.');
          return true;
        } catch (offlineError) {
          console.error('❌ Error guardando offline:', offlineError);
          toast.error('Error al registrar la venta online y offline');
          return false;
        }
      } else {
        toast.error('Error al guardar pedido offline');
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para intentar sincronización manual
  const sincronizarPedidos = async () => {
    if (!isOnline) {
      toast.error('❌ No hay conexión a internet');
      return false;
    }

    setLoading(true);
    
    try {
      const { obtenerPedidosPendientes, marcarPedidoSincronizado } = useOfflineStorage();
      const pedidosPendientes = await obtenerPedidosPendientes();
      
      if (pedidosPendientes.length === 0) {
        toast.info('✅ No hay pedidos pendientes para sincronizar');
        return true;
      }

      let exitosos = 0;
      let fallidos = 0;

      for (const pedido of pedidosPendientes) {
        try {
          console.log(`🔄 Sincronizando pedido ${pedido.id}...`);
          
          const response = await axios.post(`${apiUrl}/ventas/crear-venta`, pedido.data);
          
          if (response.status === 200 || response.status === 201) {
            await marcarPedidoSincronizado(pedido.id, true);
            exitosos++;
            console.log(`✅ Pedido ${pedido.id} sincronizado exitosamente`);
          } else {
            await marcarPedidoSincronizado(pedido.id, false, `Error HTTP: ${response.status}`);
            fallidos++;
          }
        } catch (error) {
          console.error(`❌ Error sincronizando pedido ${pedido.id}:`, error);
          await marcarPedidoSincronizado(pedido.id, false, error.message);
          fallidos++;
        }
      }

      if (exitosos > 0) {
        toast.success(`✅ ${exitosos} pedidos sincronizados exitosamente`);
      }
      
      if (fallidos > 0) {
        toast.error(`❌ ${fallidos} pedidos fallaron al sincronizar`);
      }

      return fallidos === 0;
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      toast.error('Error durante la sincronización');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    registrarVenta, 
    sincronizarPedidos,
    loading,
    isOnline 
  };
}