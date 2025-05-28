import { useState } from 'react';

// Componente para campos individuales
function CampoFormulario({ field, value, onChange, disabled = false }) {
  const baseClasses = "rounded-none rounded-r-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5";
  const disabledClasses = disabled ? "bg-gray-100" : "";

  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={onChange}
            className={`${baseClasses} ${disabledClasses}`}
            disabled={disabled}
          >
            {field.options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value}
            onChange={onChange}
            className={`${baseClasses} ${disabledClasses}`}
            step={field.step}
            min={field.min}
            disabled={disabled}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            name={field.name}
            value={value}
            onChange={onChange}
            className={`${baseClasses} ${disabledClasses}`}
            disabled={disabled}
          />
        );
      
      default: // text
        return (
          <input
            type="text"
            name={field.name}
            value={value}
            onChange={onChange}
            className={`${baseClasses} ${disabledClasses}`}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <div className="flex">
        <span className="inline-flex items-center px-3 text-gray-900 bg-gray-200 border rounded-l-md">
          {field.label}
        </span>
        {field.prefix && (
          <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b">
            {field.prefix}
          </span>
        )}
        {renderInput()}
        {field.suffix && (
          <span className="inline-flex items-center px-3 text-gray-900 bg-gray-100 border-t border-b rounded-r-md">
            {field.suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// Componente principal del formulario
export default function FormularioGenerico({
  config,
  formData,
  mode, // 'new' o 'edit'
  onInputChange,
  onSave,
  onReset,
  onSearch,
  searchQuery,
  onSearchQueryChange,
  loading = false,
  children // Para el modal de búsqueda
}) {
  const isEditMode = mode === 'edit';
  const formTitle = config.formTitles[mode];
  
  if (!formTitle) return null;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold">{formTitle.title}</h2>
        <p className="text-gray-600">{formTitle.subtitle}</p>
      </div>
      
      {/* Campo de búsqueda solo en modo edición */}
      {isEditMode && (
        <div className="mb-4">
          <div className="flex">
            <input
              type="text"
              placeholder={config.searchConfig.placeholder}
              value={searchQuery}
              onChange={onSearchQueryChange}
              className="rounded-none rounded-l-lg border text-gray-900 block flex-1 min-w-0 w-full p-2.5"
            />
            <button 
              onClick={onSearch}
              className="inline-flex items-center px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-r-md"
            >
              BUSCAR
            </button>
          </div>
        </div>
      )}
      
      {/* Campos del formulario */}
      {config.fields.map((field) => (
        <CampoFormulario
          key={field.name}
          field={field}
          value={formData[field.name] || ''}
          onChange={onInputChange}
        />
      ))}
      
      {/* Botones de acción */}
      <div className="flex gap-2">
        <button 
          onClick={onSave}
          disabled={loading}
          className={`text-white py-2 px-4 rounded ${
            loading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'GUARDANDO...' : (isEditMode ? config.buttons.update : config.buttons.create)}
        </button>
        <button 
          onClick={onReset}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {config.buttons.clear}
        </button>
      </div>
      
      {/* Modal de búsqueda pasado como children */}
      {children}
    </div>
  );
}