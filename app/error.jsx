'use client';
export default function ErrorPage({ reset }) {
  return (
    <section className="card empty-state" role="alert">
      <h1>Ocurrió un problema</h1>
      <p>No pudimos mostrar esta pantalla. Inténtalo nuevamente.</p>
      <button className="button button-primary" onClick={reset}>
        Volver a intentar
      </button>
    </section>
  );
}
