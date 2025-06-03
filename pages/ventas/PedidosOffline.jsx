// pages/ventas/PedidosOffline.jsx - VERSIÓN ACTUALIZADA
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import { usePedidos } from '../../hooks/ventas/usePedidos';

// Formateador de moneda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(value);
};

// Componente para el indicador de estado
function EstadoConectividad({ isOnline, pedidosPendientes }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
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
      
      {pedidosPendientes > 0 && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg">
          <span className="text-sm font-medium">
            ⏳ {pedidosPendientes} pedido{pedidosPendientes !== 1 ? 's' : ''} pendiente{pedidosPendientes !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar detalles de un pedido
function DetallePedido({ pedido, onCerrar }) {
  if (!pedido) return null;

  const totalProductos = pedido.data.productos?.reduce((acc, prod) => acc + prod.cantidad, 0) || 0;

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

        {/* Estado del pedido */}
        <div className={`p-3 rounded-lg mb-4 ${
          pedido.sincronizado 
            ? 'bg-green-50 border border-green-200' 
            : pedido.intentosSincronizacion > 0
            ? 'bg-red-50 border border-red-200'
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className={`font-medium ${
            pedido.sincronizado 
              ? 'text-green-800' 
              : pedido.intentosSincronizacion > 0
              ? 'text-red-800'
              : 'text-yellow-800'
          }`}>
            {pedido.sincronizado 
              ? '✅ Pedido Sincronizado' 
              : pedido.intentosSincronizacion > 0
              ? `❌ Error en Sincronización (${pedido.intentosSincronizacion} intentos)`
              : '⏳ Pendiente de Sincronización'
            }
          </div>
          {pedido.ultimoError && (
            <div className="text-sm text-red-600 mt-1">
              Último error: {pedido.ultimoError}
            </div>
          )}
          {pedido.fechaSincronizacion && (
            <div className="text-sm text-green-600 mt-1">
              Sincronizado: {new Date(pedido.fechaSincronizacion).toLocaleString('es-AR')}
            </div>
          )}
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
          {pedido.data.cliente_direccion && (
            <div className="mt-2">
              <p><strong>Dirección:</strong> {pedido.data.cliente_direccion}</p>
            </div>
          )}
        </div>

        {/* Información del pedido */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Información del Pedido</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p><strong>Fecha creación:</strong> {new Date(pedido.fechaCreacion).toLocaleString('es-AR')}</p>
            <p><strong>Total productos:</strong> {totalProductos} unidades</p>
            <p><strong>Estado:</strong> {pedido.data.estado || 'Registrado'}</p>
            <p><strong>Empleado:</strong> {pedido.data.empleado_nombre || 'No especificado'}</p>
            <p><strong>Subtotal:</strong> <span className="font-medium">{formatCurrency(pedido.data.subtotal || 0)}</span></p>
            <p><strong>IVA:</strong> <span className="font-medium">{formatCurrency(pedido.data.iva || 0)}</span></p>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-300">
            <p><strong>Total:</strong> <span className="text-lg font-bold text-green-600">{formatCurrency(pedido.data.total)}</span></p>
          </div>
        </div>

        {/* Observaciones */}
        {pedido.data.observaciones && (
          <div className="bg-amber-50 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-lg text-amber-800 mb-2">Observaciones</h3>
            <p className="text-amber-700 text-sm whitespace-pre-wrap">{pedido.data.observaciones}</p>
          </div>
        )}

        {/* Productos */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Productos</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border-b p-2 text-left">Producto</th>
                  <th className="border-b p-2 text-center">Unidad</th>
                  <th className="border-b p-2 text-center">Cantidad</th>
                  <th className="border-b p-2 text-right">Precio Unit.</th>
                  <th className="border-b p-2 text-right">IVA</th>
                  <th className="border-b p-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedido.data.productos && pedido.data.productos.length > 0 ? (
                  pedido.data.productos.map((producto, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-b p-2">{producto.nombre}</td>
                      <td className="border-b p-2 text-center">{producto.unidad_medida || 'Unidad'}</td>
                      <td className="border-b p-2 text-center">{producto.cantidad}</td>
                      <td className="border-b p-2 text-right">{formatCurrency(producto.precio)}</td>
                      <td className="border-b p-2 text-right">{formatCurrency(producto.iva || 0)}</td>
                      <td className="border-b p-2 text-right">{formatCurrency(producto.subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No hay productos en este pedido
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="5" className="p-2 text-right font-bold">Total:</td>
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
    loading,
    cargarPedidosOffline,
    sincronizarPedidos,
    eliminarPedidoOffline,
    reintentarPedido
  } = usePedidos();

  const [pedidos, setPedidos] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoadingPedidos(true);
    try {
      const resultado = await cargarPedidosOffline();
      setPedidos(resultado.todosPedidos || []);
      setPedidosPendientes(resultado.pendientes || []);
      console.log(`📋 Cargados ${resultado.todosPedidos?.length || 0} pedidos offline`);
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      toast.error('Error al cargar pedidos offline');
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleSincronizar = async () => {
    setSincronizando(true);
    try {
      const resultado = await sincronizarPedidos();
      if (resultado.success || resultado.sincronizados > 0) {
        await cargarDatos(); // Recargar para mostrar cambios
      }
    } finally {
      setSincronizando(false);
    }
  };

  const handleEliminarSincronizados = async () => {
    if (!window.confirm('¿Está seguro de eliminar todos los pedidos ya sincronizados?')) {
      return;
    }

    try {
      const pedidosSincronizados = pedidos.filter(p => p.sincronizado);
      let eliminados = 0;
      
      for (const pedido of pedidosSincronizados) {
        const resultado = await eliminarPedidoOffline(pedido.id);
        if (resultado.success) {
          eliminados++;
        }
      }
      
      if (eliminados > 0) {
        toast.success(`✅ ${eliminados} pedidos sincronizados eliminados`);
        await cargarDatos();
      }
    } catch (error) {
      console.error('❌ Error eliminando pedidos:', error);
      toast.error('Error al eliminar pedidos sincronizados');
    }
  };

  const handleEliminarPedido = async (pedidoId) => {
    if (!window.confirm('¿Está seguro de eliminar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    const resultado = await eliminarPedidoOffline(pedidoId);
    if (resultado.success) {
      await cargarDatos();
    }
  };

  const handleReintentarPedido = async (pedidoId) => {
    const resultado = await reintentarPedido(pedidoId);
    if (resultado.success) {
      await cargarDatos();
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    switch (filtro) {
      case 'pendientes':
        return !pedido.sincronizado;
      case 'sincronizados':
        return pedido.sincronizado;
      case 'errores':
        return !pedido.sincronizado && pedido.intentosSincronizacion > 0;
      default:
        return true;
    }
  });

  const totalPendientes = pedidosPendientes.length;
  const totalSincronizados = pedidos.filter(p => p.sincronizado).length;
  const totalErrores = pedidos.filter(p => !p.sincronizado && p.intentosSincronizacion > 0).length;

  if (loadingPedidos) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <span className="mt-3 block text-lg">Cargando pedidos offline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Exportar Nota de Pedido</title>
        <meta name="description" content="Gestión de pedidos offline y sincronización" />
      </Head>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Exportar Nota de Pedido</h1>
              <p className="text-gray-600">Gestión de pedidos almacenados localmente y sincronización</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <EstadoConectividad isOnline={isOnline} pedidosPendientes={totalPendientes} />
              
              <button
                onClick={() => router.push('/ventas/RegistrarVenta')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Nuevo Pedido
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-600 text-sm">Con Errores</p>
                <p className="text-2xl font-bold text-red-600">{totalErrores}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltro('todos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtro === 'todos' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos ({pedidos.length})
              </button>
              <button
                onClick={() => setFiltro('pendientes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtro === 'pendientes' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pendientes ({totalPendientes})
              </button>
              <button
                onClick={() => setFiltro('sincronizados')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtro === 'sincronizados' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sincronizados ({totalSincronizados})
              </button>
              {totalErrores > 0 && (
                <button
                  onClick={() => setFiltro('errores')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filtro === 'errores' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Errores ({totalErrores})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSincronizar}
                disabled={!isOnline || sincronizando || totalPendientes === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !isOnline || sincronizando || totalPendientes === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {sincronizando ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sincronizando...
                  </div>
                ) : (
                  '📤 Sincronizar Pendientes'
                )}
              </button>

              {totalSincronizados > 0 && (
                <button
                  onClick={handleEliminarSincronizados}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🗑️ Limpiar Sincronizados
                </button>
              )}

              <button
                onClick={cargarDatos}
                disabled={loadingPedidos}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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
                      Observaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
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
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {pedido.data.observaciones ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                            📝 Con observaciones
                          </span>
                        ) : (
                          <span className="text-gray-400">Sin observaciones</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedPedido(pedido)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            👁️ Ver
                          </button>
                          
                          {!pedido.sincronizado && pedido.intentosSincronizacion > 0 && (
                            <button
                              onClick={() => handleReintentarPedido(pedido.id)}
                              className="text-yellow-600 hover:text-yellow-900 font-medium"
                            >
                              🔄 Reintentar
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEliminarPedido(pedido.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
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
                {filtro === 'todos' 
                  ? 'No hay pedidos offline' 
                  : `No hay pedidos ${filtro === 'pendientes' ? 'pendientes' : filtro === 'sincronizados' ? 'sincronizados' : 'con errores'}`
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {filtro === 'todos' 
                  ? 'Los pedidos creados sin conexión aparecerán aquí'
                  : 'Cambie el filtro para ver otros pedidos'
                }
              </p>
              {filtro === 'todos' && (
                <button
                  onClick={() => router.push('/ventas/RegistrarVenta')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Crear primer pedido
                </button>
              )}
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