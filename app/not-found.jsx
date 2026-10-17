import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="card empty-state">
      <span className="eyebrow">ERROR 404</span>
      <h1>No encontramos esta página</h1>
      <p>El enlace no existe. Puedes regresar al listado de actividades.</p>
      <Link href="/actividades" className="button button-primary">
        Ir a mis actividades
      </Link>
    </section>
  );
}
