import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createActivitiesRepository } from '../lib/repository.js';
import { createApiHandlers } from '../lib/api-handlers.js';
import { AppError } from '../lib/validation.js';

let database;
let repository;
let handlers;
const baseUrl = 'http://localhost:3000/api/actividades';
const sample = {
  titulo: 'Feria de prueba',
  descripcion: 'Orientar candidatos.',
  responsable: 'Juan David',
  fecha: '2026-10-20',
  categoria: 'Feria de empleo',
  estado: 'Pendiente',
};
const context = (id) => ({ params: Promise.resolve({ id: String(id) }) });
function request(method = 'GET', body, headers = {}) {
  return new Request(baseUrl, {
    method,
    ...(body !== undefined && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
    headers: { 'content-type': 'application/json', ...headers },
  });
}

before(async () => {
  database = new PGlite();
  await database.exec(await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8'));
  // Ejecuta las mismas plantillas del repositorio contra PostgreSQL real embebido.
  const sql = async (strings, ...values) => {
    const text = strings.reduce(
      (result, part, i) => result + part + (i < values.length ? `$${i + 1}` : ''),
      '',
    );
    return (await database.query(text, values)).rows;
  };
  repository = createActivitiesRepository(sql);
  handlers = createApiHandlers(() => repository);
});
after(async () => {
  await database?.close();
});

test('CRUD completo: crea, consulta, actualiza y elimina registros persistidos', async () => {
  const created = await handlers.create(request('POST', sample));
  assert.equal(created.status, 201);
  const original = (await created.json()).data;
  assert.equal(original.titulo, sample.titulo);
  assert.equal(original.fecha, sample.fecha);
  assert.ok(original.id > 0);
  assert.ok(original.creado_en);
  const stored = await database.query('SELECT titulo FROM actividades WHERE id = $1', [
    original.id,
  ]);
  assert.equal(stored.rows[0].titulo, sample.titulo);

  const detail = await handlers.get(request(), context(original.id));
  assert.equal(detail.status, 200);
  assert.equal((await detail.json()).data.responsable, sample.responsable);

  const edited = { ...sample, titulo: 'Feria actualizada', estado: 'Realizada' };
  const updated = await handlers.update(request('PUT', edited), context(original.id));
  assert.equal(updated.status, 200);
  const changed = (await updated.json()).data;
  assert.equal(changed.estado, 'Realizada');
  assert.equal(changed.creado_en, original.creado_en);
  const fresh = await handlers.get(request(), context(original.id));
  assert.equal((await fresh.json()).data.titulo, edited.titulo);
  const list = await handlers.list();
  assert.ok((await list.json()).data.some((a) => a.id === original.id));
  assert.equal(list.headers.get('cache-control'), 'no-store');

  const deleted = await handlers.remove(request('DELETE'), context(original.id));
  assert.equal(deleted.status, 200);
  assert.equal(
    (await database.query('SELECT count(*) AS count FROM actividades WHERE id=$1', [original.id]))
      .rows[0].count,
    0,
  );
  assert.equal((await handlers.get(request(), context(original.id))).status, 404);
});
test('las entradas con sintaxis SQL se guardan como texto y no ejecutan SQL', async () => {
  const title = "Feria'); DROP TABLE actividades; --";
  const response = await handlers.create(request('POST', { ...sample, titulo: title }));
  assert.equal(response.status, 201);
  const record = (await response.json()).data;
  assert.equal((await repository.get(record.id)).titulo, title);
  assert.ok(Array.isArray(await repository.list()));
});
test('la base rechaza estados fuera del catálogo, incluso saltándose la API', async () => {
  await assert.rejects(
    () => repository.create({ ...sample, estado: 'Inexistente' }),
    (e) => e.code === '23514',
  );
});
test('no modifica registros cuando la validación devuelve 422', async () => {
  const beforeCount = (await repository.list()).length;
  const response = await handlers.create(request('POST', { ...sample, fecha: '2026-02-30' }));
  assert.equal(response.status, 422);
  assert.ok((await response.json()).fields.fecha);
  assert.equal((await repository.list()).length, beforeCount);
});
test('rechaza JSON roto, tipo de contenido equivocado y cuerpos grandes', async () => {
  assert.equal((await handlers.create(request('POST', '{mal'))).status, 400);
  assert.equal(
    (await handlers.create(request('POST', sample, { 'content-type': 'text/plain' }))).status,
    415,
  );
  assert.equal((await handlers.create(request('POST', 'x'.repeat(20000)))).status, 413);
});
test('rechaza operaciones de cambio desde otros sitios, pero permite herramientas sin Origin', async () => {
  assert.equal(
    (await handlers.create(request('POST', sample, { origin: 'https://otro.example' }))).status,
    403,
  );
  assert.equal(
    (await handlers.remove(request('DELETE', undefined, { origin: 'null' }), context(1))).status,
    403,
  );
  assert.equal(
    (await handlers.create(request('POST', sample, { origin: 'http://localhost:3000' }))).status,
    201,
  );
  assert.equal((await handlers.create(request('POST', sample))).status, 201);
});
test('retorna 400 para identificadores inválidos y 404 para registros inexistentes', async () => {
  assert.equal((await handlers.get(request(), context('1 OR 1=1'))).status, 400);
  assert.equal((await handlers.get(request(), context(999999))).status, 404);
  assert.equal((await handlers.update(request('PUT', sample), context(999999))).status, 404);
  assert.equal((await handlers.remove(request('DELETE'), context(999999))).status, 404);
});
test('salud de conexión y errores de configuración con mensajes sin secretos', async () => {
  const healthy = await handlers.health();
  assert.equal(healthy.status, 200);
  assert.equal((await healthy.json()).database, 'connected');
  const missing = createApiHandlers(() => {
    throw new AppError('Falta configurar DATABASE_URL.', 503);
  });
  const error = await missing.list();
  assert.equal(error.status, 503);
  assert.match((await error.json()).error, /DATABASE_URL/);
});
test('los ejemplos se pueden ejecutar dos veces sin duplicarse ni borrar datos', async () => {
  const seed = await readFile(new URL('../database/seed.sql', import.meta.url), 'utf8');
  await database.exec(seed);
  const count = (await repository.list()).length;
  await database.exec(seed);
  assert.equal((await repository.list()).length, count);
});
