import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export function useEditarVenta() {
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarProductosVenta = async (venta) => {
    setSelectedVenta(venta);
    setLoading(true);
    
    try {
      const response = await axios.get(`http://localhost:3001/ventas/obtener-productos-venta/${venta.id}`);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      toast.error("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const agregarProducto = async (producto, cantidad) => {
    if (!selectedVenta) return false;

    const precio = parseFloat(producto.precio);
    const iva = parseFloat((precio * 0.21).toFixed(2));
    const subtotal = parseFloat((precio * cantidad).toFixed(2));

    const newProduct = {
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      producto_um: producto.unidad_medida,
      cantidad,
      precio,
      iva,
      subtotal
    };

    try {
      const response = await axios.post(`http://localhost:3001/ventas/agregar-producto/${selectedVenta.id}`, newProduct);
      
      if (response.data.success) {
        toast.success(`Producto agregado: ${cantidad} x ${producto.nombre}`);
        await cargarProductosVenta(selectedVenta);
        await actualizarTotalVenta();
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      toast.error('No se pudo agregar el producto');
      return false;
    }
  };

  const eliminarProducto = async (producto) => {
    if (!selectedVenta) return false;

    try {
      const response = await axios.delete(`http://localhost:3001/ventas/eliminar-producto-venta/${producto.id}`);
      
      if (response.data.success) {
        toast.success(`Producto eliminado: ${producto.producto_nombre}`);
        await cargarProductosVenta(selectedVenta);
        await actualizarTotalVenta();
        return true;
      } else {
        toast.error('No se pudo eliminar el producto');
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
      return false;
    }
  };

  const actualizarProducto = async (producto) => {
    if (!selectedVenta) return false;

    const updatedProduct = {
      cantidad: producto.cantidad || 1,
      precio: producto.precio || 0,
      iva: (producto.precio * 0.21).toFixed(2),
      subtotal: (producto.cantidad * producto.precio).toFixed(2)
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/ventas/actualizar-producto-venta/${producto.id}`,
        updatedProduct
      );

      if (response.data.success) {
        toast.success(`Producto actualizado: ${producto.producto_nombre}`);
        await cargarProductosVenta(selectedVenta);
        await actualizarTotalVenta();
        return true;
      } else {
        toast.error('No se pudo actualizar el producto');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error('Error al actualizar el producto');
      return false;
    }
  };

  const actualizarTotalVenta = async () => {
    if (!selectedVenta) return;

    const nuevoTotal = productos
      .reduce((acc, prod) => acc + parseFloat(prod.subtotal || 0), 0)
      .toFixed(2);

    try {
      const response = await axios.put(`http://localhost:3001/ventas/actualizar-venta/${selectedVenta.id}`, { 
        total: parseFloat(nuevoTotal) 
      });

      if (response.data.success) {
        setSelectedVenta(prev => ({ ...prev, total: nuevoTotal }));
      }
    } catch (error) {
      console.error("Error al actualizar el total:", error);
      toast.error("No se pudo actualizar el total");
    }
  };

  const cerrarEdicion = () => {
    setSelectedVenta(null);
    setProductos([]);
  };

  return {
    selectedVenta,
    productos,
    loading,
    cargarProductosVenta,
    agregarProducto,
    eliminarProducto,
    actualizarProducto,
    cerrarEdicion
  };
}