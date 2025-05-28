import { Fragment } from 'react';

function TablaEscritorio({ 
  ventas, 
  selectedVentas, 
  onSelectVenta, 
  onSelectAll, 
  onRowDoubleClick 
}) {
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded shadow text-black">
      <table className="w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 w-10">
              <input 
                type="checkbox" 
                onChange={() => onSelectAll(ventas)}
                checked={ventas.length > 0 && ventas.every(v => selectedVentas.includes(v.id))}
                className="w-4 h-4"
              />
            </th>
            <th className="p-2">ID</th>
            <th className="p-2">Fecha</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Tipo Doc.</th>
            <th className="p-2">Tipo Fiscal</th>
            <th className="p-2">TOTAL ($)</th>
            <th className="p-2">Estado</th>
            <th className="p-2">CAE</th>
          </tr>
        </thead>
        <tbody>
          {ventas.length > 0 ? (
            ventas.map((venta) => (
              <tr key={venta.id} className="hover:bg-gray-100 cursor-pointer">
                <td className="p-2 text-center">
                  <input 
                    type="checkbox"
                    checked={selectedVentas.includes(venta.id)}
                    onChange={() => onSelectVenta(venta.id)}
                    className="w-4 h-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="p-2 text-center" onDoubleClick={() => onRowDoubleClick(venta)}>{venta.id}</td>
                <td className="p-2" onDoubleClick={() => onRowDoubleClick(venta)}>{venta.fecha}</td>
                <td className="p-2" onDoubleClick={() => onRowDoubleClick(venta)}>{venta.cliente_nombre}</td>
                <td className="p-2" onDoubleClick={() => onRowDoubleClick(venta)}>{venta.tipo_documento}</td>
                <td className="p-2" onDoubleClick={() => onRowDoubleClick(venta)}>{venta.tipo_fiscal}</td>
                <td className="p-2" onDoubleClick={() => onRowDoubleClick(venta)}>${venta.total}</td>
                <td className="p-2" onDoubleClick={() => onRowDoubleClick(venta)}>{venta.estado}</td>
                <td className="p-2 text-center" onDoubleClick={() => onRowDoubleClick(venta)}>
                  <span className={`inline-block px-2 py-1 rounded ${venta.cae_id ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {venta.cae_id ? '✓' : '✗'}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="p-4 text-center text-gray-500">
                No hay ventas registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMoviles({ 
  ventas, 
  selectedVentas, 
  onSelectVenta, 
  onRowDoubleClick 
}) {
  return (
    <div className="md:hidden space-y-4">
      {ventas.length > 0 ? (
        ventas.map((venta) => (
          <div key={venta.id} className="bg-white p-4 rounded shadow hover:bg-gray-50 cursor-pointer">
            <div className="flex justify-between items-center mb-2">
              <input 
                type="checkbox"
                checked={selectedVentas.includes(venta.id)}
                onChange={() => onSelectVenta(venta.id)}
                className="w-4 h-4"
                onClick={(e) => e.stopPropagation()}
              />
              <span className={`inline-block px-2 py-1 rounded ${venta.cae_id ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                {venta.cae_id ? '✓' : '✗'}
              </span>
            </div>
            <div onClick={() => onRowDoubleClick(venta)}>
              <div className="flex justify-between">
                <span className="font-bold">ID:</span>
                <span>{venta.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Fecha:</span>
                <span>{venta.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Cliente:</span>
                <span>{venta.cliente_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Total:</span>
                <span>${venta.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Estado:</span>
                <span>{venta.estado}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-500 bg-white rounded shadow">
          No hay ventas registradas
        </div>
      )}
    </div>
  );
}

export default function TablaVentas({ 
  ventas, 
  selectedVentas, 
  onSelectVenta, 
  onSelectAll, 
  onRowDoubleClick,
  loading = false 
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando ventas...</span>
      </div>
    );
  }

  return (
    <>
      <TablaEscritorio
        ventas={ventas}
        selectedVentas={selectedVentas}
        onSelectVenta={onSelectVenta}
        onSelectAll={onSelectAll}
        onRowDoubleClick={onRowDoubleClick}
      />
      
      <TarjetasMoviles
        ventas={ventas}
        selectedVentas={selectedVentas}
        onSelectVenta={onSelectVenta}
        onRowDoubleClick={onRowDoubleClick}
      />
    </>
  );
}