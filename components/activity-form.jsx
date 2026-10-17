'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useActivities } from './activity-context';
import { useActivity } from './use-activity';
import { BackLink, LoadingState, PageHeading } from './ui';
import { Icon } from './icon';
import { CATEGORIES, EMPTY_ACTIVITY, STATUSES } from '@/lib/constants';
import { validateActivity } from '@/lib/validation';

export function ActivityForm({ id }) {
  const editing = Boolean(id);
  const router = useRouter();
  const { saveActivity } = useActivities();
  const detail = useActivity(id);
  const [values, setValues] = useState({ ...EMPTY_ACTIVITY });
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const form = useRef(null);
  useEffect(() => {
    if (detail.activity) {
      const a = detail.activity;
      setValues({
        titulo: a.titulo,
        descripcion: a.descripcion,
        responsable: a.responsable,
        fecha: a.fecha,
        categoria: a.categoria,
        estado: a.estado,
      });
      setDirty(false);
    }
  }, [detail.activity]);
  useEffect(() => {
    if (!dirty || saving) return;
    const guard = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty, saving]);
  function change(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFields((current) => ({ ...current, [name]: undefined }));
    setDirty(true);
  }
  function focusError(errors) {
    const name = Object.keys(errors || {})[0];
    if (name) form.current?.elements.namedItem(name)?.focus();
  }
  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setError('');
    setFields({});
    let data;
    try {
      data = validateActivity(values);
    } catch (e) {
      setFields(e.fields || {});
      setError(e.message);
      focusError(e.fields);
      return;
    }
    setSaving(true);
    try {
      const saved = await saveActivity(data, editing ? Number(id) : undefined);
      setDirty(false);
      router.push(`/actividades/${saved.id}`);
    } catch (e) {
      setError(e.message);
      setFields(e.fields || {});
      setSaving(false);
      focusError(e.fields);
    }
  }
  function cancel() {
    if (!dirty || window.confirm('Tienes cambios sin guardar. ¿Quieres salir del formulario?'))
      router.push(editing ? `/actividades/${id}` : '/actividades');
  }
  function inputProps(name) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: change,
      disabled: saving,
      'aria-invalid': Boolean(fields[name]),
      'aria-describedby': fields[name] ? `${name}-error` : undefined,
    };
  }
  const FieldError = ({ name }) =>
    fields[name] ? (
      <span className="field-error" id={`${name}-error`}>
        {fields[name]}
      </span>
    ) : null;

  if (editing && detail.loading)
    return (
      <section className="card">
        <LoadingState />
      </section>
    );
  if (editing && detail.error)
    return (
      <>
        <BackLink />
        <section className="card empty-state" role="alert">
          <Icon name="alert" size={30} />
          <h2>
            {detail.status === 404
              ? 'Esta actividad no está disponible'
              : 'No pudimos abrir la actividad'}
          </h2>
          <p>{detail.error}</p>
          <button className="button button-primary" onClick={detail.retry}>
            Reintentar
          </button>
        </section>
      </>
    );
  return (
    <>
      <BackLink />
      <PageHeading
        eyebrow={editing ? 'AJUSTA LOS DETALLES' : 'UN NUEVO PASO PARA TU EQUIPO'}
        title={editing ? 'Editar actividad' : 'Registrar actividad'}
        subtitle={
          editing
            ? 'Actualiza la información y guarda los cambios.'
            : 'Completa los datos para organizar una nueva actividad.'
        }
      />
      <div className="form-layout">
        <section className="card form-card">
          <div className="form-card-header">
            <span className="form-heading-icon">
              <Icon name={editing ? 'edit' : 'calendar'} size={24} />
            </span>
            <div>
              <h2>Información de la actividad</h2>
              <p>
                Los campos marcados con <span className="required">*</span> son obligatorios.
              </p>
            </div>
          </div>
          <form ref={form} onSubmit={submit} noValidate data-testid="activity-form">
            {error && (
              <div className="form-error" role="alert">
                <Icon name="alert" size={19} />
                {error}
              </div>
            )}
            <div className="form-fields">
              <label className="field-label full-field" htmlFor="titulo">
                Título de la actividad <span className="required">*</span>
                <input
                  {...inputProps('titulo')}
                  placeholder="Ej. Feria de empleo en Medellín"
                  maxLength={150}
                  required
                  autoComplete="off"
                />
                <FieldError name="titulo" />
              </label>
              <label className="field-label" htmlFor="categoria">
                Categoría <span className="required">*</span>
                <select {...inputProps('categoria')} required>
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <FieldError name="categoria" />
              </label>
              <label className="field-label" htmlFor="estado">
                Estado <span className="required">*</span>
                <select {...inputProps('estado')} required>
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <FieldError name="estado" />
              </label>
              <label className="field-label" htmlFor="responsable">
                Responsable <span className="required">*</span>
                <div className="input-icon">
                  <Icon name="user" size={17} />
                  <input
                    {...inputProps('responsable')}
                    placeholder="Nombre del responsable"
                    maxLength={100}
                    required
                    autoComplete="off"
                  />
                </div>
                <FieldError name="responsable" />
              </label>
              <label className="field-label" htmlFor="fecha">
                Fecha de la actividad <span className="required">*</span>
                <input
                  {...inputProps('fecha')}
                  type="date"
                  min="1900-01-01"
                  max="2100-12-31"
                  required
                />
                <FieldError name="fecha" />
              </label>
              <label className="field-label full-field" htmlFor="descripcion">
                Descripción <span className="required">*</span>
                <textarea
                  {...inputProps('descripcion')}
                  placeholder="Describe el objetivo y los detalles de la actividad…"
                  rows={5}
                  maxLength={500}
                  required
                />
                <span className="field-meta">
                  <span>Cuéntale al equipo qué se va a realizar.</span>
                  <span>{values.descripcion.length}/500</span>
                </span>
                <FieldError name="descripcion" />
              </label>
            </div>
            <div className="form-actions">
              <span>
                <Icon name="info" size={15} />
                {saving ? 'Guardando la actividad…' : 'Los datos se guardan al confirmar.'}
              </span>
              <div>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={cancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                  data-testid="save-activity"
                >
                  {saving ? <span className="spinner small" /> : <Icon name="save" size={17} />}
                  {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Guardar actividad'}
                </button>
              </div>
            </div>
          </form>
        </section>
        <aside className="form-aside">
          <section className="form-tip-card">
            <span className="soft-icon">
              <Icon name="info" size={22} />
            </span>
            <h3>
              Una actividad clara
              <br />
              hace la diferencia.
            </h3>
            <p>
              Usa un título fácil de reconocer y una descripción que ayude a entender el propósito.
            </p>
            <div className="form-tip-divider" />
            <h4>Antes de guardar</h4>
            <ul>
              <li>
                <Icon name="check" size={15} />
                Confirma la fecha programada.
              </li>
              <li>
                <Icon name="check" size={15} />
                Indica quién es responsable.
              </li>
              <li>
                <Icon name="check" size={15} />
                Selecciona el estado actual.
              </li>
            </ul>
          </section>
          <div className="aside-note">
            <Icon name="calendar" size={21} />
            <p>Tu actividad aparecerá en el listado y en el calendario del equipo.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
