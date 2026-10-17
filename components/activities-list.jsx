'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useActivities } from './activity-context';
import { Icon } from './icon';
import { DeleteDialog, EmptyState, LoadingState, NewActivityButton, StatusBadge } from './ui';
import { CATEGORIES, STATUSES } from '@/lib/constants';
import { formatDate, isOverdue } from '@/lib/dates';
import styles from './activities-list.module.css';

// Iconos sólidos propios del listado; el resto de la aplicación conserva sus iconos.
function ActivityMark({ category }) {
  const index = Math.max(0, CATEGORIES.indexOf(category));
  const symbols = [
    <>
      <path d="m2 9 4-4 4 1-4 6-4-1Zm20 0-4-4-4 1 4 6 4-1Z" />
      <path d="m8 7 4-2 4 2 3 6-5 6-3 1-6-6 2-3 4 4 2-2-4-3Z" />
    </>,
    <>
      <circle cx="12" cy="7" r="3.2" />
      <circle cx="4.5" cy="9" r="2.4" />
      <circle cx="19.5" cy="9" r="2.4" />
      <path d="M6.5 20v-4a5.5 5.5 0 0 1 11 0v4ZM1 18v-3a3.5 3.5 0 0 1 5-3.2A7 7 0 0 0 5 16v2Zm22 0h-4v-2a7 7 0 0 0-1-4.2A3.5 3.5 0 0 1 23 15Z" />
    </>,
    <>
      <path d="M2 5h12v12H2Zm13 4h4l3 4v4h-7Z" />
      <circle cx="6.5" cy="18.5" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="M16 10.5v3h4l-2-3Z" fill="white" />
    </>,
    <>
      <path d="M6 2h9l4 4v16H5V3a1 1 0 0 1 1-1Z" />
      <path d="M15 2v5h4M8 11h8M8 15h8M8 18h5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </>,
    <>
      <path d="M8 3h8v4h-2V5h-4v2H8Z" />
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M2 12c6 3 14 3 20 0M12 12v5" fill="none" stroke="white" strokeWidth="1.4" />
    </>,
  ];
  return (
    <span className={`category-icon category-${index}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {symbols[index]}
      </svg>
    </span>
  );
}

const PAGE_SIZE = 8;
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function ActivitiesList() {
  const { activities, loading, error, lastSync, refresh } = useActivities();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState('date');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const invalidRange = from && to && from > to;
  const filtered = useMemo(
    () =>
      activities
        .filter(
          (a) =>
            (!search.trim() ||
              normalize(`${a.titulo} ${a.descripcion} ${a.responsable}`).includes(
                normalize(search.trim()),
              )) &&
            (!category || a.categoria === category) &&
            (!status || a.estado === status) &&
            (!from || a.fecha >= from) &&
            (!to || a.fecha <= to),
        )
        .sort((a, b) =>
          sort === 'recent'
            ? b.id - a.id
            : sort === 'title'
              ? a.titulo.localeCompare(b.titulo, 'es')
              : a.fecha.localeCompare(b.fecha) || b.id - a.id,
        ),
    [activities, search, category, status, from, to, sort],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);
  const hasFilters = search || category || status || from || to;
  function change(setter, value) {
    setter(value);
    setPage(1);
  }
  function clear() {
    setSearch('');
    setCategory('');
    setStatus('');
    setFrom('');
    setTo('');
    setPage(1);
  }

  return (
    <div className={styles.root}>
      <section className="card activities-card" aria-labelledby="activities-title">
        <header className={styles.heading}>
          <div className={styles.headingCopy}>
            <span className={styles.headingIcon}>
              <Icon name="list" size={30} strokeWidth="2.6" />
            </span>
            <div>
              <h1 id="activities-title">Mis actividades</h1>
              <p>Consulta, edita o elimina tus actividades registradas.</p>
            </div>
          </div>
          <NewActivityButton />
        </header>
        <div className="filters-grid">
          <label className="field-label">
            Buscar
            <div className="input-icon">
              <Icon name="search" size={17} />
              <input
                type="search"
                placeholder="Buscar actividad…"
                value={search}
                onChange={(e) => change(setSearch, e.target.value)}
                data-testid="search-activities"
              />
            </div>
          </label>
          <label className="field-label">
            Tipo de actividad
            <select value={category} onChange={(e) => change(setCategory, e.target.value)}>
              <option value="">Todos</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Estado
            <select value={status} onChange={(e) => change(setStatus, e.target.value)}>
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Fecha desde
            <input
              type="date"
              value={from}
              onChange={(e) => change(setFrom, e.target.value)}
              aria-invalid={Boolean(invalidRange)}
            />
          </label>
          <label className="field-label">
            Fecha hasta
            <input
              type="date"
              value={to}
              onChange={(e) => change(setTo, e.target.value)}
              aria-invalid={Boolean(invalidRange)}
            />
          </label>
        </div>
        {invalidRange && (
          <p className="range-error" role="alert">
            La fecha “Desde” debe ser anterior o igual a “Hasta”.
          </p>
        )}
        <div className="results-toolbar">
          <span>
            {loading
              ? 'Consultando actividades…'
              : `${filtered.length} actividad${filtered.length === 1 ? '' : 'es'} ${hasFilters ? 'encontrada' : 'registrada'}${filtered.length === 1 ? '' : 's'}`}
            {hasFilters && (
              <button className="text-link clear-filters" onClick={clear}>
                Limpiar filtros <Icon name="close" size={13} />
              </button>
            )}
          </span>
          <div className={styles.tools}>
            <label>
              Ordenar por{' '}
              <select
                className="sort-select"
                aria-label="Ordenar actividades"
                value={sort}
                onChange={(e) => change(setSort, e.target.value)}
              >
                <option value="date">Fecha de actividad</option>
                <option value="recent">Más recientes</option>
                <option value="title">Título A–Z</option>
              </select>
            </label>
            <button
              className="icon-button refresh-button"
              aria-label="Actualizar actividades"
              title="Actualizar actividades"
              disabled={loading}
              onClick={refresh}
            >
              <Icon name="refresh" size={17} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
        {loading ? (
          <LoadingState />
        ) : error && !lastSync ? (
          <div className="data-unavailable">
            Las actividades aparecerán al restablecer la conexión.
          </div>
        ) : visible.length ? (
          <>
            <div className="table-wrapper">
              <table className="activities-table">
                <thead>
                  <tr>
                    <th scope="col">Título</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Responsable</th>
                    <th scope="col">Estado</th>
                    <th scope="col" className="actions-cell">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a) => (
                    <tr key={a.id}>
                      <td data-label="Título">
                        <div className="table-activity">
                          <ActivityMark category={a.categoria} />
                          <Link href={`/actividades/${a.id}`} className="activity-title">
                            {a.titulo}
                          </Link>
                        </div>
                      </td>
                      <td data-label="Tipo">
                        <span className={styles.categoryName}>{a.categoria}</span>
                      </td>
                      <td data-label="Fecha">
                        <div className="date-cell">
                          {formatDate(a.fecha)}
                          {isOverdue(a) && <small className="overdue-label">Fecha vencida</small>}
                        </div>
                      </td>
                      <td data-label="Responsable">
                        <span className="responsible-name">{a.responsable}</span>
                      </td>
                      <td data-label="Estado">
                        <StatusBadge status={a.estado} />
                      </td>
                      <td data-label="Acciones">
                        <div className="row-actions">
                          <Link
                            href={`/actividades/${a.id}/editar`}
                            className="icon-button edit-action"
                            aria-label={`Editar ${a.titulo}`}
                            title="Editar"
                          >
                            <Icon name="edit" size={17} />
                          </Link>
                          <button
                            className="icon-button delete-action"
                            aria-label={`Eliminar ${a.titulo}`}
                            title="Eliminar"
                            onClick={() => setDeleting(a)}
                          >
                            <Icon name="trash" size={17} />
                          </button>
                          <Link
                            href={`/actividades/${a.id}`}
                            className="icon-button"
                            aria-label={`Ver ${a.titulo}`}
                            title="Ver detalle"
                          >
                            <Icon name="eye" size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                Mostrando{' '}
                <strong>
                  {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}
                </strong>{' '}
                de {filtered.length} actividades
              </span>
              <div>
                <button
                  className="icon-button"
                  aria-label="Página anterior"
                  disabled={safePage === 1}
                  onClick={() => setPage(safePage - 1)}
                >
                  <Icon name="arrow" size={16} className="rotate-180" />
                </button>
                <span className="current-page" aria-live="polite">
                  {safePage}
                </span>
                <span className="page-total">de {totalPages}</span>
                <button
                  className="icon-button"
                  aria-label="Página siguiente"
                  disabled={safePage === totalPages}
                  onClick={() => setPage(safePage + 1)}
                >
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title={hasFilters ? 'No encontramos coincidencias' : undefined}
            text={
              hasFilters
                ? 'Prueba con otro nombre, categoría, estado o rango de fechas.'
                : undefined
            }
            action={!hasFilters}
          />
        )}
      </section>
      <p className="page-footnote">
        <Icon name="info" size={14} />
        “Mis actividades” muestra el registro compartido del equipo en esta versión del proyecto.
      </p>
      {deleting && <DeleteDialog activity={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}
