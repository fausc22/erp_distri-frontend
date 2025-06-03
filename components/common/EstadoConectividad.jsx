import { useState, useEffect } from 'react';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';

export default function EstadoConectividad() {
  const { isOnline } = useOfflineStorage();
  const [pedidosPendientes, setPedidosPendientes] = useState(0);

  useEffect(() => {
    const cargarPendientes = async () => {
      try {
        const { obtenerPedidosPendientes } = useOfflineStorage();
        const pendientes = await obtenerPedidosPendientes();
        setPedidosPendientes(pendientes.length);
      } catch (error) {
        console.error('Error cargando pendientes:', error);
      }
    };

    cargarPendientes();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarPendientes, 30000);
    
    return () => clearInterval(interval);
  }, [isOnline]);

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Indicador principal de conectividad */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className="text-xs font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Indicador de pedidos pendientes */}
      {pedidosPendientes > 0 && (
        <div className="mt-2 bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xs">⏳</span>
            <span className="text-xs font-medium">
              {pedidosPendientes} pedido{pedidosPendientes !== 1 ? 's' : ''} pendiente{pedidosPendientes !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook alternativo para usar en componentes específicos
export function useEstadoConectividad() {
  const { isOnline } = useOfflineStorage();
  const [pedidosPendientes, setPedidosPendientes] = useState(0);

  useEffect(() => {
    const cargarPendientes = async () => {
      try {
        const { obtenerPedidosPendientes } = useOfflineStorage();
        const pendientes = await obtenerPedidosPendientes();
        setPedidosPendientes(pendientes.length);
      } catch (error) {
        console.error('Error cargando pendientes:', error);
      }
    };

    cargarPendientes();
  }, [isOnline]);

  return {
    isOnline,
    pedidosPendientes,
    tieneConflictos: pedidosPendientes > 0 && isOnline
  };
}