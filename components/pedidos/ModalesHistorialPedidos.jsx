// components/pedidos/ModalesHistorialPedidos.jsx - Versión corregida con descuentos funcionando
import { useState, useEffect } from 'react';
import { MdDeleteForever, MdExpandMore, MdExpandLess, MdSearch } from "react-icons/md";
import { toast } from 'react-hot-toast';
import { usePedidos } from '../../hooks/pedidos/usePedidos';
import { useProductoSearch } from 'hooks/useBusquedaProductos';
import useAuth from '../../hooks/useAuth';
import { useFacturacion } from '../../hooks/pedidos/useFacturacion';

// Modal de descuentos corregido
export function ModalDescuentos({
  mostrar, 
  onClose, 
  onAplicarDescuento, 
  subtotalSinIva = 0, 
  ivaTotal = 0, 
  totalConIva = 0 
}) {
  const [tipoDescuento, setTipoDescuento] = useState('numerico');
  const [valorDescuento, setValorDescuento] = useState('');
  const [descuentoCalculado, setDescuentoCalculado] = useState(0);

  useEffect(() => {
    if (!valorDescuento || valorDescuento === '') {
      setDescuentoCalculado(0);
      return;
    }

    const valor = parseFloat(valorDescuento) || 0;
    
    if (tipoDescuento === 'numerico') {
      // Descuento directo sobre el total con IVA
      setDescuentoCalculado(Math.min(valor, totalConIva || 0));
    } else {
      // Porcentaje sobre el IVA TOTAL
      const porcentaje = Math.min(Math.max(valor, 0), 100);
      setDescuentoCalculado(((ivaTotal || 0) * porcentaje) / 100);
    }
  }, [valorDescuento, tipoDescuento, ivaTotal, totalConIva]);

  const handleAplicar = () => {
    if (descuentoCalculado > 0) {
      onAplicarDescuento({
        tipo: tipoDescuento,
        valor: parseFloat(valorDescuento) || 0,
        descuentoCalculado: descuentoCalculado
      });
    }
    onClose();
  };

  const limpiarFormulario = () => {
    setTipoDescuento('numerico');
    setValorDescuento('');
    setDescuentoCalculado(0);
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  if (!mostrar) return null;

  const nuevoTotal = (totalConIva || 0) - descuentoCalculado;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[70] p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-xs sm:max-w-md w-full">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Aplicar Descuento</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de descuento:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDescuento"
                  value="numerico"
                  checked={tipoDescuento === 'numerico'}
                  onChange={(e) => setTipoDescuento(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">💰 Descuento numérico (en pesos)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDescuento"
                  value="porcentaje"
                  checked={tipoDescuento === 'porcentaje'}
                  onChange={(e) => setTipoDescuento(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">📊 Descuento porcentual (% sobre IVA)</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tipoDescuento === 'numerico' ? 'Monto a descontar ($):' : 'Porcentaje (1-100%):'}
            </label>
            <div className="flex items-center">
              {tipoDescuento === 'numerico' && <span className="mr-2 text-gray-600">$</span>}
              <input
                type="number"
                value={valorDescuento}
                onChange={(e) => setValorDescuento(e.target.value)}
                min="0"
                max={tipoDescuento === 'numerico' ? (totalConIva || 0) : 100}
                step={tipoDescuento === 'numerico' ? '0.01' : '1'}
                className="border p-2 rounded w-full text-sm"
                placeholder={tipoDescuento === 'numerico' ? '0.00' : '0'}
              />
              {tipoDescuento === 'porcentaje' && <span className="ml-2 text-gray-600">%</span>}
            </div>
            {tipoDescuento === 'porcentaje' && (
              <p className="text-xs text-gray-500 mt-1">
                Se aplicará sobre el IVA total: ${(ivaTotal || 0).toFixed(2)}
              </p>
            )}
          </div>

          {descuentoCalculado > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-sm mb-2">Vista previa del descuento:</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total original:</span>
                  <span>${(totalConIva || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Descuento:</span>
                  <span>-${descuentoCalculado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total final:</span>
                  <span className="text-green-600">${nuevoTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAplicar}
              disabled={!valorDescuento || valorDescuento === '' || parseFloat(valorDescuento) <= 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors text-sm w-full sm:w-auto"
            >
              ✅ Aplicar Descuento
            </button>
            <button
              onClick={handleClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors text-sm w-full sm:w-auto"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de facturación principal corregido
export function ModalFacturacionCompleto({ 
  mostrar, 
  onClose, 
  pedido, 
  productos,
  onConfirmarFacturacion 
}) {
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState('');
  const [tipoFiscal, setTipoFiscal] = useState('A');
  const [subtotalSinIva, setSubtotalSinIva] = useState(0);
  const [ivaTotal, setIvaTotal] = useState(0);
  const [totalConIva, setTotalConIva] = useState(0);
  const [mostrarModalDescuentos, setMostrarModalDescuentos] = useState(false);
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);

  const { 
    loading, 
    cuentas, 
    loadingCuentas, 
    cargarCuentasFondos, 
    facturarPedido 
  } = useFacturacion();

  // Inicializar montos al abrir el modal
  useEffect(() => {
    if (mostrar && productos && productos.length > 0) {
      const subtotal = productos.reduce((acc, prod) => acc + (Number(prod.subtotal) || 0), 0);
      const iva = productos.reduce((acc, prod) => acc + (Number(prod.iva) || 0), 0);
      const total = subtotal + iva;

      setSubtotalSinIva(subtotal);
      setIvaTotal(iva);
      setTotalConIva(total);
      setDescuentoAplicado(null);
    }
  }, [mostrar, productos]);

  useEffect(() => {
    if (mostrar) {
      cargarCuentasFondos();
    }
  }, [mostrar]);

  const actualizarMontos = (campo, valor) => {
    const numeroValor = parseFloat(valor) || 0;
    switch (campo) {
      case 'subtotal':
        setSubtotalSinIva(numeroValor);
        const nuevoIva = numeroValor * 0.21;
        setIvaTotal(nuevoIva);
        setTotalConIva(numeroValor + nuevoIva);
        break;
      case 'iva':
        setIvaTotal(numeroValor);
        setTotalConIva(subtotalSinIva + numeroValor);
        break;
      case 'total':
        setTotalConIva(numeroValor);
        const proporcionIva = ivaTotal / (subtotalSinIva + ivaTotal) || 0.21;
        const nuevoIvaCalculado = numeroValor * proporcionIva;
        const nuevoSubtotal = numeroValor - nuevoIvaCalculado;
        setSubtotalSinIva(nuevoSubtotal);
        setIvaTotal(nuevoIvaCalculado);
        break;
      default:
        break;
    }
    // Limpiar descuento cuando se editan montos manualmente
    setDescuentoAplicado(null);
  };

  const handleAplicarDescuento = (descuento) => {
    setDescuentoAplicado(descuento);
    // NO modificar totalConIva aquí, se calculará en el resumen
  };

  const limpiarDescuento = () => {
    setDescuentoAplicado(null);
  };

  const handleConfirmar = async () => {
    if (!cuentaSeleccionada) {
      toast.error('Debe seleccionar una cuenta de destino');
      return;
    }

    // Calcular total final con descuento
    const totalOriginal = subtotalSinIva + ivaTotal;
    const descuentoMonto = descuentoAplicado?.descuentoCalculado || 0;
    const totalFinal = totalOriginal - descuentoMonto;

    const datosFacturacion = {
      pedidoId: pedido.id,
      cuentaId: cuentaSeleccionada,
      tipoFiscal,
      subtotalSinIva,
      ivaTotal,
      totalConIva: totalFinal, // Total con descuento aplicado
      descuentoAplicado
    };

    console.log('🧾 Enviando datos de facturación:', datosFacturacion);
    const resultado = await facturarPedido(datosFacturacion);
    
    if (resultado.success) {
      if (onConfirmarFacturacion) {
        onConfirmarFacturacion(resultado.data);
      }
      limpiarFormulario();
      onClose();
    }
  };

  const limpiarFormulario = () => {
    setCuentaSeleccionada('');
    setTipoFiscal('A');
    setSubtotalSinIva(0);
    setIvaTotal(0);
    setTotalConIva(0);
    setDescuentoAplicado(null);
  };

  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  if (!mostrar) return null;

  // Calcular total final considerando descuento
  const totalOriginal = subtotalSinIva + ivaTotal;
  const descuentoMonto = descuentoAplicado?.descuentoCalculado || 0;
  const totalFinalConDescuento = totalOriginal - descuentoMonto;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60] p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                🧾 Facturar Pedido #{pedido?.id}
              </h2>
              <button 
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-xl p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Información del Pedido</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Cliente:</span> {pedido?.cliente_nombre}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {pedido?.fecha}
                </div>
                <div>
                  <span className="font-medium">Estado:</span> {pedido?.estado}
                </div>
                <div>
                  <span className="font-medium">Productos:</span> {productos?.length || 0}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuenta de destino *
                </label>
                {loadingCuentas ? (
                  <div className="border p-2 rounded bg-gray-100 text-center text-sm">
                    Cargando cuentas...
                  </div>
                ) : (
                  <select
                    value={cuentaSeleccionada}
                    onChange={(e) => setCuentaSeleccionada(e.target.value)}
                    className="border p-2 rounded w-full text-sm"
                    required
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {cuentas.map(cuenta => (
                      <option key={cuenta.id} value={cuenta.id}>
                        {cuenta.nombre} - Saldo: ${Number(cuenta.saldo).toFixed(2)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo fiscal *
                </label>
                <select
                  value={tipoFiscal}
                  onChange={(e) => setTipoFiscal(e.target.value)}
                  className="border p-2 rounded w-full text-sm"
                  required
                >
                  <option value="A">A - Responsable Inscripto</option>
                  <option value="B">B - Responsable No Inscripto</option>
                  <option value="C">C - Consumidor Final</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Montos de Facturación</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtotal (sin IVA)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">$</span>
                    <input
                      type="number"
                      value={subtotalSinIva.toFixed(2)}
                      onChange={(e) => actualizarMontos('subtotal', e.target.value)}
                      className="border p-2 rounded w-full text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IVA Total
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">$</span>
                    <input
                      type="number"
                      value={ivaTotal.toFixed(2)}
                      onChange={(e) => actualizarMontos('iva', e.target.value)}
                      className="border p-2 rounded w-full text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total (con IVA)
                  </label>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">$</span>
                    <input
                      type="number"
                      value={totalOriginal.toFixed(2)}
                      onChange={(e) => actualizarMontos('total', e.target.value)}
                      className="border p-2 rounded w-full text-sm font-semibold"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800">Descuentos</h3>
                <button
                  onClick={() => setMostrarModalDescuentos(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  🏷️ APLICAR DESCUENTO
                </button>
              </div>
              {descuentoAplicado ? (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Descuento aplicado:
                      </p>
                      <p className="text-sm text-yellow-700">
                        {descuentoAplicado.tipo === 'numerico' 
                          ? `Descuento fijo: $${descuentoAplicado.descuentoCalculado.toFixed(2)}`
                          : `${descuentoAplicado.valor}% sobre IVA: $${descuentoAplicado.descuentoCalculado.toFixed(2)}`
                        }
                      </p>
                    </div>
                    <button
                      onClick={limpiarDescuento}
                      className="text-red-600 hover:text-red-800 text-sm ml-2"
                      title="Quitar descuento"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No hay descuentos aplicados</p>
              )}
            </div>
            
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Resumen Final</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotalSinIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA:</span>
                  <span>${ivaTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total original:</span>
                  <span>${totalOriginal.toFixed(2)}</span>
                </div>
                {descuentoAplicado && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>-${descuentoMonto.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-1">
                  <span>Total Final:</span>
                  <span className="text-green-600">${totalFinalConDescuento.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConfirmar}
                disabled={!cuentaSeleccionada || loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-1/2"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </div>
                ) : (
                  '✅ CONFIRMAR FACTURACIÓN'
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-1/2"
              >
                ❌ CANCELAR
              </button>
            </div>
          </div>
        </div>
      </div>
       
      {mostrarModalDescuentos && (
        <ModalDescuentos 
          mostrar={mostrarModalDescuentos} 
          onClose={() => setMostrarModalDescuentos(false)} 
          onAplicarDescuento={handleAplicarDescuento}
          subtotalSinIva={subtotalSinIva}
          ivaTotal={ivaTotal}
          totalConIva={totalOriginal}
        />
      )}
    </>
  );
}

// InformacionCliente component (sin cambios importantes)
export function InformacionCliente({ pedido, expandido, onToggleExpansion, mostrarModalFacturacion, setMostrarModalFacturacion, productos, handleConfirmarFacturacion }) {
  return (
    <div className="bg-blue-50 rounded-lg overflow-hidden mb-4">
      <div 
        className="p-3 cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
        onClick={onToggleExpansion}
      >
        <div>
          <h3 className="font-bold text-lg text-blue-800">Cliente: {pedido.cliente_nombre}</h3>
          <p className="text-blue-600 text-sm">
            {pedido.cliente_ciudad || 'Ciudad no especificada'}
            {pedido.cliente_provincia && `, ${pedido.cliente_provincia}`}
          </p>
        </div>
        <div className="text-blue-600">
          {expandido ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
        </div>
      </div>
      <div className={`transition-all duration-300 ease-in-out ${
        expandido ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      } overflow-hidden`}>
        <div className="px-3 pb-3 border-t border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-3">
            <div>
              <span className="font-medium text-blue-700">Dirección:</span>
              <p className="text-gray-700">{pedido.cliente_direccion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Condición IVA:</span>
              <p className="text-gray-700">{pedido.cliente_condicion || 'No especificada'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">CUIT:</span>
              <p className="text-gray-700">{pedido.cliente_cuit || 'No especificado'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Teléfono:</span>
              <p className="text-gray-700">{pedido.cliente_telefono || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>
      <ModalFacturacionCompleto
        mostrar={mostrarModalFacturacion}
        onClose={() => setMostrarModalFacturacion(false)}
        pedido={pedido}
        productos={productos}
        onConfirmarFacturacion={handleConfirmarFacturacion}
      />
    </div>
  );
}

export function InformacionAdicional({ 
  pedido, 
  onActualizarObservaciones, 
  canEdit = true 
}) {
  const [editandoObservaciones, setEditandoObservaciones] = useState(false);
  const [observacionesTemp, setObservacionesTemp] = useState('');
  const [guardandoObservaciones, setGuardandoObservaciones] = useState(false);

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'Exportado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Facturado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Anulado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const iniciarEdicionObservaciones = () => {
    setObservacionesTemp(pedido.observaciones || '');
    setEditandoObservaciones(true);
  };

  const cancelarEdicionObservaciones = () => {
    setObservacionesTemp('');
    setEditandoObservaciones(false);
  };

  const guardarObservaciones = async () => {
    setGuardandoObservaciones(true);
    
    try {
      const exito = await onActualizarObservaciones(observacionesTemp);
      if (exito) {
        setEditandoObservaciones(false);
        setObservacionesTemp('');
        toast.success('Observaciones actualizadas correctamente');
      }
    } catch (error) {
      toast.error('Error al actualizar observaciones');
    } finally {
      setGuardandoObservaciones(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter para guardar rápido
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      guardarObservaciones();
    }
    // Escape para cancelar
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelarEdicionObservaciones();
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estado */}
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Estado</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getEstadoStyle(pedido.estado)}`}>
            {pedido.estado || 'Sin estado'}
          </span>
        </div>

        {/* Observaciones - Responsivo y Editable SIN HOVER MOLESTO */}
        <div className="md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xl text-gray-800">Observaciones</h3>
            {canEdit && !editandoObservaciones && (
              <button
                onClick={iniciarEdicionObservaciones}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                title="Editar observaciones"
              >
                ✏️ <span className="hidden sm:inline">Editar</span>
              </button>
            )}
          </div>

          {editandoObservaciones ? (
            <div className="space-y-2">
              <textarea
                value={observacionesTemp}
                onChange={(e) => setObservacionesTemp(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escriba las observaciones del pedido..."
                className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                maxLength="500"
                disabled={guardandoObservaciones}
              />
              
              {/* Contador de caracteres */}
              <div className="text-xs text-gray-500 text-right">
                {observacionesTemp.length}/500 caracteres
              </div>
              
              {/* Botones de acción - Responsivos */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={guardarObservaciones}
                  disabled={guardandoObservaciones}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-sm transition-colors flex items-center justify-center gap-1"
                >
                  {guardandoObservaciones ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Guardando...</span>
                    </>
                  ) : (
                    <>
                      ✅ <span className="hidden sm:inline">Guardar</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={cancelarEdicionObservaciones}
                  disabled={guardandoObservaciones}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors flex items-center justify-center gap-1"
                >
                  ❌ <span className="hidden sm:inline">Cancelar</span>
                </button>
              </div>
              
              {/* Ayuda de teclado */}
              <div className="text-xs text-gray-500 hidden sm:block">
                💡 Ctrl+Enter para guardar, Escape para cancelar
              </div>
            </div>
          ) : (
            // ✅ VERSIÓN SIN HOVER MOLESTO - Solo el contenido simple
            <div>
              <p className="text-lg text-gray-700 bg-white p-3 rounded border min-h-[2.5rem] break-words">
                {pedido.observaciones && pedido.observaciones !== 'sin observaciones' 
                  ? pedido.observaciones 
                  : (
                    <span className="text-gray-400 italic">
                      Sin observaciones especiales
                    </span>
                  )
                }
              </p>
            </div>
          )}
        </div>

        {/* Empleado */}
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">Usuario</h3>
          <p className="text-lg font-semibold text-blue-600">
            {pedido.empleado_nombre || 'No especificado'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ModalAgregarProductoPedido({ 
  mostrar, 
  onClose, 
  onAgregarProducto,
  productosActuales = [] // Nueva prop para validaciones
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

  // Validar si el producto ya existe en el pedido
  const productoYaExiste = (productoId) => {
    return productosActuales.some(prod => prod.producto_id === productoId);
  };

  // Verificar stock disponible
  const stockDisponible = productoSeleccionado?.stock_actual || 0;
  const stockSuficiente = productQuantity <= stockDisponible;
  const productoEsDuplicado = productoSeleccionado ? productoYaExiste(productoSeleccionado.id) : false;

  const handleAgregarProducto = async () => {
    if (!productoSeleccionado || productQuantity < 1) {
      toast.error('Seleccione un producto y una cantidad válida');
      return;
    }

    // Validar duplicado
    if (productoEsDuplicado) {
      toast.error(`El producto "${productoSeleccionado.nombre}" ya está en el pedido. Use la opción editar para modificar la cantidad.`);
      return;
    }

    // Validar stock
    if (!stockSuficiente) {
      toast.error(`Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${productQuantity}`);
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
            <div className="border rounded p-4 h-64 md:h-80 overflow-y-auto">
              <h3 className="font-bold mb-2">Productos Encontrados</h3>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : resultados.length > 0 ? (
                resultados.map((product, index) => {
                  const yaExiste = productoYaExiste(product.id);
                  return (
                    <div 
                      key={index}
                      className={`p-2 border-b cursor-pointer transition-colors ${
                        productoSeleccionado?.id === product.id ? 'bg-blue-100' : 
                        yaExiste ? 'bg-red-50 opacity-50' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => !yaExiste && seleccionarProducto(product)}
                    >
                      <div className="font-medium text-sm">
                        {product.nombre}
                        {yaExiste && <span className="text-red-600 ml-2">(Ya en pedido)</span>}
                      </div>
                      <div className="text-xs text-gray-600">
                        Código: {product.id} | Stock: {product.stock_actual}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No hay productos para mostrar</p>
              )}
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-bold mb-4">Detalles del Producto</h3>
              {productoSeleccionado ? (
                <div className="space-y-3 text-sm">
                  <p><strong>Código:</strong> {productoSeleccionado.id}</p>
                  <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
                  <p><strong>Unidad de Medida:</strong> {productoSeleccionado.unidad_medida}</p>
                  <p><strong>Precio:</strong> ${precio.toFixed(2)}</p>
                  <p><strong>Stock Disponible:</strong> 
                    <span className={stockDisponible > 0 ? 'text-green-600' : 'text-red-600'}>
                      {stockDisponible}
                    </span>
                  </p>
                  
                  {/* Alertas de validación */}
                  {productoEsDuplicado && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
                      ⚠️ Este producto ya está en el pedido
                    </div>
                  )}
                  
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
                        className={`border p-2 w-16 rounded text-sm text-center ${
                          !stockSuficiente ? 'border-red-500 bg-red-50' : ''
                        }`}
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Math.max(1, Number(e.target.value)))}
                        min="1"
                        max={stockDisponible}
                      />
                      <button 
                        type="button"
                        className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                        onClick={() => setProductQuantity(Math.min(stockDisponible, productQuantity + 1))}
                      >
                        +
                      </button>
                    </div>
                    
                    {!stockSuficiente && (
                      <p className="text-red-600 text-xs mt-1">
                        ❌ Stock insuficiente (máximo: {stockDisponible})
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="font-semibold">Subtotal (sin IVA): ${subtotal.toFixed(2)}</p>
                  </div>
                  
                  <button 
                    onClick={handleAgregarProducto}
                    disabled={productoEsDuplicado || !stockSuficiente}
                    className={`mt-4 px-4 py-2 rounded w-full transition-colors ${
                      productoEsDuplicado || !stockSuficiente
                        ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {productoEsDuplicado 
                      ? 'Producto ya agregado' 
                      : !stockSuficiente 
                        ? 'Stock insuficiente'
                        : 'Agregar Producto'
                    }
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

export function ModalEditarProductoPedido({ 
  producto, 
  onClose, 
  onGuardar,
  onChange
}) {
  if (!producto) return null;

  // Obtener stock desde la información del producto
  const stockDisponible = Number(producto.stock_actual) || 0;
  const cantidadActual = Number(producto.cantidad) || 1;
  const stockSuficiente = cantidadActual <= stockDisponible;

  const handleCantidadChange = (e) => {
    const nuevaCantidad = Math.max(1, parseInt(e.target.value) || 1);
    
    // Validar stock antes de permitir el cambio
    if (nuevaCantidad > stockDisponible) {
      toast.error(`Stock insuficiente. Máximo disponible: ${stockDisponible}`);
      return;
    }

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

  const handleGuardar = () => {
    if (!stockSuficiente) {
      toast.error(`No se puede guardar. Stock insuficiente (disponible: ${stockDisponible})`);
      return;
    }
    onGuardar();
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

            {/* Mostrar stock disponible */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stock Disponible:</span>
                <span className={`font-bold ${stockDisponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockDisponible}
                </span>
              </div>
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
                  disabled={cantidad <= 1}
                >
                  -
                </button>
                <input 
                  type="number"
                  className={`border p-2 w-16 rounded text-sm text-center ${
                    !stockSuficiente ? 'border-red-500 bg-red-50' : ''
                  }`}
                  value={cantidad}
                  onChange={handleCantidadChange}
                  min="1"
                  max={stockDisponible}
                />
                <button 
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-black w-8 h-8 rounded flex items-center justify-center transition-colors"
                  onClick={() => handleCantidadChange({ target: { value: cantidad + 1 } })}
                  disabled={cantidad >= stockDisponible}
                >
                  +
                </button>
              </div>
              
              {!stockSuficiente && (
                <p className="text-red-600 text-xs mt-1">
                  ❌ Cantidad excede el stock disponible
                </p>
              )}
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
              onClick={handleGuardar}
              disabled={!stockSuficiente}
              className={`px-4 py-2 rounded transition-colors ${
                !stockSuficiente 
                  ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {!stockSuficiente ? 'Stock Insuficiente' : 'Guardar Cambios'}
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

export function ModalEliminarProductoPedido({ 
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

export function TablaProductosEscritorio({ productos, onEditarProducto, onEliminarProducto, canEdit }) {
  return (
    <div className="hidden lg:block overflow-x-auto bg-white rounded shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-center">UM</th>
            <th className="p-2 text-center">Cant.</th>
            <th className="p-2 text-right">Precio Unit.</th>
            <th className="p-2 text-right">IVA ($)</th>
            <th className="p-2 text-right">Subtotal</th>
            <th className="p-2 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            const precio = Number(producto.precio) || 0;
            const cantidad = Number(producto.cantidad) || 0;
            const ivaValue = Number(producto.iva) || 0;
            const subtotalSinIva = Number(producto.subtotal) || (cantidad * precio);
            
            return (
              <tr key={producto.id}
                  className={`hover:bg-gray-100 ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed'} border-b`}
                  onDoubleClick={canEdit ? () => onEditarProducto(producto) : undefined}> 
                <td className="p-2 font-mono text-xs">{producto.producto_id}</td>
                <td className="p-2 font-medium">{producto.producto_nombre}</td>
                <td className="p-2 text-center">{producto.producto_um}</td>
                <td className="p-2 text-center font-semibold">{cantidad}</td>
                <td className="p-2 text-right">${precio.toFixed(2)}</td>
                <td className="p-2 text-right">${ivaValue.toFixed(2)}</td>
                <td className="p-2 text-right font-semibold text-green-600">${subtotalSinIva.toFixed(2)}</td>
                <td className="p-2 text-center">
                  {canEdit && ( 
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
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TarjetasProductosMovil({ productos, onEditarProducto, onEliminarProducto, canEdit }) {
  return (
    <div className="lg:hidden space-y-3">
      {productos.map((producto) => {
        const precio = Number(producto.precio) || 0;
        const cantidad = Number(producto.cantidad) || 0;
        const ivaValue = Number(producto.iva) || 0;
        const subtotalSinIva = Number(producto.subtotal) || (cantidad * precio);
        
        return (
          <div key={producto.id} className="bg-white p-3 rounded shadow border">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">{producto.producto_nombre}</h4>
                <p className="text-xs text-gray-500">Código: {producto.producto_id}</p>
              </div>
              {canEdit && (
                <button
                  className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded ml-2 transition-colors text-xs"
                  onClick={() => onEliminarProducto(producto)}
                  title="Eliminar producto"
                >
                  ✕
                </button>
              )}
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
            {canEdit && (
              <button
                onClick={() => onEditarProducto(producto)}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs transition-colors"
              >
                Editar
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TablaProductos({ productos, onEditarProducto, onEliminarProducto, loading, canEdit }) {
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
        canEdit={canEdit}
      />
      <TarjetasProductosMovil
        productos={productos}
        onEditarProducto={onEditarProducto}
        onEliminarProducto={onEliminarProducto}
        canEdit={canEdit}
      />
    </>
  );
}

export function ResumenTotales({ productos }) {
  const subtotalNeto = productos.reduce((acc, prod) => {
    return acc + (Number(prod.subtotal) || 0);
  }, 0);

  const ivaTotal = productos.reduce((acc, prod) => {
    return acc + (Number(prod.iva) || 0);
  }, 0);

  const totalFinal = subtotalNeto + ivaTotal;

  if (productos.length === 0) return null;

  return (
    <div className="mt-4 bg-gray-50 rounded-lg p-3 border-2 border-gray-200">
      <div className="space-y-2">
        <div className="flex justify-between items-center py-1 border-b border-gray-300 text-sm">
          <span className="text-gray-700 font-medium">SUBTOTAL (sin IVA):</span>
          <span className="font-semibold text-gray-800">${subtotalNeto.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-1 border-b border-gray-300 text-sm">
          <span className="text-gray-700 font-medium">IVA TOTAL:</span>
          <span className="font-semibold text-red-600">${ivaTotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 bg-yellow-300 rounded-lg px-3 border-2 border-yellow-400">
          <span className="text-black font-bold">TOTAL (con IVA):</span>
          <span className="text-black text-lg font-bold">${totalFinal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}



// ModalDetallePedido actualizado
export function ModalDetallePedido({ 
  pedido,
  productos,
  loading,
  onClose,
  onAgregarProducto,
  onEditarProducto,
  onEliminarProducto,
  onCambiarEstado,
  onGenerarPDF,
  onActualizarObservaciones, // Nueva prop
  generandoPDF,
  mostrarModalFacturacion,
  setMostrarModalFacturacion,
  isPedidoFacturado,
  isPedidoAnulado
}) {
  const [clienteExpandido, setClienteExpandido] = useState(false);
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false); // Nuevo estado
  const { user } = useAuth();



    // Función helper para formatear fechas
  const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha no disponible';
  
  return new Date(fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  };



  if (!pedido) return null;
  
  const canEdit = !isPedidoFacturado && !isPedidoAnulado;

  const toggleClienteExpansion = () => {
    setClienteExpandido(!clienteExpandido);
  };

  const handleFacturar = () => {
    setMostrarModalFacturacion(true);
  };

  const handleConfirmarFacturacion = async (datosFacturacion) => {
    onCambiarEstado('Facturado');
    setMostrarModalFacturacion(false);
    toast.success(`¡Pedido #${pedido.id} facturado exitosamente! Venta ID: ${datosFacturacion.ventaId}`);
  };

  const handleImprimir = () => {
    if (onGenerarPDF) {
      onGenerarPDF(pedido.id);
    } else {
      toast.error('Función de impresión no implementada');
    }
  };

  // Función para abrir el modal de agregar producto
  const handleAbrirModalAgregar = () => {
    setMostrarModalAgregar(true);
  };

  // Función para manejar el agregado de producto con validaciones
  const handleAgregarProductoConValidaciones = async (producto, cantidad) => {
    const exito = await onAgregarProducto(producto, cantidad);
    if (exito) {
      setMostrarModalAgregar(false);
    }
    return exito;
  };

  const esGerente = user?.rol === 'GERENTE';

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                Pedido #{pedido.id}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-sm sm:text-lg font-semibold text-gray-700">
                <strong>Fecha:</strong> {formatearFecha(pedido.fecha)}
              </h4>
            </div>
            <InformacionCliente 
              pedido={pedido} 
              expandido={clienteExpandido}
              onToggleExpansion={toggleClienteExpansion}
              mostrarModalFacturacion={mostrarModalFacturacion}
              setMostrarModalFacturacion={setMostrarModalFacturacion}
              productos={productos}
              handleConfirmarFacturacion={handleConfirmarFacturacion}
            />

            <InformacionAdicional 
              pedido={pedido} 
              onActualizarObservaciones={onActualizarObservaciones}
              canEdit={canEdit}
            />

            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Productos del Pedido</h3>
              
              {canEdit && (
                <button
                  onClick={handleAbrirModalAgregar}
                  className="mb-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                >
                  ➕ AGREGAR PRODUCTO
                </button>
              )}

              <TablaProductos
                productos={productos}
                onEditarProducto={onEditarProducto}
                onEliminarProducto={onEliminarProducto}
                loading={loading}
                canEdit={canEdit}
              />
              <ResumenTotales productos={productos} />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              {esGerente && !isPedidoFacturado && (
                <button 
                  onClick={handleFacturar}
                  className={`bg-green-600 hover:bg-green-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors w-full ${
                    esGerente ? 'sm:w-1/3' : ''
                  }`}
                >
                  ✅ FACTURAR
                </button>
              )}
              
              <button 
                onClick={handleImprimir}
                className={`bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors w-full ${
                    esGerente && !isPedidoFacturado ? 'sm:w-1/3' : (isPedidoFacturado || !esGerente ? 'sm:w-1/2' : '')
                }`}
                disabled={generandoPDF}
              >
                {generandoPDF ? 'Generando PDF...' : '🖨️ IMPRIMIR'}
              </button>

              {esGerente && !isPedidoFacturado && (
                <button 
                  onClick={() => onCambiarEstado('Anulado')}
                  className={`bg-red-600 hover:bg-red-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors w-full ${
                    esGerente ? 'sm:w-1/3' : ''
                  }`}
                >
                  🚫 ANULAR
                </button>
              )}
              
              <button 
                onClick={onClose}
                className={`bg-gray-600 hover:bg-gray-700 text-white text-sm sm:text-lg font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors w-full ${
                    esGerente && !isPedidoFacturado ? 'sm:w-1/3' : (isPedidoFacturado || !esGerente ? 'sm:w-1/2' : '')
                }`}
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar producto con validaciones */}
      {mostrarModalAgregar && (
        <ModalAgregarProductoPedido
          mostrar={mostrarModalAgregar}
          onClose={() => setMostrarModalAgregar(false)}
          onAgregarProducto={handleAgregarProductoConValidaciones}
          productosActuales={productos} // Pasar productos actuales para validaciones
        />
      )}
    </>
  );
}