import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useState } from 'react';



const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useVentaSubmit() {
  const [loading, setLoading] = useState(false);

  const registrarVenta = async (cliente, productos, total) => {
    if (!cliente || productos.length === 0) {
      toast.error('Debe seleccionar un cliente y agregar al menos un producto.');
      return false;
    }

    const ventaData = {
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono,
      cliente_direccion: cliente.direccion,
      cliente_ciudad: cliente.ciudad,
      cliente_provincia: cliente.provincia,
      cliente_condicion: cliente.condicion_iva,
      cliente_cuit: cliente.cuit,
      tipo_documento: 'Factura',
      tipo_fiscal: 'A',
      total: total.toFixed(2),
      estado: 'Registrada',
      empleado_id: 1,
      empleado_nombre: 'Fausto',
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        unidad_medida: p.unidad_medida,
        cantidad: p.cantidad,
        precio: parseFloat(p.precio),
        iva: parseFloat(p.iva || 0),
        subtotal: parseFloat(p.subtotal)
      })),
    };

    setLoading(true);
    try {
      await axios.post(`${apiUrl}/ventas/crear-venta`, ventaData);
      toast.success('Venta registrada con éxito');
      return true;
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      toast.error('Error al registrar la venta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { registrarVenta, loading };
}