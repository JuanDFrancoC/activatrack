-- Coincide con la tabla que ya se creó en Neon. No borra ni modifica registros.
-- No necesitas ejecutarlo si public.actividades ya existe en tu base neondb.
CREATE TABLE IF NOT EXISTS public.actividades (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL CHECK (LENGTH(TRIM(titulo)) > 0),
    descripcion VARCHAR(500) NOT NULL,
    responsable VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(responsable)) > 0),
    fecha DATE NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN (
        'Alianzas', 'Feria de empleo', 'Unidad móvil', 'Reclutamiento', 'Visitas a clientes'
    )),
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN (
        'Pendiente', 'En curso', 'Realizada', 'Cancelada'
    )),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
