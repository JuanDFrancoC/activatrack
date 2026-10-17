import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDays, dateKey, formatDate, isOverdue, localDate } from '../lib/dates.js';

test('el calendario empieza en lunes e incluye 42 días consecutivos', () => {
  const days = calendarDays(new Date(2026, 9, 1, 12));
  assert.equal(days.length, 42);
  assert.equal(days[0].getDay(), 1);
  assert.equal(dateKey(days[0]), '2026-09-28');
  assert.equal(dateKey(days[41]), '2026-11-08');
  assert.equal(days.filter((day) => day.getMonth() === 9).length, 31);
});
test('una fecha DATE se muestra sin retroceder un día', () => {
  assert.equal(dateKey(localDate('2026-10-20')), '2026-10-20');
  assert.match(formatDate('2026-10-20'), /20/);
});
test('solo las pendientes y en curso con fecha anterior están vencidas', () => {
  for (const estado of ['Pendiente', 'En curso']) {
    assert.equal(isOverdue({ estado, fecha: '2026-10-19' }, '2026-10-20'), true);
    assert.equal(isOverdue({ estado, fecha: '2026-10-20' }, '2026-10-20'), false);
  }
  for (const estado of ['Realizada', 'Cancelada'])
    assert.equal(isOverdue({ estado, fecha: '2026-10-19' }, '2026-10-20'), false);
});
