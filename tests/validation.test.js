import test from 'node:test';
import assert from 'node:assert/strict';
import { validateActivity, validateId, validDate } from '../lib/validation.js';

const sample = {
  titulo: 'Feria',
  descripcion: 'Orientación',
  responsable: 'Juan',
  fecha: '2026-10-20',
  categoria: 'Feria de empleo',
  estado: 'Pendiente',
};

test('normaliza espacios y descarta campos que el cliente no puede cambiar', () => {
  const actual = validateActivity({ ...sample, titulo: '  Feria  ', id: 9, creado_en: 'ayer' });
  assert.deepEqual(actual, sample);
  assert.equal(validateActivity({ ...sample, estado: undefined }).estado, 'Pendiente');
});
test('no acepta un formulario vacío ni textos solo con espacios', () => {
  assert.throws(
    () => validateActivity({}),
    (e) => e.status === 422 && Object.keys(e.fields).length === 5,
  );
  for (const name of ['titulo', 'descripcion', 'responsable']) {
    assert.throws(
      () => validateActivity({ ...sample, [name]: '  ' }),
      (e) => Boolean(e.fields[name]),
    );
  }
});
test('valida longitudes, caracteres nulos y tipos en el servidor', () => {
  for (const [name, limit] of [
    ['titulo', 150],
    ['descripcion', 500],
    ['responsable', 100],
  ]) {
    assert.equal(validateActivity({ ...sample, [name]: 'a'.repeat(limit) })[name].length, limit);
    assert.throws(
      () => validateActivity({ ...sample, [name]: 'a'.repeat(limit + 1) }),
      (e) => Boolean(e.fields[name]),
    );
    assert.throws(
      () => validateActivity({ ...sample, [name]: 5 }),
      (e) => Boolean(e.fields[name]),
    );
    assert.throws(
      () => validateActivity({ ...sample, [name]: 'a\u0000b' }),
      (e) => Boolean(e.fields[name]),
    );
  }
});
test('rechaza categorías y estados fuera de los CHECK de la tabla', () => {
  assert.throws(
    () => validateActivity({ ...sample, categoria: 'Otra' }),
    (e) => Boolean(e.fields.categoria),
  );
  assert.throws(
    () => validateActivity({ ...sample, estado: 'Finalizada' }),
    (e) => Boolean(e.fields.estado),
  );
});
test('valida fechas de calendario reales y años bisiestos', () => {
  for (const date of [
    '2026-02-30',
    '2026-13-01',
    '2026-1-01',
    '1900-02-29',
    '0001-01-01',
    '2101-01-01',
    'invalid',
    null,
  ])
    assert.equal(validDate(date), false);
  for (const date of ['2024-02-29', '2000-02-29', '2026-10-20', '1900-01-01', '2100-12-31'])
    assert.equal(validDate(date), true);
});
test('el ID solo acepta enteros positivos dentro del rango de PostgreSQL INTEGER', () => {
  assert.equal(validateId('12'), 12);
  for (const id of ['0', '-1', '1.5', '1abc', '01', '1 OR 1=1', '2147483648', 'Infinity', ''])
    assert.throws(() => validateId(id));
});
test('rechaza cuerpos nulos y arreglos', () => {
  for (const body of [null, [], 'texto', 4]) assert.throws(() => validateActivity(body));
});
