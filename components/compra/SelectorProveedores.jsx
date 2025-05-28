import { MdSearch, MdDeleteForever } from "react-icons/md";
import { useCompra } from '../../context/ComprasContext';
import { useProveedorSearch } from '../../hooks/compra/useBusquedaProveedores';

function ModalProveedores({ resultados, onSeleccionar, onCerrar, loading }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-4 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Seleccionar Proveedor</h3>
        <ul className="max-h-60 overflow-y-auto">
          {loading ? (
            <li className="text-gray-500 text-center">Buscando...</li>
          ) : resultados.length > 0 ? (
            resultados.map((proveedor, idx) => (
              <li
                key={idx}
                className="p-2 border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => onSeleccionar(proveedor)}
              >
                {proveedor.nombre}
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

function DetallesProveedor({ proveedor }) {
  if (!proveedor) return null;

  return (
    <div className="bg-green-800 p-4 rounded mt-4 text-sm space-y-1">
      <p><strong>Nombre:</strong> {proveedor.nombre || '-'}</p>
      <p><strong>CUIT:</strong> {proveedor.cuit || '-'}</p>
      <p><strong>Dirección:</strong> {proveedor.direccion || '-'}</p>
      <p><strong>Teléfono:</strong> {proveedor.telefono || '-'}</p>
      <p><strong>Email:</strong> {proveedor.email || '-'}</p>
    </div>
  );
}

export default function SelectorProveedores() {
  const { proveedor, setProveedor, clearProveedor } = useCompra();
  const {
    busqueda,
    setBusqueda,
    resultados,
    loading,
    mostrarModal,
    setMostrarModal,
    buscarProveedor,
    limpiarBusqueda
  } = useProveedorSearch();

  const handleSeleccionarProveedor = (proveedorSeleccionado) => {
    setProveedor(proveedorSeleccionado);
    setMostrarModal(false);
    limpiarBusqueda();
  };

  const handleLimpiarProveedor = () => {
    clearProveedor();
    limpiarBusqueda();
  };

  return (
    <div className="bg-green-900 text-white p-6 rounded-lg flex-1 min-w-[300px]">
      <h2 className="text-2xl font-semibold mb-4 text-center">Proveedor</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre del proveedor"
            value={proveedor ? proveedor.nombre : busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={!!proveedor}
            className="w-full p-2 rounded text-black"
          />
          <button
            onClick={buscarProveedor}
            disabled={!!proveedor || loading}
            className="p-2 rounded bg-white text-green-900 hover:bg-green-100 transition disabled:opacity-50"
            title="Buscar proveedor"
          >
            <MdSearch size={24} />
          </button>
          {proveedor && (
            <button
              onClick={handleLimpiarProveedor}
              className="p-2 rounded bg-white text-red-600 hover:bg-red-100 transition"
              title="Eliminar proveedor"
            >
              <MdDeleteForever size={24} />
            </button>
          )}
        </div>
      </div>

      <DetallesProveedor proveedor={proveedor} />

      {mostrarModal && (
        <ModalProveedores
          resultados={resultados}
          onSeleccionar={handleSeleccionarProveedor}
          onCerrar={() => setMostrarModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}