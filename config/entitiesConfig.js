// config/entitiesConfig.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
// Validaciones comunes
const validations = {
  onlyNumbers: (value) => /^\d*$/.test(value),
  email: (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  decimal: (value) => value === '' || /^\d*\.?\d*$/.test(value)
};

// Configuración para Productos
export const productosConfig = {
  entityName: 'producto',
  title: 'PRODUCTOS',
  subtitle: 'SELECCIONE UNA OPCIÓN',
  
  initialData: {
    nombre: '',
    unidad_medida: '',
    costo: '',
    precio: '',
    categoria_id: '',
    iva: '',
    stock_actual: ''
  },
  
  endpoints: {
    create: `${apiUrl}/productos/crear-producto`,
    update: `${apiUrl}/productos/actualizar-producto`,
    search: `${apiUrl}/productos/buscar-producto`
  },
  
  messages: {
    createSuccess: 'Producto agregado correctamente',
    updateSuccess: 'Producto actualizado correctamente',
    saveError: 'Error al guardar producto'
  },
  
  validations: {
    costo: validations.decimal,
    precio: validations.decimal,
    iva: validations.decimal,
    stock_actual: validations.onlyNumbers
  },
  
  fields: [
    {
      name: 'nombre',
      label: 'NOMBRE',
      type: 'text',
      required: true
    },
    {
      name: 'categoria_id',
      label: 'CATEGORIA',
      type: 'text',
      required: true
    },
    {
      name: 'unidad_medida',
      label: 'UNIDAD MEDIDA',
      type: 'select',
      options: [
        { value: '', label: '' },
        { value: 'UNIDADES', label: 'UNIDADES' },
        { value: 'LITROS', label: 'LITROS' }
      ],
      required: true
    },
    {
      name: 'costo',
      label: 'PRECIO COSTO',
      type: 'number',
      prefix: '$',
      step: '0.01',
      required: true
    },
    {
      name: 'precio',
      label: 'PRECIO VENTA',
      type: 'number',
      prefix: '$',
      step: '0.01',
      required: true
    },
    {
      name: 'iva',
      label: 'IVA',
      type: 'number',
      suffix: '%',
      step: '0.01',
      required: true
    },
    {
      name: 'stock_actual',
      label: 'STOCK',
      type: 'number',
      min: '0',
      required: true
    }
  ],
  
  searchConfig: {
    searchEndpoint: `${apiUrl}/productos/buscar-producto`,
    placeholder: 'BUSCAR POR NOMBRE O CATEGORIA',
    entityName: 'producto'
  },
  
  buttons: {
    new: 'NUEVO PRODUCTO',
    edit: 'EDITAR PRODUCTO',
    create: 'CREAR PRODUCTO',
    update: 'ACTUALIZAR PRODUCTO',
    clear: 'LIMPIAR DATOS'
  },
  
  formTitles: {
    new: {
      title: 'NUEVO PRODUCTO',
      subtitle: 'INSERTE LOS SIGUIENTES DATOS'
    },
    edit: {
      title: 'EDITAR PRODUCTO',
      subtitle: 'MODIFIQUE LOS DATOS DEL PRODUCTO'
    }
  }
};

// Configuración para Clientes
export const clientesConfig = {
  entityName: 'cliente',
  title: 'CLIENTES',
  subtitle: 'SELECCIONE UNA OPCIÓN',
  
  initialData: {
    nombre: '',
    condicion_iva: '',
    cuit: '',
    dni: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: ''
  },
  
  endpoints: {
    create: `${apiUrl}/personas/crear-cliente`,
    update: `${apiUrl}/personas/actualizar-cliente`,
    search: `${apiUrl}/personas/buscar-cliente`
  },
  
  messages: {
    createSuccess: 'Cliente creado correctamente',
    updateSuccess: 'Cliente actualizado correctamente',
    saveError: 'Error al guardar cliente'
  },
  
  validations: {
    cuit: validations.onlyNumbers,
    dni: validations.onlyNumbers,
    telefono: validations.onlyNumbers,
    email: validations.email
  },
  
  fields: [
    {
      name: 'nombre',
      label: 'NOMBRE',
      type: 'text',
      required: true
    },
    {
      name: 'condicion_iva',
      label: 'CONDICION IVA',
      type: 'select',
      options: [
        { value: '', label: 'SELECCIONE UNA CATEGORIA' },
        { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
        { value: 'Monotributo', label: 'Monotributo' },
        { value: 'Consumidor Final', label: 'Consumidor Final' }
      ],
      required: true
    },
    {
      name: 'cuit',
      label: 'CUIT',
      type: 'text',
      required: false
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: false
    },
    {
      name: 'direccion',
      label: 'DIRECCION',
      type: 'text',
      required: false
    },
    {
      name: 'ciudad',
      label: 'CIUDAD',
      type: 'text',
      required: false
    },
    {
      name: 'provincia',
      label: 'PROVINCIA',
      type: 'text',
      required: false
    },
    {
      name: 'telefono',
      label: 'TELEFONO',
      type: 'text',
      required: false
    },
    {
      name: 'email',
      label: 'EMAIL',
      type: 'email',
      prefix: '@',
      required: false
    }
  ],
  
  searchConfig: {
    searchEndpoint: `${apiUrl}/personas/buscar-cliente`,
    placeholder: 'BUSCAR POR NOMBRE',
    entityName: 'cliente'
  },
  
  buttons: {
    new: 'NUEVO CLIENTE',
    edit: 'EDITAR CLIENTE',
    create: 'CREAR CLIENTE',
    update: 'ACTUALIZAR CLIENTE',
    clear: 'LIMPIAR DATOS'
  },
  
  formTitles: {
    new: {
      title: 'NUEVO CLIENTE',
      subtitle: 'INSERTE LOS SIGUIENTES DATOS'
    },
    edit: {
      title: 'EDITAR CLIENTE',
      subtitle: 'MODIFIQUE LOS DATOS DEL CLIENTE'
    }
  }
};

// Configuración para Proveedores
export const proveedoresConfig = {
  entityName: 'proveedor',
  title: 'PROVEEDORES',
  subtitle: 'SELECCIONE UNA OPCIÓN',
  
  initialData: {
    nombre: '',
    condicion_iva: '',
    cuit: '',
    dni: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: ''
  },
  
  endpoints: {
    create: `${apiUrl}/personas/crear-proveedor`,
    update: `${apiUrl}/personas/actualizar-proveedor`,
    search: `${apiUrl}/personas/buscar-proveedor`
  },
  
  messages: {
    createSuccess: 'Proveedor creado correctamente',
    updateSuccess: 'Proveedor actualizado correctamente',
    saveError: 'Error al guardar proveedor'
  },
  
  validations: {
    cuit: validations.onlyNumbers,
    dni: validations.onlyNumbers,
    telefono: validations.onlyNumbers,
    email: validations.email
  },
  
  fields: [
    {
      name: 'nombre',
      label: 'NOMBRE',
      type: 'text',
      required: true
    },
    {
      name: 'condicion_iva',
      label: 'CONDICION IVA',
      type: 'select',
      options: [
        { value: '', label: 'SELECCIONE UNA CATEGORIA' },
        { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
        { value: 'Monotributo', label: 'Monotributo' },
        { value: 'Consumidor Final', label: 'Consumidor Final' }
      ],
      required: true
    },
    {
      name: 'cuit',
      label: 'CUIT',
      type: 'text',
      required: false
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      required: false
    },
    {
      name: 'direccion',
      label: 'DIRECCION',
      type: 'text',
      required: false
    },
    {
      name: 'ciudad',
      label: 'CIUDAD',
      type: 'text',
      required: false
    },
    {
      name: 'provincia',
      label: 'PROVINCIA',
      type: 'text',
      required: false
    },
    {
      name: 'telefono',
      label: 'TELEFONO',
      type: 'text',
      required: false
    },
    {
      name: 'email',
      label: 'EMAIL',
      type: 'email',
      prefix: '@',
      required: false
    }
  ],
  
  searchConfig: {
    searchEndpoint: `${apiUrl}/personas/buscar-proveedor`,
    placeholder: 'BUSCAR POR NOMBRE',
    entityName: 'proveedor'
  },
  
  buttons: {
    new: 'NUEVO PROVEEDOR',
    edit: 'EDITAR PROVEEDOR',
    create: 'CREAR PROVEEDOR',
    update: 'ACTUALIZAR PROVEEDOR',
    clear: 'LIMPIAR DATOS'
  },
  
  formTitles: {
    new: {
      title: 'NUEVO PROVEEDOR',
      subtitle: 'INSERTE LOS SIGUIENTES DATOS'
    },
    edit: {
      title: 'EDITAR PROVEEDOR',
      subtitle: 'MODIFIQUE LOS DATOS DEL PROVEEDOR'
    }
  }
};