// components/pedidos/BotonAccionesPedidos.jsx - Componente unificado
import { useState } from 'react';

export function BotonAccionesPedidos({ 
  // Props comunes
  onVolverMenu,
  loading = false,
  
  // Props para historial (operaciones múltiples)
  selectedPedidos = [],
  onCambiarEstado,
  onEliminarMultiple,
  onExportarPedidos,
  onImprimirMultiple,
  
  // Props para nuevo pedido
  onConfirmarPedido,
  onLimpiarPedido,
  cliente,
  productos = [],
  total = 0,
  
  // Props de configuración
  contexto = 'historial', // 'historial' | 'nuevo'
  mostrarEstadisticas = false,
  estadisticas = {},
  
  // Props adicionales
  textosPersonalizados = {}
}) {
  const [mostrarMenuEstados, setMostrarMenuEstados] = useState(false);

  // Textos por defecto
  const textos = {
    volverMenu: 'Volver al Menú',
    confirmarPedido: 'Confirmar Pedido',
    limpiarPedido: 'Limpiar Pedido',
    cambiarEstado: 'Cambiar Estado',
    exportar: 'EXPORTAR',
    imprimir: 'IMPRIMIR',
    eliminar: 'ELIMINAR',
    procesando: 'PROCESANDO...',
    guardando: 'Guardando...',
    ...textosPersonalizados
  };

  const handleCambiarEstado = (nuevoEstado) => {
    if (onCambiarEstado) {
      onCambiarEstado(nuevoEstado);
    }
    setMostrarMenuEstados(false);
  };

  // Componente para operaciones múltiples (historial)
  const AccionesMultiples = () => {
    if (selectedPedidos.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {/* Cambiar Estado */}
        {onCambiarEstado && (
          <div className="relative">
            <button 
              className={`px-4 py-2 rounded text-white font-semibold ${
                loading 
                  ? "bg-gray-500 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => setMostrarMenuEstados(!mostrarMenuEstados)}
              disabled={loading}
            >
              🔄 {textos.cambiarEstado} ({selectedPedidos.length})
            </button>
            
            {/* Dropdown de estados */}
            {mostrarMenuEstados && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-40">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-yellow-50 text-yellow-700 font-medium"
                  onClick={() => handleCambiarEstado('Exportado')}
                >
                  📤 Exportado
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium"
                  onClick={() => handleCambiarEstado('Facturado')}
                >
                  ✅ Facturado
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-700 font-medium"
                  onClick={() => handleCambiarEstado('Anulado')}
                >
                  ❌ Anulado
                </button>
              </div>
            )}
          </div>
        )}

        {/* Exportar/Imprimir Pedidos */}
        {(onExportarPedidos || onImprimirMultiple) && (
          <button 
            className={`px-4 py-2 rounded text-white font-semibold ${
              loading 
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-purple-600 hover:bg-purple-700"
            }`}
            onClick={onExportarPedidos || onImprimirMultiple}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {textos.procesando}
              </div>
            ) : (
              `📄 ${onExportarPedidos ? textos.exportar : textos.imprimir} (${selectedPedidos.length})`
            )}
          </button>
        )}

        {/* Eliminar Múltiple */}
        {onEliminarMultiple && (
          <button 
            className={`px-4 py-2 rounded text-white font-semibold ${
              loading 
                ? "bg-gray-500 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700"
            }`}
            onClick={onEliminarMultiple}
            disabled={loading}
          >
            🗑️ {textos.eliminar} ({selectedPedidos.length})
          </button>
        )}
      </div>
    );
  };

  // Componente para nuevo pedido
  const AccionesNuevoPedido = () => {
    const totalProductos = productos.reduce((acc, prod) => acc + (prod.cantidad || 0), 0);
    const hayDatos = cliente || productos.length > 0;

    return (
      <div className="flex flex-col gap-4">
        {/* Estadísticas del pedido actual */}
        {hayDatos && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="text-lg font-semibold text-gray-800">
              <p>Total de productos: <span className="text-blue-600">{totalProductos}</span></p>
              <p>Total del pedido: <span className="text-green-600">${Number(total).toFixed(2)}</span></p>
            </div>
          </div>
        )}
        
        {/* Botones principales */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          {/* Limpiar Pedido */}
          {onLimpiarPedido && hayDatos && (
            <button 
              className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded text-white font-semibold transition-colors"
              onClick={onLimpiarPedido}
              disabled={loading}
            >
              🗑️ {textos.limpiarPedido}
            </button>
          )}

          {/* Confirmar Pedido */}
          {onConfirmarPedido && (
            <button 
              className={`px-6 py-3 rounded text-white font-semibold transition-colors ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={onConfirmarPedido}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {textos.guardando}
                </div>
              ) : (
                `✅ ${textos.confirmarPedido}`
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Componente para estadísticas rápidas (opcional)
  const EstadisticasRapidas = () => {
    if (!mostrarEstadisticas || !estadisticas) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{estadisticas.total || 0}</div>
          <div className="text-sm text-blue-800">Total Pedidos</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{estadisticas.exportados || 0}</div>
          <div className="text-sm text-yellow-800">Exportados</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{estadisticas.facturados || 0}</div>
          <div className="text-sm text-green-800">Facturados</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{estadisticas.anulados || 0}</div>
          <div className="text-sm text-red-800">Anulados</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Estadísticas (opcional) */}
      <EstadisticasRapidas />
      
      {/* Contenido principal según contexto */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Acciones según contexto */}
        <div className="flex-1">
          {contexto === 'nuevo' ? (
            <AccionesNuevoPedido />
          ) : (
            <AccionesMultiples />
          )}
        </div>

        {/* Botón volver al menú (siempre visible) */}
        <div className="flex-shrink-0">
          <button 
            className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded text-white font-semibold transition-colors"
            onClick={onVolverMenu}
            disabled={loading}
          >
            🏠 {textos.volverMenu}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente simplificado para casos específicos
export function BotonesNuevoPedido(props) {
  return (
    <BotonAccionesPedidos 
      {...props} 
      contexto="nuevo"
    />
  );
}

export function BotonesHistorialPedidos(props) {
  return (
    <BotonAccionesPedidos 
      {...props} 
      contexto="historial"
    />
  );
}