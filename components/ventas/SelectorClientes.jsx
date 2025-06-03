import { MdSearch, MdDeleteForever, MdExpandMore, MdExpandLess } from "react-icons/md";
import { useVenta } from '../../context/VentasContext';
import { useClienteSearch } from '../../hooks/useBusquedaClientes';
import { useState } from 'react';

function ModalClientes({ resultados, onSeleccionar, onCerrar, loading }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-black">Seleccionar Cliente</h3>
        <ul className="max-h-60 overflow-y-auto">
          {loading ? (
            <li className="text-gray-500 text-center">Buscando...</li>
          ) : resultados.length > 0 ? (
            resultados.map((cliente, idx) => (
              <li
                key={idx}
                className="p-2 border-b hover:bg-gray-100 cursor-pointer text-black"
                onClick={() => onSeleccionar(cliente)}
              >
                {cliente.nombre}
              </li>
            ))
          ) : (
            <li className="text-gray-500">No se encontraron resultados.</li>
          )}
        </ul>
        <button
          onClick={onCerrar}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function DetallesCliente({ cliente, expandido, onToggleExpansion }) {
  if (!cliente) return null;

  return (
    <div className="bg-blue-800 rounded mt-2 overflow-hidden transition-all duration-300">
      {/* Información básica (siempre visible) */}
      <div 
        className="p-4 cursor-pointer hover:bg-blue-700 transition-colors flex items-center justify-between"
        onClick={onToggleExpansion}
      >
        <div className="text-sm">
          <p className="font-semibold">{cliente.nombre || 'Cliente sin nombre'}</p>
          <p className="text-blue-200 text-xs">
            {cliente.ciudad || 'Ciudad no especificada'} 
            {cliente.provincia && `, ${cliente.provincia}`}
          </p>
        </div>
        <div className="text-white">
          {expandido ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
        </div>
      </div>

      {/* Información detallada (expandible) */}
      <div className={`transition-all duration-300 ease-in-out ${
        expandido ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-4 pb-4 pt-2 border-t border-blue-700 text-sm space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="font-medium text-blue-200">Dirección:</span>
              <p className="text-white">{cliente.direccion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-200">Teléfono:</span>
              <p className="text-white">{cliente.telefono || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-200">Email:</span>
              <p className="text-white break-all">{cliente.email || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClienteSelector() {
  const { cliente, setCliente, clearCliente } = useVenta();
  const {
    busqueda,
    setBusqueda,
    resultados,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarCliente,
    limpiarBusqueda
  } = useClienteSearch();

  // Estado para controlar si los detalles del cliente están expandidos
  const [detallesExpandidos, setDetallesExpandidos] = useState(false);

  const handleSeleccionarCliente = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    setMostrarModal(false);
    limpiarBusqueda();
    // Iniciar con detalles minimizados cuando se selecciona un cliente
    setDetallesExpandidos(false);
  };

  const handleLimpiarCliente = () => {
    clearCliente();
    limpiarBusqueda();
    setDetallesExpandidos(false);
  };

  const toggleDetallesExpansion = () => {
    setDetallesExpandidos(!detallesExpandidos);
  };

  return (
    <div className="bg-blue-900 text-white p-6 rounded-lg flex-1 min-w-[300px]">
      <h2 className="text-2xl font-semibold mb-4 text-center">Cliente</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={cliente ? cliente.nombre : busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={!!cliente}
            className="w-full p-2 rounded text-black placeholder-gray-500"
          />
          <button
            onClick={buscarCliente}
            disabled={!!cliente || loading}
            className="p-2 rounded bg-white text-blue-900 hover:bg-sky-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Buscar cliente"
          >
            <MdSearch size={24} />
          </button>
          {cliente && (
            <button
              onClick={handleLimpiarCliente}
              className="p-2 rounded bg-white text-red-600 hover:bg-red-300 transition"
              title="Eliminar cliente"
            >
              <MdDeleteForever size={24} />
            </button>
          )}
        </div>
      </div>

      <DetallesCliente 
        cliente={cliente} 
        expandido={detallesExpandidos}
        onToggleExpansion={toggleDetallesExpansion}
      />

      {mostrarModal && (
        <ModalClientes
          resultados={resultados}
          onSeleccionar={handleSeleccionarCliente}
          onCerrar={() => setMostrarModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}