'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useActivities } from './activity-context';
import { Icon } from './icon';
import {
  CategoryIcon,
  DeleteDialog,
  EmptyState,
  LoadingState,
  NewActivityButton,
  PageHeading,
  StatusBadge,
} from './ui';
import { CATEGORIES, STATUSES } from '@/lib/constants';
import { formatDate, isOverdue } from '@/lib/dates';

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
    <>
      <PageHeading
        eyebrow="CLARIDAD EN CADA PASO"
        title="Mis actividades"
        subtitle="Encuentra, consulta y actualiza las actividades del equipo."
        action={<NewActivityButton />}
      />
      <section className="card activities-card">
        <div className="activities-toolbar">
          <div className="activity-tabs" role="group" aria-label="Filtrar por estado">
            {['', ...STATUSES].map((s) => (
              <button
                key={s}
                className={status === s ? 'selected-tab' : ''}
                aria-pressed={status === s}
                onClick={() => change(setStatus, s)}
              >
                {s === ''
                  ? 'Todas'
                  : s === 'Pendiente'
                    ? 'Pendientes'
                    : s === 'Realizada'
                      ? 'Realizadas'
                      : s === 'Cancelada'
                        ? 'Canceladas'
                        : s}
                <span>
                  {s ? activities.filter((a) => a.estado === s).length : activities.length}
                </span>
              </button>
            ))}
          </div>
          <button
            className="icon-button refresh-button"
            aria-label="Actualizar actividades"
            disabled={loading}
            onClick={refresh}
          >
            <Icon name="refresh" size={18} className={loading ? 'spin' : ''} />
          </button>
        </div>
        <div className="filters-grid">
          <label className="field-label">
            Buscar actividad
            <div className="input-icon">
              <Icon name="search" size={17} />
              <input
                type="search"
                placeholder="Título o responsable…"
                value={search}
                onChange={(e) => change(setSearch, e.target.value)}
                data-testid="search-activities"
              />
            </div>
          </label>
          <label className="field-label">
            Categoría
            <select value={category} onChange={(e) => change(setCategory, e.target.value)}>
              <option value="">Todas las categorías</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => change(setFrom, e.target.value)}
              aria-invalid={Boolean(invalidRange)}
            />
          </label>
          <label className="field-label">
            Hasta
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
                    <th>Actividad</th>
                    <th>Responsable</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th className="actions-cell">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((a) => (
                    <tr key={a.id}>
                      <td data-label="Actividad">
                        <div className="table-activity">
                          <CategoryIcon category={a.categoria} size={19} />
                          <div>
                            <Link href={`/actividades/${a.id}`} className="activity-title">
                              {a.titulo}
                            </Link>
                            <small>{a.categoria}</small>
                          </div>
                        </div>
                      </td>
                      <td data-label="Responsable">
                        <span className="responsible-name">{a.responsable}</span>
                      </td>
                      <td data-label="Fecha">
                        <div className="date-cell">
                          {formatDate(a.fecha)}
                          {isOverdue(a) && <small className="overdue-label">Fecha vencida</small>}
                        </div>
                      </td>
                      <td data-label="Estado">
                        <StatusBadge status={a.estado} />
                      </td>
                      <td data-label="Acciones">
                        <div className="row-actions">
                          <Link
                            href={`/actividades/${a.id}`}
                            className="icon-button"
                            aria-label={`Ver ${a.titulo}`}
                            title="Ver detalle"
                          >
                            <Icon name="eye" size={18} />
                          </Link>
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
    </>
  );
}
