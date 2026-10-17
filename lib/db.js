import { neon } from '@neondatabase/serverless';
import { AppError } from './validation.js';

// Este módulo se importa únicamente desde las rutas del servidor.
export function getSql() {
  const connection = process.env.DATABASE_URL;
  if (!connection || connection.includes('USUARIO:CONTRASENA')) {
    throw new AppError(
      'Falta configurar DATABASE_URL en .env.local (o en Vercel). Consulta INICIO_RAPIDO.md.',
      503,
    );
  }
  try {
    return neon(connection, { fetchOptions: { signal: AbortSignal.timeout(15000) } });
  } catch {
    throw new AppError(
      'La conexión de la base de datos no tiene un formato válido. Revisa DATABASE_URL.',
      503,
    );
  }
}
