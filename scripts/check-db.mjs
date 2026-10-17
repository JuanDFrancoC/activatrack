import { getSql } from '../lib/db.js';
import { createActivitiesRepository } from '../lib/repository.js';

try {
  const repository = createActivitiesRepository(getSql());
  await repository.health();
  const activities = await repository.list();
  console.log(`Conexión correcta. Tabla actividades disponible: ${activities.length} registro(s).`);
} catch (error) {
  console.error(
    error.name === 'AppError'
      ? error.message
      : 'No se pudo consultar actividades. Revisa DATABASE_URL y la tabla en Neon.',
  );
  process.exitCode = 1;
}
