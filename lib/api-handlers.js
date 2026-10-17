import { AppError, validateActivity, validateId } from './validation.js';

function json(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function readBody(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new AppError('Envía los datos como application/json.', 415);
  }
  const declaredSize = Number(request.headers.get('content-length') || 0);
  if (declaredSize > 16384) throw new AppError('El contenido excede el tamaño permitido.', 413);
  // Se limita el cuerpo durante la lectura, incluso sin Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new AppError('El cuerpo JSON está vacío.');
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) {
      await reader.cancel();
      throw new AppError('El contenido excede el tamaño permitido.', 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new AppError('El JSON enviado no es válido.');
  }
}

function protectMutation(request) {
  // Las llamadas desde herramientas como JMeter no necesitan cabecera Origin.
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    throw new AppError('No se permiten cambios desde otro sitio.', 403);
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) throw new Error();
    } catch {
      throw new AppError('No se permiten cambios desde otro sitio.', 403);
    }
  }
}

function failure(error) {
  if (error instanceof AppError)
    return json(
      { error: error.message, ...(error.fields && { fields: error.fields }) },
      error.status,
    );
  // Solo códigos de diagnóstico: no se imprimen conexiones, datos ni contraseñas.
  const code = error?.code || error?.cause?.code || error?.name || 'UNKNOWN';
  console.error('[ActivaTrack] Error de operación:', code);
  if (code === '42P01')
    return json(
      {
        error:
          'No se encontró la tabla actividades. Revisa la base seleccionada y database/schema.sql.',
      },
      503,
    );
  if (code === '23514' || code === '22001' || code === '22007')
    return json(
      { error: 'Los datos no cumplen las reglas de la base. Revisa el formulario.' },
      422,
    );
  return json(
    {
      error:
        'No fue posible completar la operación en la base de datos. Revisa la conexión e inténtalo nuevamente.',
    },
    503,
  );
}

export function createApiHandlers(getRepository) {
  const wrap =
    (handler) =>
    async (...args) => {
      try {
        return await handler(...args);
      } catch (error) {
        return failure(error);
      }
    };
  const getId = async (context) => validateId((await context.params).id);
  const requireActivity = (activity) => {
    if (!activity) throw new AppError('La actividad ya no existe o fue eliminada.', 404);
    return activity;
  };
  return {
    list: wrap(async () => json({ data: await getRepository().list() })),
    create: wrap(async (request) => {
      protectMutation(request);
      const activity = validateActivity(await readBody(request));
      return json({ data: await getRepository().create(activity) }, 201);
    }),
    get: wrap(async (_request, context) => {
      const id = await getId(context);
      return json({ data: requireActivity(await getRepository().get(id)) });
    }),
    update: wrap(async (request, context) => {
      protectMutation(request);
      const id = await getId(context);
      const activity = validateActivity(await readBody(request));
      return json({ data: requireActivity(await getRepository().update(id, activity)) });
    }),
    remove: wrap(async (request, context) => {
      protectMutation(request);
      const id = await getId(context);
      requireActivity(await getRepository().remove(id));
      return json({ message: 'Actividad eliminada.', id });
    }),
    health: wrap(async () => {
      await getRepository().health();
      return json({ status: 'ok', database: 'connected' });
    }),
  };
}
