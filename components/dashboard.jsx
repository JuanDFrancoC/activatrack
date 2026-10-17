'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useActivities } from './activity-context';
import { Icon } from './icon';
import { CategoryIcon, EmptyState, LoadingState, NewActivityButton, StatusBadge } from './ui';
import { CalendarGrid } from './calendar-grid';
import { CATEGORIES } from '@/lib/constants';
import { formatDate, todayKey, isOverdue } from '@/lib/dates';

export function Dashboard() {
  const { activities, loading, error, lastSync, refresh } = useActivities();
  // Se calcula al montar para respetar la fecha del navegador y evitar una
  // diferencia entre la zona UTC de Vercel y la zona horaria de Colombia.
  const [month, setMonth] = useState(null);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    setMonth(new Date());
    setSelected(todayKey());
  }, []);

  const today = selected ? todayKey() : '';
  const completed = activities.filter((a) => a.estado === 'Realizada').length;
  const active = activities.filter((a) => a.estado !== 'Cancelada').length;
  const percentage = active ? Math.round((completed / active) * 100) : 0;
  const lateCount = activities.filter((a) => isOverdue(a, today)).length;
  const upcoming = activities
    .filter((a) => a.fecha >= today && ['Pendiente', 'En curso'].includes(a.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id)
    .slice(0, 5);
  const dayActivities = activities.filter((a) => a.fecha === selected);
  const showData = !loading && (!error || lastSync);
  const isToday = selected === today;
  const stats = [
    { label: 'Actividades totales', number: activities.length, icon: 'calendar', color: 'blue' },
    {
      label: 'Pendientes',
      number: activities.filter((a) => a.estado === 'Pendiente').length,
      icon: 'clock',
      color: 'amber',
    },
    {
      label: 'En curso',
      number: activities.filter((a) => a.estado === 'En curso').length,
      icon: 'circleCheck',
      color: 'green',
    },
    { label: 'Realizadas', number: completed, icon: 'circleCheck', color: 'slate' },
  ];

  return (
    <div className="dashboard-reference">
      <div className="dashboard-reference-grid">
        <div className="dashboard-reference-main">
          <section className="card dashboard-welcome" aria-labelledby="dashboard-heading">
            <div className="dashboard-welcome-copy">
              <h1 id="dashboard-heading">Hola, equipo</h1>
              <p>
                Un buen día para avanzar. Consulta las actividades programadas, registra nuevas
                actividades y haz seguimiento al trabajo.
              </p>
            </div>
            <WelcomeCalendar />
          </section>

          <section className="dashboard-reference-stats" aria-label="Resumen de actividades">
            {stats.map((stat) => (
              <div className={`dashboard-stat dashboard-stat-${stat.color}`} key={stat.label}>
                <span className="dashboard-stat-symbol">
                  <Icon name={stat.icon} size={23} />
                </span>
                <div>
                  <strong>{showData ? stat.number : '—'}</strong>
                  <h2>{stat.label}</h2>
                </div>
              </div>
            ))}
          </section>

          <section className="card dashboard-reference-upcoming">
            <div className="section-heading">
              <h2>Próximas actividades</h2>
              <Link href="/actividades" className="text-link">
                Ver todas <Icon name="arrow" size={15} />
              </Link>
            </div>
            {loading ? (
              <LoadingState />
            ) : error && !lastSync ? (
              <div className="data-unavailable">
                Las actividades aparecerán al restablecer la conexión.
              </div>
            ) : upcoming.length ? (
              <div className="dashboard-reference-list">
                {upcoming.map((activity) => (
                  <Link
                    href={`/actividades/${activity.id}`}
                    className="dashboard-reference-row"
                    key={activity.id}
                  >
                    <CategoryIcon category={activity.categoria} size={21} />
                    <div className="dashboard-row-copy">
                      <h3>{activity.titulo}</h3>
                      <div className="dashboard-row-meta">
                        <span>
                          <Icon name="calendar" size={13} />
                          {formatDate(activity.fecha, {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span>
                          <Icon name="user" size={13} />
                          <span>{activity.responsable}</span>
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={activity.estado} />
                    <Icon name="arrow" size={16} className="dashboard-row-arrow" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Tu agenda está al día"
                text="No hay actividades próximas pendientes o en curso. Puedes registrar una nueva cuando la necesites."
                action={false}
              />
            )}
            <div className="dashboard-register-row">
              <NewActivityButton />
            </div>
            <div className="dashboard-sync-row">
              <span>
                <i className="small-dot" />
                {lastSync
                  ? 'Última consulta: ' +
                    lastSync.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                  : 'Esperando información del equipo'}
              </span>
              <button className="text-link" onClick={refresh} disabled={loading}>
                <Icon name="refresh" size={14} className={loading ? 'spin' : ''} />
                Actualizar
              </button>
            </div>
          </section>

          <details className="card dashboard-reference-summary">
            <summary>
              <span>
                <Icon name="chart" size={18} />
                Resumen del equipo
              </span>
              <span className="summary-indicator">
                Ver indicadores <Icon name="chevronDown" size={15} />
              </span>
            </summary>
            <div className="dashboard-summary-content">
              <div className="dashboard-category-summary">
                <h2>Actividades por categoría</h2>
                <div className="category-bars">
                  {CATEGORIES.map((category) => {
                    const count = activities.filter((a) => a.categoria === category).length;
                    return (
                      <div className="category-bar-row" key={category}>
                        <div>
                          <CategoryIcon category={category} size={15} />
                          <span>{category}</span>
                        </div>
                        <div className="bar-track">
                          <span
                            style={{
                              width: `${activities.length ? (count / activities.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <strong>{showData ? count : '—'}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
              <section className="progress-card">
                <span className="progress-caption">AVANCE DE ACTIVIDADES</span>
                <div className="progress-title">
                  <h3>Así vamos</h3>
                  <strong>{showData ? percentage + '%' : '—'}</strong>
                </div>
                <div className="completion-track">
                  <span style={{ width: `${percentage}%` }} />
                </div>
                <p>
                  {showData
                    ? `${completed} de ${active} actividades completadas`
                    : 'Esperando información del equipo'}
                </p>
                {showData && lateCount > 0 && (
                  <span className="overdue-note">
                    <Icon name="clock" size={13} />
                    {lateCount} con fecha vencida
                  </span>
                )}
                <small>El cálculo excluye las actividades canceladas.</small>
              </section>
            </div>
          </details>
        </div>

        <aside className="dashboard-reference-aside" aria-label="Calendario y agenda del día">
          <section className="card mini-calendar-card dashboard-reference-calendar">
            <div className="section-heading">
              <h2>Calendario</h2>
              <Link
                href="/calendario"
                className="icon-button"
                aria-label="Abrir calendario completo"
              >
                <Icon name="external" size={16} />
              </Link>
            </div>
            {month ? (
              <CalendarGrid
                month={month}
                setMonth={setMonth}
                selected={selected}
                onSelect={setSelected}
                activities={activities}
                compact
              />
            ) : (
              <LoadingState />
            )}
            <div className="calendar-legend">
              <span>
                <i />
                Con actividades
              </span>
              <span>
                <i />
                Hoy
              </span>
            </div>
          </section>

          <section className="card dashboard-reference-day">
            <div className="section-heading">
              <h2>{isToday ? 'Actividades de hoy' : 'Actividades del día'}</h2>
              <span>
                {selected
                  ? formatDate(selected, { weekday: 'long', day: 'numeric', month: 'long' })
                  : 'Consultando fecha…'}
              </span>
            </div>
            {loading ? (
              <LoadingState />
            ) : error && !lastSync ? (
              <p className="day-empty">Esperando la conexión.</p>
            ) : dayActivities.length ? (
              <div className="dashboard-day-list">
                {dayActivities.slice(0, 3).map((activity) => (
                  <Link
                    className="dashboard-day-row"
                    href={`/actividades/${activity.id}`}
                    key={activity.id}
                  >
                    <CategoryIcon category={activity.categoria} size={20} />
                    <div>
                      <h3>{activity.titulo}</h3>
                      <p>
                        <Icon name="user" size={12} />
                        <span>{activity.responsable}</span>
                      </p>
                      <StatusBadge status={activity.estado} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dashboard-day-empty">
                <span className="empty-icon">
                  <Icon name="calendar" size={26} />
                </span>
                <h3>Sin actividades para este día</h3>
                <p>Selecciona otra fecha en el calendario para consultar su programación.</p>
              </div>
            )}
            {dayActivities.length > 3 && (
              <Link href={`/calendario?fecha=${selected}`} className="text-link dashboard-more-day">
                Ver las {dayActivities.length} actividades <Icon name="arrow" size={14} />
              </Link>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function WelcomeCalendar() {
  return (
    <svg className="dashboard-welcome-art" viewBox="0 0 140 108" fill="none" aria-hidden="true">
      <path
        d="M11 91c0-10 8-18 17-18-3-15 9-26 22-22 4-17 30-21 40-5 14-6 30 7 25 22 11 0 18 7 18 17v8H11Z"
        fill="#e1efff"
      />
      <path d="M27 91c-2-12 11-22 22-16 3-10 20-13 27-3 8-5 23 2 22 15l9 6H27Z" fill="#d1e6ff" />
      <rect x="46" y="31" width="58" height="54" rx="6" fill="#096ce0" />
      <path d="M51 46h48v30a4 4 0 0 1-4 4H55a4 4 0 0 1-4-4V46Z" fill="#fff" />
      <rect x="57" y="21" width="7" height="19" rx="3.5" fill="#fff" />
      <rect x="87" y="21" width="7" height="19" rx="3.5" fill="#fff" />
      <path d="M61 24v12m30-12v12" stroke="#096ce0" strokeWidth="4" strokeLinecap="round" />
      <path
        d="m63 63 8 8 16-17"
        stroke="#52a2ef"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m113 35 5-5m-3 13h8m-17-17 2-7"
        stroke="#f0b83f"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
