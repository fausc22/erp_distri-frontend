
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


export function useEntityCRUD(config) {
  const [formData, setFormData] = useState(config.initialData);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Aplicar validaciones específicas si existen
    if (config.validations && config.validations[name]) {
      if (!config.validations[name](value)) {
        return; // No actualizar si no pasa la validación
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(config.initialData);
  };

  const saveEntity = async () => {
    setLoading(true);
    
    try {
      if (formData.id) {
        // Actualizar entidad existente
        await axios.put(`${config.endpoints.update}/${formData.id}`, formData);
        toast.success(config.messages.updateSuccess);
      } else {
        // Crear nueva entidad
        await axios.post(config.endpoints.create, formData);
        toast.success(config.messages.createSuccess);
      }
      
      resetForm();
      return true;
    } catch (error) {
      console.error(`Error al guardar ${config.entityName}:`, error);
      toast.error(config.messages.saveError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    handleInputChange,
    resetForm,
    saveEntity
  };
}





export function useEntitySearch(config) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      toast.error('Ingrese al menos 3 caracteres para buscar');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${config.searchEndpoint}?search=${searchQuery}`);
      setSearchResults(response.data.data || response.data);
      setModalIsOpen(true);
    } catch (error) {
      console.error(`Error al buscar ${config.entityName}:`, error);
      toast.error(`Error al buscar ${config.entityName}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (item, onSelect) => {
    onSelect(item);
    setSearchQuery('');
    setModalIsOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setModalIsOpen(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    modalIsOpen,
    setModalIsOpen,
    loading,
    handleSearch,
    handleResultClick,
    clearSearch
  };
}



export function useFormMode() {
  const [selectedOption, setSelectedOption] = useState(null);

  const setMode = (mode) => {
    setSelectedOption(mode);
  };

  const clearMode = () => {
    setSelectedOption(null);
  };

  return {
    selectedOption,
    setMode,
    clearMode,
    isNewMode: selectedOption === 'new',
    isEditMode: selectedOption === 'edit'
  };
}