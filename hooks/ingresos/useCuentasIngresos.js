// hooks/ingresos/useCuentasIngresos.js
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useIngresos } from '../../context/IngresosContext';

export function useCuentasIngresos() {
  const { cuentas, setCuentas, setLoading } = useIngresos();

  const cargarCuentas = async () => {
    setLoading({ cuentas: true });
    try {
      const response = await axios.get(`http://localhost:3001/finanzas/ingresos/cuentas`);
      if (response.data.success) {
        setCuentas(response.data.data);
      } else {
        toast.error("Error al cargar las cuentas");
      }
    } catch (error) {
      console.error("Error al obtener cuentas:", error);
      toast.error("No se pudieron cargar las cuentas");
    } finally {
      setLoading({ cuentas: false });
    }
  };

  return {
    cuentas,
    cargarCuentas
  };
}