'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useActivities } from './activity-context';
import { CalendarGrid } from './calendar-grid';
import { CategoryIcon, LoadingState, NewActivityButton, PageHeading, StatusBadge } from './ui';
import { Icon } from './icon';
import { formatDate, localDate, todayKey } from '@/lib/dates';
import { validDate } from '@/lib/validation';

export function CalendarView() {
  const { activities, loading, error, lastSync } = useActivities();
  const [month, setMonth] = useState(null);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    const date = new URLSearchParams(window.location.search).get('fecha');
    const initialDate = validDate(date) ? date : todayKey();
    setSelected(initialDate);
    setMonth(localDate(initialDate));
  }, []);
  const records = activities
    .filter((a) => a.fecha === selected)
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
  return (
    <>
      <PageHeading
        eyebrow="DALE ESPACIO A LO IMPORTANTE"
        title="Calendario de actividades"
        subtitle="Una vista de la programación para coordinar mejor cada día."
        action={<NewActivityButton />}
      />
      <div className="calendar-layout">
        <section className="card calendar-main">
          {month ? (
            <CalendarGrid
              month={month}
              setMonth={setMonth}
              selected={selected}
              onSelect={setSelected}
              activities={activities}
            />
          ) : (
            <LoadingState />
          )}
          <div className="full-calendar-legend">
            <span>
              <i className="pending" />
              Pendiente
            </span>
            <span>
              <i className="progress" />
              En curso
            </span>
            <span>
              <i className="done" />
              Realizada
            </span>
            <span>
              <i className="cancelled" />
              Cancelada
            </span>
          </div>
          {loading && <LoadingState />}
        </section>
        <aside className="card calendar-day-panel">
          <div className="section-heading">
            <div>
              <div className="eyebrow">AGENDA DEL DÍA</div>
              <h2>
                {selected ? formatDate(selected, { day: 'numeric', month: 'long' }) : 'Tu agenda'}
              </h2>
              <p>
                {selected
                  ? formatDate(selected, { weekday: 'long', year: 'numeric' })
                  : 'Selecciona un día'}
              </p>
            </div>
            <span className="count-pill">{loading ? '—' : records.length}</span>
          </div>
          {loading ? (
            <LoadingState />
          ) : error && !lastSync ? (
            <p className="day-empty">No pudimos consultar la programación.</p>
          ) : records.length ? (
            <div className="calendar-records">
              {records.map((a) => (
                <Link href={`/actividades/${a.id}`} className="calendar-record" key={a.id}>
                  <div>
                    <CategoryIcon category={a.categoria} size={18} />
                    <StatusBadge status={a.estado} />
                  </div>
                  <h3>{a.titulo}</h3>
                  <p>
                    <Icon name="user" size={14} />
                    {a.responsable}
                  </p>
                  <span className="text-link">
                    Ver detalle <Icon name="arrow" size={14} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="day-empty">
              <span className="empty-icon">
                <Icon name="calendar" size={28} />
              </span>
              <h3>Un día sin actividades</h3>
              <p>No hay registros para esta fecha.</p>
            </div>
          )}
          <div className="day-panel-footer">
            <NewActivityButton>Registrar actividad</NewActivityButton>
          </div>
        </aside>
      </div>
    </>
  );
}
