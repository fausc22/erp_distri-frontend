import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { CompraProvider, useCompra } from '../../context/ComprasContext';
import { useRegistrarCompra } from '../../hooks/compra/useRegistrarCompra';

import SelectorProveedores from '../../components/compra/SelectorProveedores';
import SelectorProductosCompra from '../../components/compra/SelectorProductosCompra';
import ProductosCarritoCompra from '../../components/compra/ProductosCarritoCompras';
import { ModalConfirmacionCompraCompleto } from '../../components/compra/ModalConfirmacionCompraCompleto';
import { ModalConfirmacionSalidaCompra } from '../../components/compra/ModalesConfirmacionCompra';
import { BotonAccionesCompra } from '../../components/compra/BotonAccionesCompra';

function RegistrarCompraContent() {
  const { proveedor, productos, total, clearCompra } = useCompra();
  const { registrarCompra, loading } = useRegistrarCompra();
  
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  useAuth();

  const handleConfirmarCompra = () => {
    if (!proveedor) {
      toast.error('Debe seleccionar un proveedor');
      return;
    }
    
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  const handleRegistrarCompra = async (datosCompraCompletos) => {
    console.log('📋 Datos recibidos para registrar compra:', datosCompraCompletos);
    
    try {
      const resultado = await registrarCompra(datosCompraCompletos);
      
      if (resultado.success) {
        clearCompra();
        setMostrarConfirmacion(false);
        
        // Mostrar detalles del resultado
        if (resultado.data) {
          toast.success(`Compra registrada correctamente. ID: ${resultado.data.compra_id}`);
        }
        
        return true;
      } else {
        toast.error(resultado.message || 'Error al registrar la compra');
        return false;
      }
    } catch (error) {
      console.error('Error en handleRegistrarCompra:', error);
      toast.error('Error inesperado al registrar la compra');
      return false;
    }
  };

  const handleConfirmarSalida = () => {
    if (proveedor || productos.length > 0) {
      setMostrarConfirmacionSalida(true);
    } else {
      window.location.href = '/';
    }
  };

  const handleSalir = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Head>
        <title>VERTIMAR | Registrar Compra</title>
        <meta name="description" content="Registro de compras a proveedores con integración de cuentas de fondos" />
      </Head>
      
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Encabezado */}
        <div className="bg-green-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">🛒 REGISTRAR COMPRA</h1>
          <p className="text-green-200 mt-2">Ingrese los datos de la compra a proveedor y seleccione cuenta de origen</p>
        </div>
        
        <div className="p-6">
          {/* Sección superior: Proveedor y búsqueda de productos */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <SelectorProveedores />
            <SelectorProductosCompra />
          </div>
          
          {/* Tabla de productos */}
          <ProductosCarritoCompra />
          
          {/* Información sobre la integración de fondos */}
          {proveedor && productos.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    💰 Control de Fondos Integrado
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Seleccione la cuenta desde la cual se registrará el egreso</li>
                      <li>El saldo será actualizado automáticamente</li>
                      <li>Podrá modificar los montos antes de confirmar</li>
                      <li>Opción de actualizar o no el stock de productos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Resumen rápido */}
          {proveedor && productos.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Proveedor: {proveedor.nombre}</span>
                  <span>Productos: {productos.length}</span>
                </div>
                <div className="font-bold text-lg text-green-600">
                  Total: ${total.toFixed(2)}
                </div>
              </div>
            </div>
          )}
          
          {/* Botones de acción */}
          <BotonAccionesCompra
            onConfirmarCompra={handleConfirmarCompra}
            onVolverMenu={handleConfirmarSalida}
            loading={loading}
            disabled={!proveedor || productos.length === 0}
          />
        </div>
      </div>
      
      {/* Modal de confirmación de compra completo */}
      <ModalConfirmacionCompraCompleto
        mostrar={mostrarConfirmacion}
        proveedor={proveedor}
        productos={productos}
        totalInicial={total}
        onConfirmarCompra={handleRegistrarCompra}
        onClose={() => setMostrarConfirmacion(false)}
        loading={loading}
      />
      
      {/* Modal de confirmación de salida */}
      <ModalConfirmacionSalidaCompra
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

// Solo CompraProvider, sin FondosProvider
export default function RegistrarCompra() {
  return (
    <CompraProvider>
      <RegistrarCompraContent />
    </CompraProvider>
  );
}