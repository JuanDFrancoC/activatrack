// Una fecha de actividad es DATE, sin zona horaria. Se interpreta al mediodía
// para que no aparezca como el día anterior en Colombia.
export function localDate(value) {
  return new Date(`${String(value).slice(0, 10)}T12:00:00`);
}
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function todayKey() {
  return dateKey(new Date());
}
export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('es-CO', options).format(localDate(value));
}
export function isOverdue(activity, today = todayKey()) {
  return activity.fecha < today && ['Pendiente', 'En curso'].includes(activity.estado);
}
export function calendarDays(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(start.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}
