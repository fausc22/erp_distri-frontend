import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { useVentaSubmit } from '../../hooks/ventas/useNuevaVenta';

// Formateador de moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

// Componente para el indicador de estado
function EstadoConectividad({ isOnline }) {
  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
      isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className={`w-3 h-3 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span className="text-sm font-medium">
        {isOnline ? 'Conectado' : 'Sin conexión'}
      </span>
    </div>
  );
}

// Componente para mostrar detalles de un pedido
function DetallePedido({ pedido, onCerrar }) {
  if (!pedido) return null;

  const totalProductos = pedido.data.productos.reduce((acc, prod) => acc + prod.cantidad, 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalle del Pedido Offline</h2>
          <button
            onClick={onCerrar}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Información del cliente */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-lg text-blue-800 mb-2">Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p><strong>Nombre:</strong> {pedido.data.cliente_nombre}</p>
            <p><strong>CUIT:</strong> {pedido.data.cliente_cuit || 'No especificado'}</p>
            <p><strong>Teléfono:</strong> {pedido.data.cliente_telefono || 'No especificado'}</p>
            <p><strong>Ciudad:</strong> {pedido.data.cliente_ciudad || 'No especificada'}</p>
            <p><strong>Provincia:</strong> {pedido.data.cliente_provincia || 'No especificada'}</p>
            <p><strong>Condición IVA:</strong> {pedido.data.cliente_condicion || 'No especificada'}</p>
          </div>
        </div>

        {/* Información del pedido */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Información del Pedido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p><strong>Fecha creación:</strong> {new Date(pedido.fechaCreacion).toLocaleString('es-AR')}</p>
            <p><strong>Total productos:</strong> {totalProductos} unidades</p>
            <p><strong>Estado:</strong> {pedido.sincronizado ? '✅ Sincronizado' : '⏳ Pendiente'}</p>
            <p><strong>Total:</strong> <span className="text-lg font-bold text-green-600">{formatCurrency(pedido.data.total)}</span></p>
            {pedido.intentosSincronizacion > 0 && (
              <p><strong>Intentos sincronización:</strong> {pedido.intentosSincronizacion}</p>
            )}
            {pedido.ultimoError && (
              <p><strong>Último error:</strong> <span className="text-red-600">{pedido.ultimoError}</span></p>
            )}
          </div>
        </div>

        {/* Productos */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Productos</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b p-2 text-left">Producto</th>
                  <th className="border-b p-2 text-center">Cantidad</th>
                  <th className="border-b p-2 text-right">Precio Unit.</th>
                  <th className="border-b p-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedido.data.productos.map((producto, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border-b p-2">{producto.nombre}</td>
                    <td className="border-b p-2 text-center">{producto.cantidad} {producto.unidad_medida}</td>
                    <td className="border-b p-2 text-right">{formatCurrency(producto.precio)}</td>
                    <td className="border-b p-2 text-right">{formatCurrency(producto.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="p-2 text-right font-bold">Total:</td>
                  <td className="p-2 text-right font-bold text-green-600">
                    {formatCurrency(pedido.data.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal
export default function PedidosOffline() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    isOnline, 
    obtenerPedidosOffline, 
    obtenerPedidosPendientes,
    eliminarPedidoSincronizado,
    marcarPedidoSincronizado 
  } = useOfflineStorage();
  const { sincronizarPedidos, loading } = useVentaSubmit();

  const [pedidos, setPedidos] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'pendientes', 'sincronizados'

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setLoadingPedidos(true);
    try {
      const [todosPedidos, solosPendientes] = await Promise.all([
        obtenerPedidosOffline(),
        obtenerPedidosPendientes()
      ]);
      
      setPedidos(todosPedidos);
      setPedidosPendientes(solosPendientes);
      console.log(`📋 Cargados ${todosPedidos.length} pedidos offline (${solosPendientes.length} pendientes)`);
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      toast.error('Error al cargar pedidos offline');
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleSincronizar = async () => {
    const exito = await sincronizarPedidos();
    if (exito || pedidosPendientes.length > 0) {
      await cargarPedidos(); // Recargar para mostrar cambios
    }
  };

  const handleEliminarSincronizados = async () => {
    if (!window.confirm('¿Está seguro de eliminar todos los pedidos ya sincronizados?')) {
      return;
    }

    try {
      const pedidosSincronizados = pedidos.filter(p => p.sincronizado);
      
      for (const pedido of pedidosSincronizados) {
        await eliminarPedidoSincronizado(pedido.id);
      }
      
      toast.success(`✅ ${pedidosSincronizados.length} pedidos sincronizados eliminados`);
      await cargarPedidos();
    } catch (error) {
      console.error('❌ Error eliminando pedidos:', error);
      toast.error('Error al eliminar pedidos sincronizados');
    }
  };

  const handleEliminarPedido = async (pedidoId) => {
    if (!window.confirm('¿Está seguro de eliminar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await eliminarPedidoSincronizado(pedidoId);
      toast.success('✅ Pedido eliminado');
      await cargarPedidos();
    } catch (error) {
      console.error('❌ Error eliminando pedido:', error);
      toast.error('Error al eliminar pedido');
    }
  };

  const handleReintentarPedido = async (pedidoId) => {
    try {
      // Resetear contador de intentos y error
      await marcarPedidoSincronizado(pedidoId, false, null);
      toast.info('🔄 Pedido marcado para reintento');
      await cargarPedidos();
    } catch (error) {
      console.error('❌ Error marcando reintento:', error);
      toast.error('Error al marcar reintento');
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    switch (filtro) {
      case 'pendientes':
        return !pedido.sincronizado;
      case 'sincronizados':
        return pedido.sincronizado;
      default:
        return true;
    }
  });

  const totalPendientes = pedidosPendientes.length;
  const totalSincronizados = pedidos.filter(p => p.sincronizado).length;

  if (loadingPedidos) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Cargando pedidos offline...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Pedidos Offline</title>
        <meta name="description" content="Gestión de pedidos offline" />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pedidos Offline</h1>
              <p className="text-gray-600">Gestión de pedidos almacenados localmente</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <EstadoConectividad isOnline={isOnline} />
              
              <button
                onClick={() => router.push('/ventas/RegistrarVenta')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Nuevo Pedido
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-800">{pedidos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{totalPendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Sincronizados</p>
                <p className="text-2xl font-bold text-green-600">{totalSincronizados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setFiltro('todos')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filtro === 'todos' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos ({pedidos.length})
              </button>
              <button
                onClick={() => setFiltro('pendientes')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filtro === 'pendientes' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pendientes ({totalPendientes})
              </button>
              <button
                onClick={() => setFiltro('sincronizados')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filtro === 'sincronizados' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sincronizados ({totalSincronizados})
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSincronizar}
                disabled={!isOnline || loading || totalPendientes === 0}
                className={`px-4 py-2 rounded-lg font-medium ${
                  !isOnline || loading || totalPendientes === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? '🔄 Sincronizando...' : '📤 Sincronizar Pendientes'}
              </button>

              {totalSincronizados > 0 && (
                <button
                  onClick={handleEliminarSincronizados}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  🗑️ Limpiar Sincronizados
                </button>
              )}

              <button
                onClick={cargarPedidos}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {pedidosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {pedido.data.cliente_nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pedido.data.cliente_ciudad || 'Ciudad no especificada'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pedido.fechaCreacion).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pedido.sincronizado
                            ? 'bg-green-100 text-green-800'
                            : pedido.intentosSincronizacion > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pedido.sincronizado 
                            ? '✅ Sincronizado' 
                            : pedido.intentosSincronizacion > 0
                            ? `❌ Error (${pedido.intentosSincronizacion})`
                            : '⏳ Pendiente'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(pedido.data.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedPedido(pedido)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            👁️ Ver
                          </button>
                          
                          {!pedido.sincronizado && pedido.intentosSincronizacion > 0 && (
                            <button
                              onClick={() => handleReintentarPedido(pedido.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              🔄 Reintentar
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEliminarPedido(pedido.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay pedidos offline
              </h3>
              <p className="text-gray-500 mb-4">
                Los pedidos creados sin conexión aparecerán aquí
              </p>
              <button
                onClick={() => router.push('/ventas/RegistrarVenta')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Crear primer pedido
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedPedido && (
        <DetallePedido
          pedido={selectedPedido}
          onCerrar={() => setSelectedPedido(null)}
        />
      )}
    </div>
  );
}