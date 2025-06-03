import { useVenta } from '../../context/VentasContext';

function ControlCantidad({ cantidad, onCantidadChange }) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <button 
        className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
        onClick={() => onCantidadChange(cantidad - 1)}
      >
        -
      </button>
      <span>{cantidad}</span>
      <button 
        className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
        onClick={() => onCantidadChange(cantidad + 1)}
      >
        +
      </button>
    </div>
  );
}

function TablaEscritorio({ productos, onActualizarCantidad, onEliminar }) {
  return (
    <div className="hidden lg:block overflow-x-auto bg-white rounded shadow text-black">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Producto</th>
            <th className="p-2 text-center">Cantidad</th>
            <th className="p-2 text-right">Precio Unit.</th>
            <th className="p-2 text-center">IVA %</th>
            <th className="p-2 text-right">Subtotal</th>
            <th className="p-2 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {productos.length > 0 ? (
            productos.map((prod, idx) => {
              const precioUnitario = Number(prod.precio) || 0;
              const ivaPercent = Number(prod.iva) || 21;
              const subtotalSinIva = prod.cantidad * precioUnitario;
              
              return (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{prod.nombre}</td>
                  <td className="p-2 text-center">
                    <ControlCantidad
                      cantidad={prod.cantidad}
                      onCantidadChange={(nuevaCantidad) => onActualizarCantidad(idx, nuevaCantidad)}
                    />
                  </td>
                  <td className="p-2 text-right">${precioUnitario}</td>
                  <td className="p-2 text-center">{ivaPercent}%</td>
                  <td className="p-2 text-right font-medium">${subtotalSinIva.toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                      onClick={() => onEliminar(idx)}
                      title="Eliminar producto"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No hay productos agregados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMovil({ productos, onActualizarCantidad, onEliminar }) {
  return (
    <div className="lg:hidden space-y-4">
      {productos.length > 0 ? (
        productos.map((prod, idx) => {
          const precioUnitario = prod.precio || 0;
          const ivaPercent = prod.iva || 21;
          const subtotalSinIva = prod.cantidad * precioUnitario;
          
          return (
            <div key={idx} className="bg-white p-4 rounded shadow border">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-800 flex-1">{prod.nombre}</h4>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded ml-2 transition-colors"
                  onClick={() => onEliminar(idx)}
                  title="Eliminar producto"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 block">Cantidad:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <button 
                      className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
                      onClick={() => onActualizarCantidad(idx, prod.cantidad - 1)}
                    >
                      -
                    </button>
                    <span className="font-medium">{prod.cantidad}</span>
                    <button 
                      className="bg-gray-300 hover:bg-gray-400 text-black w-6 h-6 rounded flex items-center justify-center"
                      onClick={() => onActualizarCantidad(idx, prod.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600 block">Precio Unit.:</span>
                  <span className="font-medium">${precioUnitario}</span>
                </div>
                
                <div>
                  <span className="text-gray-600 block">IVA:</span>
                  <span className="font-medium">{ivaPercent}%</span>
                </div>
                
                <div>
                  <span className="text-gray-600 block">Subtotal:</span>
                  <span className="font-medium text-blue-600">${subtotalSinIva.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white p-4 rounded shadow text-center text-gray-500">
          No hay productos agregados
        </div>
      )}
    </div>
  );
}

function ResumenTotales({ productos }) {
  // Calcular subtotal neto (suma de todos los subtotales sin IVA)
  const subtotalNeto = productos.reduce((acc, prod) => {
    const precioUnitario = prod.precio || 0;
    return acc + (prod.cantidad * precioUnitario);
  }, 0);

  // Calcular IVA total (aplicar el porcentaje de IVA a cada producto)
  const ivaTotal = productos.reduce((acc, prod) => {
    const precioUnitario = prod.precio || 0;
    const ivaPercent = (prod.iva || 21) / 100;
    const subtotalProducto = prod.cantidad * precioUnitario;
    return acc + (subtotalProducto * ivaPercent);
  }, 0);

  // Total final
  const totalFinal = subtotalNeto + ivaTotal;

  if (productos.length === 0) return null;

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
      <h4 className="text-lg font-semibold mb-4 text-center text-gray-800">RESUMEN DE TOTALES</h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-300">
          <span className="text-gray-700 font-medium">SUBTOTAL NETO:</span>
          <span className="text-xl font-semibold text-gray-800">${subtotalNeto.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-300">
          <span className="text-gray-700 font-medium">IVA TOTAL:</span>
          <span className="text-xl font-semibold text-red-600">${ivaTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 bg-yellow-300 rounded-lg px-4 border-2 border-yellow-400">
          <span className="text-black text-xl font-bold">TOTAL FINAL:</span>
          <span className="text-black text-2xl font-bold">${totalFinal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductosCarrito() {
  const { productos, updateCantidad, removeProducto } = useVenta();

  const handleActualizarCantidad = (index, nuevaCantidad) => {
    const cantidadValida = Math.max(1, nuevaCantidad);
    updateCantidad(index, cantidadValida);
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Productos Seleccionados</h3>
      
      <TablaEscritorio
        productos={productos}
        onActualizarCantidad={handleActualizarCantidad}
        onEliminar={removeProducto}
      />
      
      <TarjetasMovil
        productos={productos}
        onActualizarCantidad={handleActualizarCantidad}
        onEliminar={removeProducto}
      />
      
      <ResumenTotales productos={productos} />
    </div>
  );
}