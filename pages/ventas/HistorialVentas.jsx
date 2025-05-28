// pages/HistorialVentas.jsx - Versión Refactorizada
import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useHistorialVentas } from '../../hooks/useHistorialVentas';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useEditarVenta } from '../../hooks/useEditarVenta';
import { useComprobantes } from '../../hooks/useComprobantes';
import { useGenerarPDFsVentas } from '../../hooks/useGenerarPDFsVentas';

// Componentes
import TablaVentas from '../../components/TablaVentas';
import { Paginacion } from '../../components/Paginacion';
import { ModalDetalleVenta, ModalEditarProducto, ModalEliminarProducto, ModalAgregarProductoVenta } from '../../components/ModalesHistorialVentas';
import { ModalComprobantesVenta } from '../../components/ModalComprobantesVenta';
import { ModalConfirmacionSalida } from '../../components/ModalesConfirmacion';
import { BotonAcciones } from '../../components/BotonAcciones';

function HistorialVentasContent() {
  // Estados para modales
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalAgregarProducto, setMostrarModalAgregarProducto] = useState(false);
  const [mostrarModalEditarProducto, setMostrarModalEditarProducto] = useState(false);
  const [mostrarModalEliminarProducto, setMostrarModalEliminarProducto] = useState(false);
  const [mostrarModalComprobante, setMostrarModalComprobante] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  // Estados para productos en edición
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoEliminando, setProductoEliminando] = useState(null);

  useAuth();

  // Hooks personalizados
  const { ventas, selectedVentas, loading, handleSelectVenta, handleSelectAllVentas, clearSelection } = useHistorialVentas();
  
  const {
    datosActuales: ventasActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(ventas, 10);

  const {
    selectedVenta,
    productos,
    loading: loadingProductos,
    cargarProductosVenta,
    agregarProducto,
    eliminarProducto,
    actualizarProducto,
    cerrarEdicion
  } = useEditarVenta();

  const {
    comprobante,
    comprobantePreview,
    comprobanteExistente,
    uploadingComprobante,
    verificarComprobanteExistente,
    handleFileChange,
    uploadComprobante,
    viewComprobante,
    limpiarComprobante
  } = useComprobantes();

  const {
    generandoPDF,
    imprimiendoMultiple,
    generarPDFIndividual,
    generarPDFsMultiples
  } = useGenerarPDFsVentas();

  // Handlers para eventos de la tabla
  const handleRowDoubleClick = async (venta) => {
    await cargarProductosVenta(venta);
    setMostrarModalDetalle(true);
  };

  const handleCloseModalDetalle = () => {
    setMostrarModalDetalle(false);
    cerrarEdicion();
  };

  // Handlers para productos
  const handleAgregarProducto = () => {
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalAgregarProducto(true), 300);
  };

  const handleEditarProducto = (producto) => {
    setProductoEditando({ ...producto });
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalEditarProducto(true), 300);
  };

  const handleEliminarProducto = (producto) => {
    setProductoEliminando(producto);
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalEliminarProducto(true), 300);
  };

  // Handlers para modales de productos
  const handleCloseModalAgregarProducto = () => {
    setMostrarModalAgregarProducto(false);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleCloseModalEditarProducto = () => {
    setMostrarModalEditarProducto(false);
    setProductoEditando(null);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleCloseModalEliminarProducto = () => {
    setMostrarModalEliminarProducto(false);
    setProductoEliminando(null);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  // Handlers para acciones de productos
  const handleConfirmarAgregarProducto = async (producto, cantidad) => {
    const exito = await agregarProducto(producto, cantidad);
    if (exito) {
      handleCloseModalAgregarProducto();
    }
    return exito;
  };

  const handleConfirmarEditarProducto = async () => {
    if (!productoEditando) return;
    
    const exito = await actualizarProducto(productoEditando);
    if (exito) {
      handleCloseModalEditarProducto();
    }
  };

  const handleConfirmarEliminarProducto = async () => {
    if (!productoEliminando) return;
    
    const exito = await eliminarProducto(productoEliminando);
    if (exito) {
      handleCloseModalEliminarProducto();
    }
  };

  // Handlers para comprobantes
  const handleCargarComprobante = async () => {
    if (!selectedVenta) {
      toast.error("Seleccione una venta primero");
      return;
    }
    
    limpiarComprobante();
    await verificarComprobanteExistente(selectedVenta.id);
    setMostrarModalDetalle(false);
    setTimeout(() => setMostrarModalComprobante(true), 300);
  };

  const handleCloseModalComprobante = () => {
    setMostrarModalComprobante(false);
    setTimeout(() => setMostrarModalDetalle(true), 300);
  };

  const handleUploadComprobante = async () => {
    if (!selectedVenta) return;
    
    const exito = await uploadComprobante(selectedVenta.id);
    if (exito) {
      setTimeout(() => {
        setMostrarModalComprobante(false);
        setTimeout(() => setMostrarModalDetalle(true), 300);
      }, 1500);
    }
  };

  const handleViewComprobante = () => {
    if (!selectedVenta) return;
    viewComprobante(selectedVenta.id);
  };

  // Handlers para PDFs
  const handleGenerarPDF = async () => {
    if (!selectedVenta || productos.length === 0) {
      toast.error("Seleccione una venta con productos");
      return;
    }

    await generarPDFIndividual(selectedVenta, productos);
  };

  const handleImprimirMultiple = async () => {
    await generarPDFsMultiples(selectedVentas);
  };

  // Handlers para navegación
  const handleConfirmarSalida = () => {
    if (selectedVenta) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  // Handler para solicitar CAE
  const handleSolicitarCAE = () => {
    toast.info('Funcionalidad de CAE pendiente de implementación');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE VENTAS</title>
        <meta name="description" content="Historial de ventas en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">HISTORIAL DE VENTAS</h1>
        
        <TablaVentas
          ventas={ventasActuales}
          selectedVentas={selectedVentas}
          onSelectVenta={handleSelectVenta}
          onSelectAll={handleSelectAllVentas}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
        />
        
        <Paginacion
          datosOriginales={ventas}
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
        
        <BotonAcciones
          selectedVentas={selectedVentas}
          onImprimirMultiple={handleImprimirMultiple}
          imprimiendo={imprimiendoMultiple}
          onVolverMenu={handleConfirmarSalida}
        />
      </div>
      
      {/* Modal de detalles de venta */}
      <ModalDetalleVenta
        venta={selectedVenta}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onAgregarProducto={handleAgregarProducto}
        onEditarProducto={handleEditarProducto}
        onEliminarProducto={handleEliminarProducto}
        onGenerarPDF={handleGenerarPDF}
        onCargarComprobante={handleCargarComprobante}
        onSolicitarCAE={handleSolicitarCAE}
        generandoPDF={generandoPDF}
      />

      {/* Modal agregar producto */}
      <ModalAgregarProductoVenta
        mostrar={mostrarModalAgregarProducto}
        onClose={handleCloseModalAgregarProducto}
        onAgregarProducto={handleConfirmarAgregarProducto}
      />

      {/* Modal editar producto */}
      <ModalEditarProducto
        producto={productoEditando}
        onClose={handleCloseModalEditarProducto}
        onGuardar={handleConfirmarEditarProducto}
        onChange={setProductoEditando}
      />

      {/* Modal eliminar producto */}
      <ModalEliminarProducto
        producto={productoEliminando}
        onClose={handleCloseModalEliminarProducto}
        onConfirmar={handleConfirmarEliminarProducto}
      />

      {/* Modal comprobantes */}
      <ModalComprobantesVenta
        mostrar={mostrarModalComprobante}
        venta={selectedVenta}
        comprobante={comprobante}
        comprobantePreview={comprobantePreview}
        comprobanteExistente={comprobanteExistente}
        uploadingComprobante={uploadingComprobante}
        onClose={handleCloseModalComprobante}
        onFileChange={handleFileChange}
        onUpload={handleUploadComprobante}
        onView={handleViewComprobante}
      />

      {/* Modal confirmación salida */}
      <ModalConfirmacionSalida
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function HistorialVentas() {
  return <HistorialVentasContent />;
}