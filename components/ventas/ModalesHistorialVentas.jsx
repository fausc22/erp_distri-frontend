
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

function InformacionAdicional({ venta }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
}

function TablaProductosEscritorio({ productos, onEditarProducto, onEliminarProducto }) {
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
            <th className="p-2 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            const precio = Number(producto.precio) || 0;
            const cantidad = Number(producto.cantidad) || 0;
            const ivaValue = Number(producto.iva) || 0;
            const subtotalSinIva = cantidad * precio;
            
            return (
              <tr key={producto.id} 
                  className="hover:bg-gray-100 cursor-pointer border-b"
                  onDoubleClick={() => onEditarProducto(producto)}>
                <td className="p-2 font-mono text-xs">{producto.producto_id}</td>
                <td className="p-2 font-medium">{producto.producto_nombre}</td>
                <td className="p-2 text-center">{producto.producto_um}</td>
                <td className="p-2 text-center font-semibold">{cantidad}</td>
                <td className="p-2 text-right">${precio.toFixed(2)}</td>
                <td className="p-2 text-right">${ivaValue.toFixed(2)}</td>
                <td className="p-2 text-right font-semibold">${subtotalSinIva.toFixed(2)}</td>
                <td className="p-2 text-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarProducto(producto);
                    }}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                    title="Eliminar producto"
                  >
                    <MdDeleteForever size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasProductosMovil({ productos, onEditarProducto, onEliminarProducto }) {
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
              <button
                className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded ml-2 transition-colors text-xs"
                onClick={() => onEliminarProducto(producto)}
                title="Eliminar producto"
              >
                ✕
              </button>
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
            
            <button
              onClick={() => onEditarProducto(producto)}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs transition-colors"
            >
              Editar
            </button>
          </div>
        );
      })}
    </div>
  );
}

function TablaProductos({ productos, onEditarProducto, onEliminarProducto, loading }) {
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
        <div className="font-medium">No hay productos en este pedido</div>
      </div>
    );
  }

  return (
    <>
      <TablaProductosEscritorio
        productos={productos}
        onEditarProducto={onEditarProducto}
        onEliminarProducto={onEliminarProducto}
      />
      <TarjetasProductosMovil
        productos={productos}
        onEditarProducto={onEditarProducto}
        onEliminarProducto={onEliminarProducto}
      />
    </>
  );
}

function ResumenTotales({ productos }) {
  // Calcular subtotal neto (suma de todos los subtotales sin IVA)
  const subtotalNeto = productos.reduce((acc, prod) => {
    const precio = Number(prod.precio) || 0;
    const cantidad = Number(prod.cantidad) || 0;
    return acc + (cantidad * precio);
  }, 0);

  // Calcular IVA total (suma de todos los IVAs)
  const ivaTotal = productos.reduce((acc, prod) => {
    const ivaValue = Number(prod.iva) || 0;
    return acc + ivaValue;
  }, 0);

  // Total final
  const totalFinal = subtotalNeto + ivaTotal;

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
        
        <div className="flex justify-between items-center py-2 bg-yellow-300 rounded-lg px-3 border-2 border-yellow-400">
          <span className="text-black font-bold">TOTAL:</span>
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
  onAgregarProducto,
  onEditarProducto,
  onEliminarProducto,
  onFacturar
}) {
  const [clienteExpandido, setClienteExpandido] = useState(false);

  if (!venta) return null;

  const toggleClienteExpansion = () => {
    setClienteExpandido(!clienteExpandido);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Detalles del Pedido</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Fecha */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-700">
              <strong>Fecha:</strong> {venta.fecha}
            </h4>
          </div>
          
          {/* Información del Cliente (colapsable) */}
          <InformacionCliente 
            venta={venta} 
            expandido={clienteExpandido}
            onToggleExpansion={toggleClienteExpansion}
          />

          {/* Información Adicional */}
          <InformacionAdicional venta={venta} />
          
          {/* Sección de productos */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Productos del Pedido</h3>
              <button 
                onClick={onAgregarProducto}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors text-sm"
              >
                AGREGAR PRODUCTO
              </button>
            </div>
            
            <TablaProductos
              productos={productos}
              onEditarProducto={onEditarProducto}
              onEliminarProducto={onEliminarProducto}
              loading={loading}
            />

            <ResumenTotales productos={productos} />
          </div>
          
          {/* Botón de facturar */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={onFacturar}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-lg transition-colors w-full sm:w-auto"
            >
              FACTURAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// components/ModalEditarProducto.jsx
export function ModalEditarProducto({ 
  producto, 
  onClose, 
  onGuardar,
  onChange
}) {
  if (!producto) return null;

  const handleCantidadChange = (e) => {
    const nuevaCantidad = Math.max(1, parseInt(e.target.value) || 1);
    const precio = Number(producto.precio) || 0;
    const nuevoSubtotal = (nuevaCantidad * precio).toFixed(2);
    
    onChange({
      ...producto,
      cantidad: nuevaCantidad,
      subtotal: nuevoSubtotal
    });
  };

  const handlePrecioChange = (e) => {
    const nuevoPrecio = Math.max(0, parseFloat(e.target.value) || 0);
    const cantidad = Number(producto.cantidad) || 1;
    const nuevoSubtotal = (cantidad * nuevoPrecio).toFixed(2);
    
    onChange({
      ...producto,
      precio: nuevoPrecio,
      subtotal: nuevoSubtotal
    });
  };

  const precio = Number(producto.precio) || 0;
  const cantidad = Number(producto.cantidad) || 1;
  const subtotal = cantidad * precio;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Editar Producto</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm">Código:</label>
              <input 
                type="text"
                className="border p-2 w-full rounded bg-gray-100 text-sm"
                value={producto.producto_id || ''}
                disabled
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">Nombre:</label>
              <input 
                type="text"
                className="border p-2 w-full rounded bg-gray-100 text-sm"
                value={producto.producto_nombre || ''}
                disabled
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-sm">Unidad de Medida:</label>
              <input 
                type="text"
                className="border p-2 w-full rounded bg-gray-100 text-sm"
                value={producto.producto_um || ''}
                disabled
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-sm">Precio ($):</label>
              <div className="flex items-center">
                <span className="mr-1">$</span>
                <input 
                  type="number"
                  className="border p-2 w-full rounded text-sm"
                  value={precio}
                  onChange={handlePrecioChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-sm">Cantidad:</label>
              <div className="flex items-center space-x-2">
                <button 
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                  onClick={() => handleCantidadChange({ target: { value: cantidad - 1 } })}
                >
                  -
                </button>
                <input 
                  type="number"
                  className="border p-2 w-16 rounded text-sm text-center"
                  value={cantidad}
                  onChange={handleCantidadChange}
                  min="1"
                />
                <button 
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                  onClick={() => handleCantidadChange({ target: { value: cantidad + 1 } })}
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-sm">Subtotal (sin IVA):</label>
              <div className="flex items-center">
                <span className="mr-1">$</span>
                <input 
                  type="text"
                  className="border p-2 w-full rounded bg-gray-100 text-sm"
                  value={subtotal.toFixed(2)}
                  disabled
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-2">
            <button 
              onClick={onGuardar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Guardar Cambios
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalEliminarProducto({ 
  producto, 
  onClose, 
  onConfirmar 
}) {
  if (!producto) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Confirmar Eliminación</h2>
          
          <p className="text-center my-4">
            ¿Estás seguro de que deseas eliminar <strong>{producto.cantidad}</strong> unidades de <strong>{producto.producto_nombre}</strong>?
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button 
              onClick={onConfirmar}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Sí, eliminar
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              No, cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { MdSearch } from "react-icons/md";
import { useProductoSearch } from '../../hooks/useBusquedaProductos';

export function ModalAgregarProductoVenta({ 
  mostrar, 
  onClose, 
  onAgregarProducto 
}) {
  const [productQuantity, setProductQuantity] = useState(1);
  const {
    busqueda,
    setBusqueda,
    resultados,
    productoSeleccionado,
    loading,
    buscarProducto,
    seleccionarProducto,
    limpiarSeleccion
  } = useProductoSearch();

  const handleAgregarProducto = async () => {
    if (!productoSeleccionado || productQuantity < 1) {
      return;
    }

    const exito = await onAgregarProducto(productoSeleccionado, productQuantity);
    if (exito) {
      setProductQuantity(1);
      limpiarSeleccion();
      onClose();
    }
  };

  const handleClose = () => {
    setProductQuantity(1);
    limpiarSeleccion();
    onClose();
  };

  if (!mostrar) return null;

  const precio = Number(productoSeleccionado?.precio) || 0;
  const subtotal = precio * productQuantity;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Buscar Producto</h2>
          
          <div className="flex items-center gap-2 mb-6">
            <input 
              type="text"
              className="border p-2 flex-grow rounded"
              placeholder="Buscar Producto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button 
              onClick={buscarProducto}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 transition-colors"
            >
              <MdSearch size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lista de productos */}
            <div className="border rounded p-4 h-64 md:h-80 overflow-y-auto">
              <h3 className="font-bold mb-2">Productos Encontrados</h3>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : resultados.length > 0 ? (
                resultados.map((product, index) => (
                  <div 
                    key={index}
                    className={`p-2 border-b cursor-pointer transition-colors ${
                      productoSeleccionado?.id === product.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => seleccionarProducto(product)}
                  >
                    <div className="font-medium text-sm">{product.nombre}</div>
                    <div className="text-xs text-gray-600">Código: {product.id}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay productos para mostrar</p>
              )}
            </div>
            
            {/* Detalles del producto */}
            <div className="border rounded p-4">
              <h3 className="font-bold mb-4">Detalles del Producto</h3>
              {productoSeleccionado ? (
                <div className="space-y-3 text-sm">
                  <p><strong>Código:</strong> {productoSeleccionado.id}</p>
                  <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
                  <p><strong>Unidad de Medida:</strong> {productoSeleccionado.unidad_medida}</p>
                  <p><strong>Precio:</strong> ${precio.toFixed(2)}</p>
                  <p><strong>Stock:</strong> {productoSeleccionado.stock_actual}</p>
                  
                  <div className="mt-4">
                    <label className="block mb-1 font-medium">Cantidad:</label>
                    <div className="flex items-center space-x-2">
                      <button 
                        type="button"
                        className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                        onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        className="border p-2 w-16 rounded text-sm text-center"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Math.max(1, Number(e.target.value)))}
                        min="1"
                      />
                      <button 
                        type="button"
                        className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                        onClick={() => setProductQuantity(productQuantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="font-semibold">Subtotal (sin IVA): ${subtotal.toFixed(2)}</p>
                  </div>
                  
                  <button 
                    onClick={handleAgregarProducto}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full transition-colors"
                  >
                    Agregar Producto
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Seleccione un producto de la lista</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}