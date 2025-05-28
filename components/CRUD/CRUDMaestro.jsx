import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

// Hooks
import { useEntityCRUD, useEntitySearch, useFormMode } from '../../hooks/useCRUD';


// Componentes
import { LayoutCRUD } from './LayoutCRUD';
import { PanelLateralCRUD } from './PanelLateralCRUD';
import FormularioGenerico from './FormGenerico';
import { ModalBusquedaGenerica } from './ModalBusquedaGenerica';

export default function CRUDMaestro({ config }) {
  useAuth();

  // Hooks para manejar el estado
  const { selectedOption, setMode } = useFormMode();
  
  const {
    formData,
    setFormData,
    loading,
    handleInputChange,
    resetForm,
    saveEntity
  } = useEntityCRUD(config);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    modalIsOpen,
    setModalIsOpen,
    loading: searchLoading,
    handleSearch,
    handleResultClick,
    clearSearch
  } = useEntitySearch(config.searchConfig);

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
      // Opcionalmente cambiar de modo o realizar otras acciones
    }
  };

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