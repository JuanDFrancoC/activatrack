'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useActivity } from './use-activity';
import { BackLink, CategoryIcon, DeleteDialog, LoadingState, StatusBadge } from './ui';
import { Icon } from './icon';
import { formatDate, isOverdue } from '@/lib/dates';

export function ActivityDetail({ id }) {
  const { activity, loading, error, status, retry } = useActivity(id);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  if (loading)
    return (
      <section className="card">
        <LoadingState />
      </section>
    );
  if (error || !activity)
    return (
      <>
        <BackLink />
        <section className="card empty-state" role="alert">
          <Icon name="alert" size={32} />
          <h1>
            {status === 404
              ? 'Esta actividad ya no está disponible'
              : 'No pudimos consultar la actividad'}
          </h1>
          <p>{error}</p>
          <button className="button button-primary" onClick={retry}>
            Reintentar
          </button>
        </section>
      </>
    );
  const created = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(activity.creado_en));
  return (
    <>
      <BackLink />
      <section className="detail-heading">
        <div className="detail-title">
          <CategoryIcon category={activity.categoria} size={29} />
          <div>
            <div className="eyebrow">DETALLE DE LA ACTIVIDAD</div>
            <h1>{activity.titulo}</h1>
            <StatusBadge status={activity.estado} />
          </div>
        </div>
        <div className="detail-buttons">
          <Link className="button button-outline" href={`/actividades/${id}/editar`}>
            <Icon name="edit" size={17} />
            Editar actividad
          </Link>
          <button className="button button-danger-outline" onClick={() => setDeleting(true)}>
            <Icon name="trash" size={17} />
            Eliminar
          </button>
        </div>
      </section>
      <div className="detail-layout">
        <section className="card detail-main">
          <div className="section-heading">
            <h2>Información general</h2>
            <span className="record-code">ACT-{String(activity.id).padStart(4, '0')}</span>
          </div>
          <div className="detail-data-grid">
            <DetailField icon="briefcase" label="Categoría">
              {activity.categoria}
            </DetailField>
            <DetailField icon="calendar" label="Fecha de la actividad">
              {formatDate(activity.fecha, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {isOverdue(activity) && (
                <small className="overdue-label">Fecha vencida · actividad sin finalizar</small>
              )}
            </DetailField>
            <DetailField icon="user" label="Responsable">
              {activity.responsable}
            </DetailField>
            <DetailField icon="activity" label="Estado actual">
              <StatusBadge status={activity.estado} />
            </DetailField>
          </div>
          <div className="description-section">
            <h3>
              <Icon name="list" size={18} />
              Descripción
            </h3>
            <p>{activity.descripcion}</p>
          </div>
        </section>
        <aside className="detail-aside">
          <section className="card">
            <div className="section-heading">
              <h2>Datos del registro</h2>
            </div>
            <div className="record-metadata">
              <span>
                Identificador<strong>#{activity.id}</strong>
              </span>
              <span>
                Fecha de registro<strong>{created}</strong>
              </span>
              <span>
                Zona horaria del registro<strong>Colombia (UTC−5)</strong>
              </span>
            </div>
          </section>
          <section className="card quick-actions">
            <div className="section-heading">
              <h2>Acciones rápidas</h2>
            </div>
            <Link href={`/actividades/${id}/editar`}>
              <Icon name="edit" size={18} />
              Editar información
              <Icon name="arrow" size={15} />
            </Link>
            <Link href={`/calendario?fecha=${activity.fecha}`}>
              <Icon name="calendar" size={18} />
              Ver en calendario
              <Icon name="arrow" size={15} />
            </Link>
            <Link href="/actividades">
              <Icon name="list" size={18} />
              Ver todas las actividades
              <Icon name="arrow" size={15} />
            </Link>
          </section>
        </aside>
      </div>
      {deleting && (
        <DeleteDialog
          activity={activity}
          onClose={() => setDeleting(false)}
          onDeleted={() => router.push('/actividades')}
        />
      )}
    </>
  );
}
function DetailField({ icon, label, children }) {
  return (
    <div className="detail-field">
      <span className="detail-field-icon">
        <Icon name={icon} size={20} />
      </span>
      <div>
        <span>{label}</span>
        <div>{children}</div>
      </div>
    </div>
  );
}
