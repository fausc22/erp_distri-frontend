// pages/pedidos/HistorialPedidos.jsx - VERSIÓN SIMPLIFICADA
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks personalizados
import { useHistorialPedidos } from '../../hooks/pedidos/useHistorialPedidos';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useEditarPedido } from '../../hooks/pedidos/useEditarPedido';
import { useGenerarPDFPedido } from 'hooks/pedidos/useGenerarPdfPedido';
import { useAnularPedido } from '../../hooks/pedidos/useAnularPedido';

// Componentes
import TablaPedidos from '../../components/pedidos/TablaPedidos';
import FiltrosHistorialPedidos from '../../components/pedidos/FiltrosHistorialPedidos';
import { Paginacion } from '../../components/Paginacion';
import { 
  ModalDetallePedido, 
  ModalEditarProductoPedido, 
  ModalEliminarProductoPedido, 
  ModalAgregarProductoPedido 
} from '../../components/pedidos/ModalesHistorialPedidos';
import { 
  ModalConfirmacionSalidaPedidos,
  ModalConfirmacionAnularPedidoIndividual
} from '../../components/pedidos/ModalesConfirmacion';
import { BotonAccionesPedidos } from '../../components/pedidos/BotonAccionesPedidos';
import { axiosAuth } from '../../utils/apiClient';

function HistorialPedidosContent() {
  // Estados para modales existentes
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [mostrarModalAgregarProducto, setMostrarModalAgregarProducto] = useState(false);
  const [mostrarModalEditarProducto, setMostrarModalEditarProducto] = useState(false);
  const [mostrarModalEliminarProducto, setMostrarModalEliminarProducto] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);
  const [mostrarModalFacturacion, setMostrarModalFacturacion] = useState(false);

  // Estados para anulación individual
  const [mostrarModalAnularPedido, setMostrarModalAnularPedido] = useState(false);
  const [pedidoParaAnular, setPedidoParaAnular] = useState(null);

  // Estados para productos en edición
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoEliminando, setProductoEliminando] = useState(null);

  // Hook de autenticación
  const { user, loading: authLoading } = useAuth();

  // Hook para anular pedidos
  const { loading: loadingAnular, anularPedido } = useAnularPedido();

  // Hook para generar PDFs
  const {
    generandoPDF,
    generandoPDFMultiple,
    generarPDFPedido,
    generarPDFsPedidosMultiples
  } = useGenerarPDFPedido();

  // Determinar si debe filtrar por empleado
  const filtroEmpleado = user && user.rol !== 'GERENTE' ? user.id : null;

  // Hook para historial de pedidos
  const { 
    pedidos,
    pedidosOriginales,
    selectedPedidos, 
    loading, 
    filtros,
    handleSelectPedido, 
    handleSelectAllPedidos, 
    clearSelection,
    cambiarEstadoMultiple,
    eliminarMultiple,
    cargarPedidos,
    actualizarFiltros,
    limpiarFiltros,
    getEstadisticas
  } = useHistorialPedidos(filtroEmpleado);

  // Effect para cargar pedidos
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 Usuario cargado, forzando recarga de pedidos:', {
        usuario: user.nombre,
        rol: user.rol,
        filtroCalculado: user.rol !== 'GERENTE' ? user.id : null
      });
      
      setTimeout(() => {
        cargarPedidos();
      }, 100);
    }
  }, [user, authLoading]);
  
  // Hook de paginación
  const {
    datosActuales: pedidosActuales,
    paginaActual,
    registrosPorPagina,
    totalPaginas,
    indexOfPrimero,
    indexOfUltimo,
    cambiarPagina,
    cambiarRegistrosPorPagina
  } = usePaginacion(pedidos, 10);

  const {
    selectedPedido,
    productos,
    loading: loadingProductos,
    cargarProductosPedido,
    agregarProducto,
    eliminarProducto,
    actualizarProducto,
    actualizarObservaciones, 
    verificarStock, 
    cerrarEdicion
  } = useEditarPedido();

  // FUNCIONES para anular pedidos
  const handleMostrarConfirmacionAnular = (pedido, productosDelPedido) => {
    setPedidoParaAnular({
      ...pedido,
      productos: productosDelPedido || productos
    });
    setMostrarModalAnularPedido(true);
  };

  const handleAnularPedidoIndividual = async () => {
    if (!pedidoParaAnular) {
      toast.error('No hay pedido para anular');
      return;
    }

    const resultado = await anularPedido(pedidoParaAnular.id);
    
    if (resultado.success) {
      setMostrarModalAnularPedido(false);
      setMostrarModalDetalle(false);
      setPedidoParaAnular(null);
      cerrarEdicion();
      // ✅ RECARGAR PEDIDOS (necesario para cambios de estado)
      await cargarPedidos();
    }
  };

  // FUNCIÓN para cambiar estado de pedido
  const handleCambiarEstadoPedido = async (nuevoEstado) => {
    if (!selectedPedido) {
      toast.error("No hay pedido seleccionado");
      return;
    }

    if (nuevoEstado === 'Anulado') {
      handleMostrarConfirmacionAnular(selectedPedido, productos);
      return;
    }

    try {
      const response = await axiosAuth.put(`/pedidos/actualizar-estado/${selectedPedido.id}`, {
        estado: nuevoEstado
      });

      if (response.data.success) {
        toast.success(`Pedido #${selectedPedido.id} marcado como ${nuevoEstado}`);
        setMostrarModalDetalle(false);
        cerrarEdicion();
        // ✅ RECARGAR PEDIDOS (necesario para cambios de estado)
        await cargarPedidos();
      } else {
        toast.error(response.data.message || 'Error al cambiar estado del pedido');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado del pedido');
    }
  };

  // Handlers para eventos de la tabla
  const handleRowDoubleClick = async (pedido) => {
    try {
      await cargarProductosPedido(pedido);
      setMostrarModalDetalle(true);
    } catch (error) {
      toast.error('Error al cargar detalles del pedido');
    }
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

  const handleEditarProducto = async (producto) => {
    try {
      console.log('🔍 Consultando stock para producto:', producto.producto_id);
      const stockActual = await verificarStock(producto.producto_id);
      console.log('📦 Stock obtenido:', stockActual);
      
      const productoConStock = {
        ...producto,
        stock_actual: stockActual
      };
      
      setProductoEditando(productoConStock);
      setMostrarModalDetalle(false);
      setTimeout(() => setMostrarModalEditarProducto(true), 300);
    } catch (error) {
      console.error('❌ Error al obtener stock:', error);
      toast.error('Error al consultar stock del producto');
      setProductoEditando({ ...producto, stock_actual: 0 });
      setMostrarModalDetalle(false);
      setTimeout(() => setMostrarModalEditarProducto(true), 300);
    }
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

  // ✅ HANDLERS SIMPLIFICADOS - El backend maneja los totales automáticamente
  const handleConfirmarAgregarProducto = async (producto, cantidad) => {
    try {
      console.log('🔄 Agregando producto...');
      
      const exito = await agregarProducto(producto, cantidad);
      if (exito) {
        console.log('✅ Producto agregado exitosamente');
        handleCloseModalAgregarProducto();
        
        // ✅ SIMPLE: Solo recargar pedidos para actualizar la tabla
        console.log('🔄 Recargando lista de pedidos...');
        await cargarPedidos();
        console.log('✅ Lista de pedidos actualizada');
        
        toast.success('Producto agregado correctamente');
      }
      return exito;
    } catch (error) {
      console.error('❌ Error en handleConfirmarAgregarProducto:', error);
      toast.error('Error al agregar producto');
      return false;
    }
  };

  const handleConfirmarEditarProducto = async () => {
    if (!productoEditando) return;
    
    try {
      console.log('🔄 Editando producto...');
      
      const exito = await actualizarProducto(productoEditando);
      if (exito) {
        console.log('✅ Producto editado exitosamente');
        handleCloseModalEditarProducto();
        
        // ✅ SIMPLE: Solo recargar pedidos para actualizar la tabla
        console.log('🔄 Recargando lista de pedidos...');
        await cargarPedidos();
        console.log('✅ Lista de pedidos actualizada');
        
        toast.success('Producto editado correctamente');
      }
    } catch (error) {
      console.error('❌ Error en handleConfirmarEditarProducto:', error);
      toast.error('Error al editar producto');
    }
  };

  const handleConfirmarEliminarProducto = async () => {
    if (!productoEliminando) return;
    
    try {
      console.log('🔄 Eliminando producto...');
      
      const exito = await eliminarProducto(productoEliminando);
      if (exito) {
        console.log('✅ Producto eliminado exitosamente');
        handleCloseModalEliminarProducto();
        
        // ✅ SIMPLE: Solo recargar pedidos para actualizar la tabla
        console.log('🔄 Recargando lista de pedidos...');
        await cargarPedidos();
        console.log('✅ Lista de pedidos actualizada');
        
        toast.success('Producto eliminado correctamente');
      }
    } catch (error) {
      console.error('❌ Error en handleConfirmarEliminarProducto:', error);
      toast.error('Error al eliminar producto');
    }
  };

  // Función para generar PDF individual
  const handleGenerarPDF = async () => {
    if (!selectedPedido || productos.length === 0) {
      toast.error("Seleccione un pedido con productos");
      return;
    }
     
    await generarPDFPedido(selectedPedido, productos);
  };

  const handleActualizarObservaciones = async (nuevasObservaciones) => {
    if (!selectedPedido) {
      toast.error('No hay pedido seleccionado');
      return false;
    }

    try {
      console.log('📝 Actualizando observaciones para pedido:', selectedPedido.id);
      const exito = await actualizarObservaciones(nuevasObservaciones);
      
      if (exito) {
        // ✅ RECARGAR PEDIDOS (las observaciones se muestran en la tabla)
        await cargarPedidos();
        toast.success('Observaciones actualizadas correctamente');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error al actualizar observaciones:', error);
      toast.error('Error al actualizar observaciones');
      return false;
    }
  };

  // Función para generar PDFs múltiples
  const handleImprimirMultiple = async () => {
    if (selectedPedidos.length === 0) {
      toast.error('Seleccione al menos un pedido para imprimir');
      return;
    }

    console.log('🖨️ Iniciando impresión múltiple de pedidos:', selectedPedidos);
    
    const exito = await generarPDFsPedidosMultiples(selectedPedidos);
    
    if (exito) {
      clearSelection();
      toast.success('PDFs generados correctamente');
    }
  };

  // Handlers para navegación
  const handleConfirmarSalida = () => {
    setMostrarConfirmacionSalida(true);
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  // FUNCIONES para manejar filtros
  const handleFiltrosChange = (nuevosFiltros) => {
    actualizarFiltros(nuevosFiltros);
    cambiarPagina(1);
  };

  const handleLimpiarFiltros = () => {
    limpiarFiltros();
    cambiarPagina(1);
  };

  // Obtener estadísticas para mostrar en filtros
  const estadisticas = getEstadisticas();

  // Mostrar loading mientras se autentica
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Función para obtener el título dinámico
  const getTitulo = () => {
    if (user?.rol === 'GERENTE') {
      return 'HISTORIAL DE PEDIDOS - TODOS LOS PEDIDOS';
    }
    return `HISTORIAL DE PEDIDOS - ${user?.nombre?.toUpperCase() || 'MIS PEDIDOS'}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | HISTORIAL DE PEDIDOS</title>
        <meta name="description" content="Historial de pedidos en el sistema VERTIMAR" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {getTitulo()}
        </h1>
        
        <FiltrosHistorialPedidos
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          onLimpiarFiltros={handleLimpiarFiltros}
          user={user}
          totalPedidos={estadisticas.total}
          pedidosFiltrados={estadisticas.filtrado}
          pedidosOriginales={pedidosOriginales}
        />
        
        <TablaPedidos
          pedidos={pedidosActuales}
          selectedPedidos={selectedPedidos}
          onSelectPedido={handleSelectPedido}
          onSelectAll={() => handleSelectAllPedidos(pedidosActuales)}
          onRowDoubleClick={handleRowDoubleClick}
          loading={loading}
          mostrarPermisos={true}
          isPedidoFacturado={selectedPedido?.estado === 'Facturado'}
        />
        
        <Paginacion
          datosOriginales={pedidos}
          paginaActual={paginaActual}
          registrosPorPagina={registrosPorPagina}
          totalPaginas={totalPaginas}
          indexOfPrimero={indexOfPrimero}
          indexOfUltimo={indexOfUltimo}
          onCambiarPagina={cambiarPagina}
          onCambiarRegistrosPorPagina={cambiarRegistrosPorPagina}
        />
        
        <BotonAccionesPedidos
          contexto="historial"
          selectedPedidos={selectedPedidos}
          onImprimirMultiple={handleImprimirMultiple}
          onVolverMenu={handleConfirmarSalida}
          loading={generandoPDFMultiple || loading}
          mostrarEstadisticas={false}
        />
      </div>
      
      {/* MODALES */}
      <ModalDetallePedido
        pedido={selectedPedido}
        productos={productos}
        loading={loadingProductos}
        onClose={handleCloseModalDetalle}
        onAgregarProducto={handleAgregarProducto}
        onEditarProducto={handleEditarProducto}
        onEliminarProducto={handleEliminarProducto}
        onCambiarEstado={handleCambiarEstadoPedido}
        onGenerarPDF={handleGenerarPDF}
        generandoPDF={generandoPDF}
        mostrarModalFacturacion={mostrarModalFacturacion}
        setMostrarModalFacturacion={setMostrarModalFacturacion}
        onActualizarObservaciones={handleActualizarObservaciones} 
        isPedidoFacturado={selectedPedido?.estado === 'Facturado'}
        isPedidoAnulado={selectedPedido?.estado === 'Anulado'}
      />

      <ModalAgregarProductoPedido
        mostrar={mostrarModalAgregarProducto}
        onClose={handleCloseModalAgregarProducto}
        onAgregarProducto={handleConfirmarAgregarProducto}
      />

      <ModalEditarProductoPedido
        producto={productoEditando}
        onClose={handleCloseModalEditarProducto}
        onGuardar={handleConfirmarEditarProducto}
        onChange={setProductoEditando}
      />

      <ModalEliminarProductoPedido
        producto={productoEliminando}
        onClose={handleCloseModalEliminarProducto}
        onConfirmar={handleConfirmarEliminarProducto}
      />

      <ModalConfirmacionSalidaPedidos
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />

      <ModalConfirmacionAnularPedidoIndividual
        mostrar={mostrarModalAnularPedido}
        pedido={pedidoParaAnular}
        productos={productos}
        onConfirmar={handleAnularPedidoIndividual}
        onCancelar={() => {
          setMostrarModalAnularPedido(false);
          setPedidoParaAnular(null);
        }}
        loading={loadingAnular}
      />
    </div>
  );
}

export default function HistorialPedidos() {
  return <HistorialPedidosContent />;
}