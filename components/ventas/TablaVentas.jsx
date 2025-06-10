// components/ventas/TablaVentas.jsx
import { useState } from 'react';

export default function TablaVentas({
  ventas,
  selectedVentas,
  onSelectVenta,
  onSelectAll,
  onRowDoubleClick,
  loading
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedVentas = [...ventas].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Manejar campos numéricos
    if (sortField === 'id' || sortField === 'total') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }
    
    // Manejar fechas
    if (sortField === 'fecha') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Manejar texto
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Cargando pedidos...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 text-center">
              <input
                type="checkbox"
                checked={selectedVentas.length === ventas.length && ventas.length > 0}
                onChange={() => onSelectAll(ventas)}
                className="w-4 h-4"
              />
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => handleSort('id')}
            >
              ID {getSortIcon('id')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => handleSort('fecha')}
            >
              Fecha {getSortIcon('fecha')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => handleSort('cliente_nombre')}
            >
              Cliente {getSortIcon('cliente_nombre')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              
            >
              Documento
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              
            >
              TIPO
            </th>
            <th 
              className="p-3 text-right cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => handleSort('total')}
            >
              Total {getSortIcon('total')}
            </th>
            <th 
              className="p-3 text-left cursor-pointer hover:bg-gray-300 transition-colors"
              
            >
              CAE
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedVentas.length > 0 ? (
            sortedVentas.map((venta) => (
              <tr
                key={venta.id}
                className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedVentas.some(v => v.id === venta.id) ? 'bg-blue-50' : ''
                }`}
                onDoubleClick={() => onRowDoubleClick(venta)}
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedVentas.some(v => v.id === venta.id)}
                    onChange={() => onSelectVenta(venta)}
                    className="w-4 h-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="p-3 font-mono text-sm font-semibold text-blue-600">
                  #{venta.id}
                </td>
                <td className="p-3">
                  {new Date(venta.fecha).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </td>
                <td className="p-3 font-medium">
                  {venta.cliente_nombre || 'Cliente no especificado'}
                </td>
                <td className="p-3 font-medium">
                  {venta.tipo_doc || 'Cliente no especificado'}
                </td>
                <td className="p-3 font-medium">
                  {venta.tipo_f || 'Cliente no especificado'}
                </td>
                <td className="p-3 text-right font-semibold text-green-600">
                  ${Number(venta.total || 0).toFixed(2)}
                </td>
                <td className="p-3 flex items-center gap-2">
                  
                  {venta.cae_id ? (
                    <span className="text-green-600 text-lg">✔️</span>
                  ) : (
                    <span className="text-red-600 text-lg">❌</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <div className="text-4xl mb-2">📋</div>
                  <div className="text-lg font-medium">No hay ventas registradas</div>
                  <div className="text-sm">Las ventas aparecerán aquí cuando se registren</div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {ventas.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {selectedVentas.length > 0 && (
                <span className="font-medium text-blue-600">
                  {selectedVentas.length} de {ventas.length} seleccionadas
                </span>
              )}
            </span>
            <span>
              Total de pedidos: <span className="font-medium">{ventas.length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}