import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
export function useRegistrarGasto() {
  const [loading, setLoading] = useState(false);

  const registrarGasto = async (formData) => {
    // Validar datos requeridos
    if (!formData.descripcion || !formData.monto || !formData.formaPago) {
      toast.error('Por favor complete los campos obligatorios: Descripción, Monto y Forma de Pago');
      return false;
    }

    setLoading(true);
    
    try {
      // Crear un FormData para enviar los datos, incluyendo el archivo
      const formDataToSend = new FormData();
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("monto", formData.monto);
      formDataToSend.append("formaPago", formData.formaPago);
      
      if (formData.observaciones) {
        formDataToSend.append("observaciones", formData.observaciones);
      }
      
      if (formData.comprobante) {
        formDataToSend.append("comprobante", formData.comprobante);
      }
      
      // Enviar todos los datos en una sola petición
      const response = await axios.post(
        `${apiUrl}/compras/nuevo-gasto`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || 'Gasto registrado con éxito');
        return true;
      } else {
        toast.error(response.data.message || 'Error al registrar el gasto');
        return false;
      }
    } catch (error) {
      console.error('Error al registrar el gasto:', error);
      toast.error(error.response?.data?.message || 'Error al registrar el gasto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { registrarGasto, loading };
}