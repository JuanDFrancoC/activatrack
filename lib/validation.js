import { CATEGORIES, STATUSES } from './constants.js';

export class AppError extends Error {
  constructor(message, status = 400, fields = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.fields = fields;
  }
}

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  if (year < 1900 || year > 2100) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateActivity(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new AppError('El cuerpo debe ser un objeto con los datos de la actividad.');
  }
  const fields = {};
  const activity = {};
  const limits = { titulo: 150, descripcion: 500, responsable: 100 };
  const labels = { titulo: 'título', descripcion: 'descripción', responsable: 'responsable' };
  for (const [field, limit] of Object.entries(limits)) {
    const value = typeof input[field] === 'string' ? input[field].trim() : '';
    if (!value)
      fields[field] = `Ingresa ${field === 'descripcion' ? 'una' : 'un'} ${labels[field]}.`;
    else if ([...value].length > limit) fields[field] = `El máximo es de ${limit} caracteres.`;
    else if (value.includes('\u0000')) fields[field] = 'El texto contiene un carácter no válido.';
    activity[field] = value;
  }
  activity.fecha = input.fecha;
  if (!validDate(input.fecha)) fields.fecha = 'Selecciona una fecha válida entre 1900 y 2100.';
  activity.categoria = input.categoria;
  if (!CATEGORIES.includes(input.categoria)) fields.categoria = 'Selecciona una categoría válida.';
  activity.estado = input.estado ?? 'Pendiente';
  if (!STATUSES.includes(activity.estado)) fields.estado = 'Selecciona un estado válido.';
  if (Object.keys(fields).length) throw new AppError('Revisa los campos señalados.', 422, fields);
  // Solo se devuelven los campos permitidos: id y creado_en no son editables.
  return activity;
}

export function validateId(value) {
  if (!/^[1-9]\d*$/.test(String(value))) throw new AppError('El identificador no es válido.');
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 2147483647)
    throw new AppError('El identificador no es válido.');
  return id;
}
