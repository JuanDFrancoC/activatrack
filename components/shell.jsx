'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from './icon';
import { useActivities } from './activity-context';

const navigation = [
  { href: '/', label: 'Inicio', icon: 'home' },
  { href: '/calendario', label: 'Calendario', icon: 'calendar' },
  { href: '/actividades', label: 'Mis actividades', icon: 'list' },
  { href: '/actividades/nueva', label: 'Registrar actividad', icon: 'plus' },
];

export function Brand() {
  return (
    <span className="brand brand-reference">
      <span className="reference-wordmark">
        Activa<span className="brand-accent">Track</span>
      </span>
    </span>
  );
}

// Iconos sólidos del menú, siguiendo el aspecto de la referencia visual.
// Son vectores locales: no necesitan fuentes ni servicios externos.
function SidebarIcon({ name }) {
  const shapes = {
    home: <path d="M2 10.2 12 2l10 8.2-1.8 2.2-1.2-1V22h-5v-7h-4v7H5V11.4l-1.2 1Z" />,
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="17" rx="2.3" />
        <path
          d="M7 2v6m10-6v6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M6 10h12M7 14h2m2 0h2m2 0h2M7 18h2m2 0h2m2 0h2"
          fill="none"
          stroke="var(--sidebar-icon-cutout)"
          strokeWidth="1.6"
        />
      </>
    ),
    list: (
      <>
        <rect x="2" y="3" width="3" height="3" rx=".5" />
        <rect x="2" y="10" width="3" height="3" rx=".5" />
        <rect x="2" y="17" width="3" height="3" rx=".5" />
        <rect x="8" y="3.5" width="14" height="2" rx=".5" />
        <rect x="8" y="10.5" width="14" height="2" rx=".5" />
        <rect x="8" y="17.5" width="14" height="2" rx=".5" />
      </>
    ),
    plus: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path
          d="M12 7v10M7 12h10"
          fill="none"
          stroke="var(--sidebar-icon-cutout)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  };
  return (
    <svg
      className="reference-nav-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {shapes[name]}
    </svg>
  );
}

export function Shell({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { error, lastSync, loading, refresh, toast, setToast } = useActivities();
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const listener = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [menuOpen]);
  const title =
    pathname === '/'
      ? 'Inicio'
      : pathname === '/calendario'
        ? 'Calendario'
        : pathname === '/actividades/nueva'
          ? 'Registrar actividad'
          : pathname.endsWith('/editar')
            ? 'Editar actividad'
            : pathname === '/actividades'
              ? 'Mis actividades'
              : 'Detalle de actividad';
  const isActive = (href) =>
    href === '/actividades'
      ? pathname.startsWith('/actividades') && pathname !== '/actividades/nueva'
      : pathname === href;

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      {menuOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="main-navigation"
        className={`sidebar sidebar-reference ${menuOpen ? 'is-open' : ''}`}
      >
        <Link href="/" className="brand-link" aria-label="ActivaTrack, inicio">
          <Brand />
        </Link>
        <nav aria-label="Navegación principal">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <SidebarIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="workspace workspace-reference">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-toggle"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name="menu" />
            </button>
            <span className="breadcrumb">
              Espacio de trabajo <Icon name="arrow" size={13} /> <strong>{title}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className={`connection-label ${error ? 'connection-error' : ''}`}>
              <i />
              {loading
                ? 'Cargando…'
                : error
                  ? 'Sin conexión'
                  : lastSync
                    ? 'Datos actualizados'
                    : 'Conectando…'}
            </span>
            <div className="account-separator" />
            <span className="team-avatar">AT</span>
            <div className="team-label">
              Agencia de Empleo<small>Vista del equipo</small>
            </div>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {error && (
            <section className="error-banner" role="alert">
              <Icon name="alert" size={23} />
              <div>
                <strong>No pudimos actualizar las actividades</strong>
                <p>{error}</p>
                {lastSync && <small>Se mantienen los últimos datos consultados.</small>}
              </div>
              <button onClick={refresh} className="button button-outline" disabled={loading}>
                <Icon name="refresh" size={16} />
                Reintentar
              </button>
            </section>
          )}
          {children}
        </main>
        <footer className="workspace-footer">
          <span>
            ActivaTrack <span>·</span> Sistema para la gestión y seguimiento de actividades
          </span>
          <span>Politécnico Grancolombiano</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Icon name="check" size={17} />
          </span>
          {toast}
          <button
            className="icon-button"
            aria-label="Cerrar mensaje"
            onClick={() => setToast(null)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </>
  );
}
