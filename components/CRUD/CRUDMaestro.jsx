import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

// Hooks
import { useEntityCRUD, useFormMode } from '../../hooks/useCRUD';
import { useEmpleados } from '../../hooks/useEmpleados';

// Componentes
import { LayoutCRUD } from './LayoutCRUD';
import { PanelLateralCRUD } from './PanelLateralCRUD';
import FormularioGenerico from './FormGenerico';
import { ModalBusquedaGenerica } from './ModalBusquedaGenerica';

export default function CRUDMaestro({ config }) {
  useAuth();

  // Detectar si es empleado
  const isEmpleado = config.entityName === 'empleado';
  
  // Estados para formulario
  const [formData, setFormData] = useState(config.initialData);
  const [errors, setErrors] = useState({});
  
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Hooks para manejar el estado
  const { selectedOption, setMode } = useFormMode();
  
  // Hook de empleados (solo si es empleado)
  const empleadosHook = isEmpleado ? useEmpleados() : null;
  
  // Hook genérico (solo si NO es empleado)
  const genericHook = !isEmpleado ? useEntityCRUD(config) : null;

  // Funciones unificadas que funcionan para ambos hooks
  const loading = isEmpleado ? empleadosHook?.loading : genericHook?.loading;
  const user = isEmpleado ? empleadosHook?.user : genericHook?.user;

  // Manejo de cambios en inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Validaciones en tiempo real (permisivas)
    if (config.liveValidations && config.liveValidations[name]) {
      if (!config.liveValidations[name](value)) {
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo si existía
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (isEmpleado) {
      // Usar validaciones de empleados
      const errores = empleadosHook.validarDatosEmpleado(formData, !!formData.id);
      
      // Convertir errores de empleados al formato de errors object
      errores.forEach(error => {
        if (error.includes('nombre')) newErrors.nombre = error;
        if (error.includes('apellido')) newErrors.apellido = error;
        if (error.includes('usuario')) newErrors.usuario = error;
        if (error.includes('password')) newErrors.password = error;
        if (error.includes('rol')) newErrors.rol = error;
        if (error.includes('email')) newErrors.email = error;
        if (error.includes('DNI')) newErrors.dni = error;
        if (error.includes('teléfono')) newErrors.telefono = error;
      });
    } else {
      // Usar validaciones genéricas
      if (config.validations) {
        Object.keys(config.validations).forEach(fieldName => {
          const value = formData[fieldName];
          const validation = config.validations[fieldName];
          
          if (!validation(value)) {
            newErrors[fieldName] = `${fieldName} no es válido`;
          }
        });
      }
      
      // Validaciones de campos obligatorios
      if (config.fields) {
        config.fields.forEach(field => {
          if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
            newErrors[field.name] = `${field.label} es obligatorio`;
          }
        });
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData(config.initialData);
    setErrors({});
  };

  // Guardar entidad
  const saveEntity = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return false;
    }

    try {
      let result;
      
      if (isEmpleado) {
        // Usar hook de empleados
        if (formData.id) {
          result = await empleadosHook.actualizarEmpleado(formData);
        } else {
          result = await empleadosHook.crearEmpleado(formData);
        }
        
        if (result.success) {
          resetForm();
          return true;
        } else {
          return false;
        }
      } else {
        // Usar hook genérico
        return await genericHook.saveEntity();
      }
    } catch (error) {
      console.error('Error en saveEntity:', error);
      toast.error('Error inesperado al guardar');
      return false;
    }
  };

  // Búsqueda unificada
  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      toast.error('Ingrese al menos 2 caracteres para buscar');
      return;
    }

    setSearchLoading(true);
    try {
      let results = [];
      
      if (isEmpleado) {
        // Usar búsqueda de empleados
        results = await empleadosHook.buscarEmpleados(searchQuery);
      } else {
        // Usar búsqueda genérica con axios
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        };
        
        const response = await axios.get(
          `${config.searchConfig.searchEndpoint}?search=${encodeURIComponent(searchQuery)}`,
          { headers }
        );
        results = response.data.data || response.data;
      }
      
      setSearchResults(results);
      setModalIsOpen(true);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast.error(`Error al buscar ${config.entityName}s`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setModalIsOpen(false);
  };

  // Manejar click en resultado
  const handleResultClick = (item, onSelect) => {
    onSelect(item);
    clearSearch();
  };

  // Handlers
  const handleModeSelect = (mode) => {
    setMode(mode);
    resetForm();
    clearSearch();
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultSelect = (item) => {
    // Mapear el item seleccionado al formato del formulario
    const mappedData = { ...config.initialData };
        
    // Copiar todos los campos que coincidan
    Object.keys(config.initialData).forEach(key => {
      if (item[key] !== undefined) {
        mappedData[key] = item[key];
      }
    });
        
    // Asegurar que se incluya el ID para edición
    mappedData.id = item.id;
        
    setFormData(mappedData);
  };

  const handleSave = async () => {
    const success = await saveEntity();
    if (success) {
      toast.success('Operación completada exitosamente');
    }
  };

  // Verificación de acceso para empleados
  const canAccess = () => {
    if (isEmpleado && user && user.rol !== 'GERENTE') {
      return false;
    }
    return true;
  };

  // Si es empleado y no tiene permisos, mostrar mensaje de acceso restringido
  if (isEmpleado && !canAccess()) {
    return (
      <LayoutCRUD 
        title={config.title}
        descripcion={`Gestión de ${config.entityName}s VERTIMAR`}
      >
        <div className="w-full p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">
            Solo los gerentes pueden gestionar empleados.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tu rol actual: {user?.rol || 'No definido'}
          </p>
        </div>
      </LayoutCRUD>
    );
  }

  return (
    <LayoutCRUD 
      title={config.title}
      descripcion={`Gestión de ${config.entityName}s VERTIMAR`}
    >
      <PanelLateralCRUD 
        config={config}
        onModeSelect={handleModeSelect}
      />
            
      {/* Panel derecho - formulario */}
      <div className={`w-full md:w-2/3 p-8 ${selectedOption ? 'block' : 'hidden md:block'}`}>
        {selectedOption && (
          <FormularioGenerico
            config={config}
            formData={formData}
            mode={selectedOption}
            errors={errors}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onReset={resetForm}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchQueryChange}
            loading={loading}
          >
            <ModalBusquedaGenerica
              mostrar={modalIsOpen}
              titulo={`Seleccionar ${config.entityName.charAt(0).toUpperCase() + config.entityName.slice(1)}`}
              resultados={searchResults}
              onSeleccionar={(item) => handleResultClick(item, handleResultSelect)}
              onCerrar={() => setModalIsOpen(false)}
              loading={searchLoading}
              displayField="nombre"
            />
          </FormularioGenerico>
        )}
      </div>
    </LayoutCRUD>
  );
}