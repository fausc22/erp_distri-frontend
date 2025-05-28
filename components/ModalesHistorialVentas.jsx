// components/ModalDetalleVenta.jsx
import { MdDeleteForever } from "react-icons/md";

function InformacionVenta({ venta }) {
  return (
    <>
      <h4 className="mt-2"><strong>Fecha:</strong> {venta.fecha}</h4>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
        {/* Información del Cliente */}
        <div className="w-full md:w-1/2">
          <h3 className="font-bold mb-2">Información del Cliente</h3>
          <p><strong>Cliente:</strong> {venta.cliente_nombre}</p>
          <p><strong>Dirección:</strong> {venta.cliente_direccion}</p>
          <p><strong>Ciudad:</strong> {venta.cliente_ciudad}</p>
          <p><strong>Provincia:</strong> {venta.cliente_provincia}</p>
          <p><strong>Condición IVA:</strong> {venta.cliente_condicion}</p>
          <p><strong>CUIT:</strong> {venta.cliente_cuit}</p>
        </div>
        
        {/* Información del Documento */}
        <div className="w-full md:w-1/2">
          <h3 className="font-bold mb-2">Información del Documento</h3>
          <p><strong>DOCUMENTO:</strong> {venta.tipo_documento}</p>
          <p><strong>TIPO FISCAL:</strong> {venta.tipo_fiscal}</p>
          <p><strong>Total:</strong> $ {venta.total}</p>
          <p><strong>ESTADO:</strong> {venta.estado}</p>
          <p><strong>CAE:</strong> {venta.cae_id ? '✓' : '✗'}</p>
          <p><strong>FECHA CAE:</strong> {venta.cae_fecha}</p>
        </div>
      </div>
    </>
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

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Código</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">UM</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Precio ($)</th>
            <th className="p-2">IVA ($)</th>
            <th className="p-2">Subtotal ($)</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {productos.length > 0 ? (
            productos.map((producto) => (
              <tr key={producto.id} 
                  className="hover:bg-gray-100 cursor-pointer"
                  onDoubleClick={() => onEditarProducto(producto)}>
                <td className="p-2">{producto.producto_id}</td>
                <td className="p-2">{producto.producto_nombre}</td>
                <td className="p-2">{producto.producto_um}</td>
                <td className="p-2">{producto.cantidad}</td>
                <td className="p-2">{producto.precio}</td>
                <td className="p-2">{producto.iva}</td>
                <td className="p-2">{producto.subtotal}</td>
                <td className="p-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEliminarProducto(producto);
                    }}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <MdDeleteForever size={20} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="p-4 text-center text-gray-500">
                No hay productos en este pedido
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
  onGenerarPDF,
  onCargarComprobante,
  onSolicitarCAE,
  generandoPDF = false
}) {
  if (!venta) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Detalles del Pedido</h2>
        
        <InformacionVenta venta={venta} />
        
        {/* Sección de productos */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Productos</h3>
            <button 
              onClick={onAgregarProducto}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
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
        </div>
        
        {/* Botones de acción */}
        <div className="flex flex-wrap justify-between gap-2 mt-6">
          <div>
            <button 
              onClick={onCargarComprobante}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
            >
              CARGAR COMPROBANTE
            </button>
          </div>
          <div>
            <button 
              onClick={onGenerarPDF}
              disabled={generandoPDF}
              className={`px-4 py-2 rounded mr-2 text-white ${
                generandoPDF 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {generandoPDF ? 'GENERANDO...' : 'IMPRIMIR FACTURA'}
            </button>
            <button 
              onClick={onSolicitarCAE}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
            >
              SOLICITAR CAE
            </button>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="mt-4 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Cerrar
        </button>
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
    const nuevoSubtotal = (nuevaCantidad * producto.precio).toFixed(2);
    
    onChange({
      ...producto,
      cantidad: nuevaCantidad,
      subtotal: nuevoSubtotal
    });
  };

  const handlePrecioChange = (e) => {
    const nuevoPrecio = Math.max(0, parseFloat(e.target.value) || 0);
    const nuevoSubtotal = (producto.cantidad * nuevoPrecio).toFixed(2);
    
    onChange({
      ...producto,
      precio: nuevoPrecio,
      subtotal: nuevoSubtotal
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-center">Editar Producto</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Nombre:</label>
            <input 
              type="text"
              className="border p-2 w-full rounded bg-gray-100"
              value={producto.producto_nombre || ''}
              disabled
            />
          </div>
          
          <div>
            <label className="block mb-1">Unidad de Medida:</label>
            <input 
              type="text"
              className="border p-2 w-full rounded bg-gray-100"
              value={producto.producto_um || ''}
              disabled
            />
          </div>
          
          <div>
            <label className="block mb-1">Precio ($):</label>
            <div className="flex items-center">
              <span className="mr-1">$</span>
              <input 
                type="number"
                className="border p-2 w-full rounded"
                value={producto.precio || 0}
                onChange={handlePrecioChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-1">Cantidad:</label>
            <input 
              type="number"
              className="border p-2 w-24 rounded"
              value={producto.cantidad || 1}
              onChange={handleCantidadChange}
              min="1"
            />
          </div>
          
          <div>
            <label className="block mb-1">Subtotal ($):</label>
            <div className="flex items-center">
              <span className="mr-1">$</span>
              <input 
                type="text"
                className="border p-2 w-full rounded bg-gray-100"
                value={producto.subtotal || 0}
                disabled
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button 
            onClick={onGuardar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Guardar Cambios
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            Cancelar
          </button>
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-center">Confirmar Eliminación</h2>
        
        <p className="text-center my-4">
          ¿Estás seguro de que deseas eliminar <strong>{producto.cantidad}</strong> unidades de <strong>{producto.producto_nombre}</strong>?
        </p>
        
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={onConfirmar}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          >
            Sí, eliminar
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            No, cancelar
          </button>
        </div>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { MdSearch } from "react-icons/md";
import { useProductoSearch } from '../hooks/useBusquedaProductos';

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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
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
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50"
          >
            <MdSearch size={24} />
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Lista de productos */}
          <div className="border rounded p-4 h-80 overflow-y-auto">
            <h3 className="font-bold mb-2">Productos Encontrados</h3>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : resultados.length > 0 ? (
              resultados.map((product, index) => (
                <div 
                  key={index}
                  className={`p-2 border-b cursor-pointer ${productoSeleccionado?.id === product.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => seleccionarProducto(product)}
                >
                  {product.nombre}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay productos para mostrar</p>
            )}
          </div>
          
          {/* Detalles del producto */}
          <div className="border rounded p-4">
            <h3 className="font-bold mb-4">Detalles del Producto</h3>
            {productoSeleccionado ? (
              <div>
                <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
                <p><strong>Unidad de Medida:</strong> {productoSeleccionado.unidad_medida}</p>
                <p><strong>Precio:</strong> ${productoSeleccionado.precio}</p>
                <p><strong>Stock:</strong> {productoSeleccionado.stock_actual}</p>
                
                <div className="mt-4">
                  <label className="block mb-1">Cantidad:</label>
                  <input 
                    type="number"
                    className="border p-2 w-24 rounded"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Math.max(1, Number(e.target.value)))}
                    min="1"
                  />
                </div>
                
                <p className="mt-2"><strong>Subtotal:</strong> ${(productoSeleccionado.precio * productQuantity).toFixed(2)}</p>
                
                <button 
                  onClick={handleAgregarProducto}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                >
                  Agregar Producto
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Seleccione un producto de la lista</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}