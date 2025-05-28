import { useState } from 'react';
import Head from 'next/head';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

import { VentaProvider, useVenta } from '../../context/VentasContext';
import { useVentaSubmit } from '../../hooks/ventas/useNuevaVenta';

import ClienteSelector from '../../components/ventas/SelectorClientes';
import ProductoSelector from '../../components/ventas/SelectorProductos';
import ProductosCarrito from '../../components/ventas/ProductosCarrito';
import { ModalConfirmacionVenta, ModalConfirmacionSalida } from '../../components/ventas/ModalesConfirmacion';

function RegistrarVentaContent() {
  const { cliente, productos, total, clearVenta } = useVenta();
  const { registrarVenta, loading } = useVentaSubmit();
  
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionSalida, setMostrarConfirmacionSalida] = useState(false);

  useAuth();

  const totalProductos = productos.reduce((acc, prod) => acc + prod.cantidad, 0);

  const handleConfirmarVenta = () => {
    if (!cliente) {
      toast.error('Debe seleccionar un cliente.');
      return;
    }
    
    if (productos.length === 0) {
      toast.error('Debe agregar al menos un producto.');
      return;
    }
    
    setMostrarConfirmacion(true);
  };

  const handleRegistrarVenta = async () => {
    const exito = await registrarVenta(cliente, productos, total);
    if (exito) {
      clearVenta();
      setMostrarConfirmacion(false);
    }
  };

  const handleConfirmarSalida = () => {
    if (cliente || productos.length > 0) {
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
        <title>VERTIMAR | NUEVA VENTA</title>
        <meta name="description" content="Sistema de registro de ventas" />
      </Head>
      
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-center">NUEVA VENTA</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          <ClienteSelector />
          <ProductoSelector />
        </div>

        <ProductosCarrito />
        
        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-4">
          <button 
            className="bg-green-600 hover:bg-green-800 px-6 py-2 rounded text-white font-semibold"
            onClick={handleConfirmarVenta}
          >
            Confirmar Venta
          </button>
          <button 
            className="bg-red-600 hover:bg-red-800 px-6 py-2 rounded text-white font-semibold"
            onClick={handleConfirmarSalida}
          >
            Volver al Menú
          </button>
        </div>
      </div>
      
      <ModalConfirmacionVenta
        mostrar={mostrarConfirmacion}
        cliente={cliente}
        totalProductos={totalProductos}
        total={total}
        onConfirmar={handleRegistrarVenta}
        onCancelar={() => setMostrarConfirmacion(false)}
        loading={loading}
      />

      <ModalConfirmacionSalida
        mostrar={mostrarConfirmacionSalida}
        onConfirmar={handleSalir}
        onCancelar={() => setMostrarConfirmacionSalida(false)}
      />
    </div>
  );
}

export default function RegistrarVenta() {
  return (
    <VentaProvider>
      <RegistrarVentaContent />
    </VentaProvider>
  );
}