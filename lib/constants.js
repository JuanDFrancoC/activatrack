// Los valores coinciden exactamente con los CHECK de la tabla creada en Neon.
export const CATEGORIES = [
  'Alianzas',
  'Feria de empleo',
  'Unidad móvil',
  'Reclutamiento',
  'Visitas a clientes',
];
export const STATUSES = ['Pendiente', 'En curso', 'Realizada', 'Cancelada'];
export const CATEGORY_ICONS = {
  Alianzas: 'handshake',
  'Feria de empleo': 'users',
  'Unidad móvil': 'truck',
  Reclutamiento: 'briefcase',
  'Visitas a clientes': 'building',
};
export const STATUS_CLASSES = {
  Pendiente: 'pending',
  'En curso': 'progress',
  Realizada: 'done',
  Cancelada: 'cancelled',
};
export const EMPTY_ACTIVITY = {
  titulo: '',
  descripcion: '',
  responsable: '',
  fecha: '',
  categoria: '',
  estado: 'Pendiente',
};
