-- OPCIONAL: solo agrega ejemplos que no existan. No elimina información.
INSERT INTO public.actividades (titulo, descripcion, responsable, fecha, categoria, estado)
SELECT s.titulo, s.descripcion, s.responsable, s.fecha::date, s.categoria, s.estado
FROM (VALUES
  ('Feria de empleo en Medellín', 'Apoyar el registro y la orientación de los asistentes.', 'Juan David', '2026-10-20', 'Feria de empleo', 'Pendiente'),
  ('Visita de seguimiento a empresas', 'Revisar las vacantes disponibles y las necesidades de contratación.', 'Laura Martínez', '2026-10-19', 'Visitas a clientes', 'En curso'),
  ('Alianza con centro de formación', 'Coordinar una jornada de orientación para los estudiantes.', 'Carlos Gómez', '2026-10-21', 'Alianzas', 'Pendiente'),
  ('Jornada de unidad móvil', 'Atender a los candidatos y actualizar sus hojas de vida.', 'Ana Torres', '2026-10-22', 'Unidad móvil', 'Pendiente'),
  ('Convocatoria de asesores comerciales', 'Completar la preselección de candidatos para las entrevistas.', 'Juan David', '2026-10-15', 'Reclutamiento', 'Realizada')
) AS s(titulo, descripcion, responsable, fecha, categoria, estado)
WHERE NOT EXISTS (
  SELECT 1 FROM public.actividades a WHERE a.titulo = s.titulo AND a.fecha = s.fecha::date
);
