'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './icon';
import { useActivities } from './activity-context';
import { CATEGORY_ICONS, CATEGORIES, STATUS_CLASSES } from '@/lib/constants';

export function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${STATUS_CLASSES[status] || ''}`}>
      <i />
      {status}
    </span>
  );
}
export function CategoryIcon({ category, size = 20 }) {
  return (
    <span className={`category-icon category-${Math.max(0, CATEGORIES.indexOf(category))}`}>
      <Icon name={CATEGORY_ICONS[category]} size={size} />
    </span>
  );
}
export function PageHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export function NewActivityButton({ children = 'Registrar actividad' }) {
  return (
    <Link href="/actividades/nueva" className="button button-primary">
      <Icon name="plus" size={19} />
      {children}
    </Link>
  );
}
export function EmptyState({
  title = 'Todavía no hay actividades',
  text = 'Registra la primera actividad y comienza a organizar el trabajo de tu equipo.',
  action = true,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name="inbox" size={34} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <NewActivityButton />}
    </div>
  );
}
export function LoadingState() {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      <span>Cargando actividades…</span>
    </div>
  );
}
export function BackLink() {
  return (
    <Link href="/actividades" className="back-link">
      <Icon name="back" size={17} />
      Volver a mis actividades
    </Link>
  );
}

export function DeleteDialog({ activity, onClose, onDeleted }) {
  const dialog = useRef(null);
  const { deleteActivity } = useActivities();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await deleteActivity(activity.id);
      onDeleted?.();
      onClose();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="delete-dialog"
      aria-labelledby="delete-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === dialog.current && !busy) onClose();
      }}
    >
      <div className="dialog-body">
        <span className="dialog-warning">
          <Icon name="trash" size={25} />
        </span>
        <h2 id="delete-title">¿Eliminar esta actividad?</h2>
        <p>
          Vas a eliminar <strong>“{activity.titulo}”</strong>. Esta acción no se puede deshacer.
        </p>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button className="button button-outline" onClick={onClose} disabled={busy} autoFocus>
            Cancelar
          </button>
          <button
            className="button button-danger"
            onClick={confirm}
            disabled={busy}
            data-testid="confirm-delete"
          >
            {busy ? <span className="spinner small" /> : <Icon name="trash" size={17} />}
            {busy ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
