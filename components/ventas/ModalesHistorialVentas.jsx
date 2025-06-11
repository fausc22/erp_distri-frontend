import React, { useState } from "react";
import { toast } from 'react-hot-toast';
import { MdDeleteForever, MdExpandMore, MdExpandLess } from "react-icons/md";


function InformacionCliente({ venta, expandido, onToggleExpansion }) {
  return (
    <div className="bg-blue-50 rounded-lg overflow-hidden mb-4">
      {/* Información básica del cliente (siempre visible) */}
      <div 
        className="p-3 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
        onClick={onToggleExpansion}
      >
        <div>
          <h3 className="font-bold text-lg text-blue-800">Cliente: {venta.cliente_nombre}</h3>
          <p className="text-blue-600 text-sm">
            {venta.cliente_ciudad || 'Ciudad no especificada'}
            {venta.cliente_provincia && `, ${venta.cliente_provincia}`}
          </p>
        </div>
        <div className="text-blue-600">
          {expandido ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
        </div>
      </div>

      {/* Información detallada del cliente (expandible) */}
      <div className={`transition-all duration-300 ease-in-out ${
        expandido ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-3 pb-3 border-t border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
            <div>
              <span className="font-medium text-blue-700">Dirección:</span>
              <p className="text-gray-700">{venta.cliente_direccion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Condición IVA:</span>
              <p className="text-gray-700">{venta.cliente_condicion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">CUIT:</span>
              <p className="text-gray-700">{venta.cliente_cuit || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Teléfono:</span>
              <p className="text-gray-700">{venta.cliente_telefono || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InformacionAdicional({ venta, cuenta }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Observaciones</h3>
          <p className="text-lg text-gray-700">
            {venta.observaciones || 'Sin observaciones especiales'}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Empleado</h3>
          <p className="text-lg font-semibold text-blue-600">
            {venta.empleado_nombre || 'No especificado'}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Cuenta Destino</h3>
          <p className="text-lg font-semibold text-blue-600">
            {cuenta?.nombre || 'No especificado'}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Tipo Documento</h3>
          <p className="text-lg font-semibold text-green-600">
            {venta.tipo_doc || 'No especificado'}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Tipo Fiscal</h3>
          <p className="text-lg font-semibold text-purple-600">
            {venta.tipo_f || 'No especificado'}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Estado CAE</h3>
          <div className="flex items-center gap-2">
            {venta.cae_id ? (
              <>
                <span className="text-green-600 text-lg">✅</span>
                <span className="text-lg font-semibold text-green-600">Aprobado</span>
              </>
            ) : (
              <>
                <span className="text-red-600 text-lg">❌</span>
                <span className="text-lg font-semibold text-red-600">Pendiente</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TablaProductosEscritorio({ productos }) {
  return (
    <div className="hidden lg:block overflow-x-auto bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-center">UM</th>
            <th className="p-2 text-center">Cant.</th>
            <th className="p-2 text-right">Precio</th>
            <th className="p-2 text-right">IVA</th>
            <th className="p-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            const precio = Number(producto.precio) || 0;
            const cantidad = Number(producto.cantidad) || 0;
            const ivaValue = Number(producto.iva) || 0;
            const subtotalSinIva = cantidad * precio;
            
            return (
              <tr key={producto.id} className="hover:bg-gray-100 border-b">
                <td className="p-2 font-mono text-xs">{producto.producto_id}</td>
                <td className="p-2 font-medium">{producto.producto_nombre}</td>
                <td className="p-2 text-center">{producto.producto_um}</td>
                <td className="p-2 text-center font-semibold">{cantidad}</td>
                <td className="p-2 text-right">${precio.toFixed(2)}</td>
                <td className="p-2 text-right">${ivaValue.toFixed(2)}</td>
                <td className="p-2 text-right font-semibold">${subtotalSinIva.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasProductosMovil({ productos }) {
  return (
    <div className="lg:hidden space-y-3">
      {productos.map((producto) => {
        const precio = Number(producto.precio) || 0;
        const cantidad = Number(producto.cantidad) || 0;
        const ivaValue = Number(producto.iva) || 0;
        const subtotalSinIva = cantidad * precio;
        
        return (
          <div key={producto.id} className="bg-white p-3 rounded shadow border">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">{producto.producto_nombre}</h4>
                <p className="text-xs text-gray-500">Código: {producto.producto_id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 block">UM:</span>
                <span className="font-medium">{producto.producto_um}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Cantidad:</span>
                <span className="font-semibold text-blue-600">{cantidad}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Precio:</span>
                <span className="font-medium">${precio.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600 block">IVA:</span>
                <span className="font-medium">${ivaValue.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs">Subtotal:</span>
                <span className="font-semibold text-green-600">${subtotalSinIva.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TablaProductos({ productos, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando productos...</span>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded shadow p-8 text-center text-gray-500">
        <div className="text-4xl mb-2">📦</div>
        <div className="font-medium">No hay productos en esta venta</div>
      </div>
    );
  }

  return (
    <>
      <TablaProductosEscritorio productos={productos} />
      <TarjetasProductosMovil productos={productos} />
    </>
  );
}

function ResumenTotales({ productos, venta }) {
  // Usar totales de la venta si están disponibles, sino calcular
  const subtotalNeto = venta?.subtotal ? Number(venta.subtotal) : productos.reduce((acc, prod) => {
    const precio = Number(prod.precio) || 0;
    const cantidad = Number(prod.cantidad) || 0;
    return acc + (cantidad * precio);
  }, 0);

  const ivaTotal = venta?.iva_total ? Number(venta.iva_total) : productos.reduce((acc, prod) => {
    const ivaValue = Number(prod.iva) || 0;
    return acc + ivaValue;
  }, 0);

  const totalFinal = venta?.total ? Number(venta.total) : subtotalNeto + ivaTotal;

  if (productos.length === 0) return null;

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between items-center py-1 border-b border-gray-300 text-sm">
          <span className="text-gray-700 font-medium">SUBTOTAL NETO:</span>
          <span className="font-semibold text-gray-800">${subtotalNeto.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-1 border-b border-gray-300 text-sm">
          <span className="text-gray-700 font-medium">IVA TOTAL:</span>
          <span className="font-semibold text-red-600">${ivaTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 bg-green-300 rounded-lg px-3 border-2 border-green-400">
          <span className="text-black font-bold">TOTAL FACTURADO:</span>
          <span className="text-black text-lg font-bold">${totalFinal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export function ModalDetalleVenta({ 
  venta,
  productos,
  loading,
  onClose,
  onImprimirFacturaIndividual,
  cuenta,
  generandoPDF = false
}) {
  const [clienteExpandido, setClienteExpandido] = useState(false);

  if (!venta) return null;

  const toggleClienteExpansion = () => {
    setClienteExpandido(!clienteExpandido);
  };

  const handleSolicitarCAEDetalle = () => {
    if (venta.cae_id) {
      toast.error('Esta factura ya tiene CAE asignado.');
      return;
    }
    toast.error('Funcionalidad por implementar.');
  };

  const handleCerrarModal = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Detalles de la Venta</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Fecha y Estado */}
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h4 className="text-lg font-semibold text-gray-700">
              <strong>Fecha:</strong> {venta.fecha}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {venta.estado || 'Facturada'}
              </span>
            </div>
          </div>
          
          {/* Información del Cliente (colapsable) */}
          <InformacionCliente 
            venta={venta} 
            expandido={clienteExpandido}
            onToggleExpansion={toggleClienteExpansion}
          />

          {/* Información Adicional */}
          <InformacionAdicional venta={venta} cuenta={cuenta} />
          
          {/* Sección de productos */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Productos de la Venta</h3>
            </div>
            
            <TablaProductos
              productos={productos}
              loading={loading}
            />

            <ResumenTotales productos={productos} venta={venta} />
          </div>
          
          {/* Botones de acción - SIN BOTÓN ANULAR */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={onImprimirFacturaIndividual}
              disabled={generandoPDF}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              {generandoPDF ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Generando...
                </>
              ) : (
                'Imprimir Factura'
              )}
            </button>
            
            {!venta.cae_id && (
              <button
                onClick={handleSolicitarCAEDetalle}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              >
                Solicitar CAE
              </button>
            )}
            
            <button
              onClick={handleCerrarModal}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}