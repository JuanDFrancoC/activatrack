// El driver recibe los valores por separado: nunca concatenamos entradas en SQL.
// La función sql se inyecta para probar las mismas consultas con Postgres embebido.
export function createActivitiesRepository(sql) {
  function normalize(row) {
    if (!row) return null;
    return {
      ...row,
      fecha:
        row.fecha instanceof Date
          ? row.fecha.toISOString().slice(0, 10)
          : String(row.fecha).slice(0, 10),
      creado_en: row.creado_en instanceof Date ? row.creado_en.toISOString() : row.creado_en,
    };
  }
  return {
    async list() {
      const rows =
        await sql`SELECT id, titulo, descripcion, responsable, fecha, categoria, estado, creado_en
        FROM public.actividades ORDER BY fecha ASC, id DESC`;
      return rows.map(normalize);
    },
    async get(id) {
      const rows =
        await sql`SELECT id, titulo, descripcion, responsable, fecha, categoria, estado, creado_en
        FROM public.actividades WHERE id = ${id}`;
      return normalize(rows[0]);
    },
    async create(a) {
      const rows =
        await sql`INSERT INTO public.actividades (titulo, descripcion, responsable, fecha, categoria, estado)
        VALUES (${a.titulo}, ${a.descripcion}, ${a.responsable}, ${a.fecha}, ${a.categoria}, ${a.estado})
        RETURNING id, titulo, descripcion, responsable, fecha, categoria, estado, creado_en`;
      return normalize(rows[0]);
    },
    async update(id, a) {
      const rows =
        await sql`UPDATE public.actividades SET titulo = ${a.titulo}, descripcion = ${a.descripcion},
        responsable = ${a.responsable}, fecha = ${a.fecha}, categoria = ${a.categoria}, estado = ${a.estado}
        WHERE id = ${id} RETURNING id, titulo, descripcion, responsable, fecha, categoria, estado, creado_en`;
      return normalize(rows[0]);
    },
    async remove(id) {
      const rows = await sql`DELETE FROM public.actividades WHERE id = ${id} RETURNING id`;
      return rows[0] ?? null;
    },
    async health() {
      await sql`SELECT id FROM public.actividades LIMIT 1`;
      return true;
    },
  };
}
