'use client';
import { Icon } from './icon';
import { calendarDays, dateKey, todayKey } from '@/lib/dates';
import { STATUS_CLASSES } from '@/lib/constants';

export function CalendarGrid({ month, setMonth, selected, onSelect, activities, compact = false }) {
  const today = todayKey();
  const heading = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(
    month,
  );
  const grouped = new Map();
  for (const a of activities) grouped.set(a.fecha, [...(grouped.get(a.fecha) || []), a]);
  function move(direction) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + direction, 1, 12));
  }
  return (
    <div className={compact ? 'calendar-widget' : 'calendar-full'}>
      <div className="calendar-toolbar">
        <h3>{heading}</h3>
        <div className="calendar-controls">
          {!compact && (
            <button
              className="button button-outline button-small"
              onClick={() => {
                const now = new Date();
                setMonth(now);
                onSelect(today);
              }}
            >
              Hoy
            </button>
          )}
          <button className="icon-button" aria-label="Mes anterior" onClick={() => move(-1)}>
            <Icon name="arrow" size={16} className="rotate-180" />
          </button>
          <button className="icon-button" aria-label="Mes siguiente" onClick={() => move(1)}>
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {(compact
          ? ['L', 'M', 'M', 'J', 'V', 'S', 'D']
          : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        ).map((day, i) => (
          <span key={i}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid" aria-label={heading}>
        {calendarDays(month).map((day) => {
          const key = dateKey(day);
          const records = grouped.get(key) || [];
          const label = new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' }).format(day);
          return (
            <button
              key={key}
              className={`calendar-day ${day.getMonth() !== month.getMonth() ? 'outside-month' : ''} ${today === key ? 'is-today' : ''} ${selected === key ? 'selected-day' : ''}`}
              onClick={() => onSelect(key)}
              aria-pressed={selected === key}
              aria-current={today === key ? 'date' : undefined}
              aria-label={`${label}, ${records.length} actividad${records.length === 1 ? '' : 'es'}`}
            >
              <span className="day-number">{day.getDate()}</span>
              {compact ? (
                <span className="calendar-dots">
                  {records.slice(0, 3).map((a) => (
                    <i key={a.id} className={STATUS_CLASSES[a.estado]} />
                  ))}
                </span>
              ) : (
                <span className="calendar-events">
                  {records.slice(0, 2).map((a) => (
                    <span className={`calendar-event ${STATUS_CLASSES[a.estado]}`} key={a.id}>
                      {a.titulo}
                    </span>
                  ))}
                  {records.length > 2 && (
                    <span className="calendar-more">+{records.length - 2} más</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
