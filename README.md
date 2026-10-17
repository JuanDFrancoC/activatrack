# ActivaTrack

Aplicación web para registrar, consultar, actualizar y eliminar actividades de la Agencia de Empleo.
Proyecto académico del programa de Ingeniería de Software del Politécnico Grancolombiano.

**Para ejecutarla: abre primero [INICIO_RAPIDO.md](INICIO_RAPIDO.md).**

## Qué incluye

- **Inicio:** resumen por estado, próximas actividades, distribución por categoría y calendario pequeño.
- **Mis actividades:** listado compartido, búsqueda por título/descripción/responsable, filtros por categoría/estado/fecha, ordenamiento y paginación.
- **Registro y edición:** campos obligatorios, límites de longitud, fechas válidas, errores por campo y confirmación de guardado.
- **Detalle:** datos completos, fecha del registro, acciones de edición y eliminación, enlace al día en calendario.
- **Calendario:** navegación por meses y consulta de las actividades de un día.
- **Eliminación:** requiere confirmación y actualiza el listado al completarse.
- **Interfaz adaptable:** sidebar azul en escritorio, menú en celular, tabla que se convierte en tarjetas y formularios de una columna.
- **API REST:** operaciones del CRUD y endpoint para comprobar conexión/tabla.

Los colores, navegación, formularios, tarjetas y distribución visual toman como referencia los mockups del documento de ActivaTrack. La implementación se ajusta al alcance reducido acordado para esta entrega.

## Alcance acordado

Esta versión desarrolla el **CRUD de actividades**. Usa una única tabla y un responsable escrito como nombre.
El listado es compartido entre los visitantes; “Mis actividades” conserva el nombre del mockup, pero no filtra por una identidad autenticada.

No incluye inicio de sesión, permisos por rol, asignación a cuentas de usuario, fotografías, adjuntos, ubicación geográfica ni notificaciones. Tampoco simula esas funciones con botones sin comportamiento.
No se presenta como la implementación completa del MVP de diez semanas descrito en el documento.

Los cambios se guardan en PostgreSQL en Neon. **No se guardan en localStorage, archivos del servidor ni datos simulados.**
La aplicación consulta al entrar; para traer cambios de otra sesión, se recarga la página o se pulsa Actualizar.

## Tecnologías

- JavaScript y React con Next.js App Router.
- CSS propio, sin un framework de estilos ni descarga de fuentes externas.
- API del servidor de Next.js, compatible con el despliegue en Vercel.
- PostgreSQL en Neon con `@neondatabase/serverless` mediante HTTPS.
- Pruebas con `node:test` y PostgreSQL embebido PGlite (solo para pruebas).

Las dependencias de ejecución están fijadas en `package.json` y `package-lock.json`.
`npm ci` reproduce la instalación. El ZIP no contiene `node_modules` ni `.next`.

## Comandos

| Comando              | Función                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`             | Instalar las versiones del archivo de bloqueo.                                                                                |
| `npm run dev`        | Ejecutar el entorno de desarrollo.                                                                                            |
| `npm run build`      | Compilar para producción. No necesita conexión a Neon durante la compilación.                                                 |
| `npm start`          | Ejecutar la compilación de producción.                                                                                        |
| `npm test`           | Ejecutar las pruebas sin usar tu base de Neon.                                                                                |
| `npm run check:db`   | Comprobar la conexión configurada en `.env.local`, la tabla y el número de registros. No modifica datos.                      |
| `npm run test:smoke` | Comprobar páginas y rutas HTTP de la compilación, con conexión intencionalmente ausente. Ejecutar después de `npm run build`. |

## Organización del código

| Ubicación             | Responsabilidad                                                             |
| --------------------- | --------------------------------------------------------------------------- |
| `app/`                | Páginas, estilos globales, metadatos y rutas API.                           |
| `components/`         | Pantallas, calendario, formulario, navegación, diálogo y contexto de datos. |
| `lib/constants.js`    | Categorías y estados que coinciden con los CHECK de Neon.                   |
| `lib/validation.js`   | Validación compartida por formulario y servidor.                            |
| `lib/db.js`           | Conexión privada a Neon, únicamente desde el servidor.                      |
| `lib/repository.js`   | Consultas SQL parametrizadas.                                               |
| `lib/api-handlers.js` | Respuestas HTTP, validación de solicitudes y manejo de errores.             |
| `lib/dates.js`        | Fechas de calendario y cálculo de actividades vencidas.                     |
| `database/`           | Esquema compatible con la tabla existente y ejemplos opcionales.            |
| `tests/`              | Pruebas de API/repositorio, validación y fechas.                            |
| `docs/`               | Despliegue, pruebas del equipo, alcance y verificación de la entrega.       |

## Modelo utilizado

| Campo         | Tipo             | Uso                                                                          |
| ------------- | ---------------- | ---------------------------------------------------------------------------- |
| `id`          | INTEGER identity | Identificador generado por PostgreSQL.                                       |
| `titulo`      | VARCHAR(150)     | Nombre de la actividad.                                                      |
| `descripcion` | VARCHAR(500)     | Detalles y objetivo.                                                         |
| `responsable` | VARCHAR(100)     | Nombre del responsable.                                                      |
| `fecha`       | DATE             | Día programado, sin hora.                                                    |
| `categoria`   | VARCHAR(50)      | Alianzas, Feria de empleo, Unidad móvil, Reclutamiento o Visitas a clientes. |
| `estado`      | VARCHAR(20)      | Pendiente, En curso, Realizada o Cancelada.                                  |
| `creado_en`   | TIMESTAMPTZ      | Fecha del registro generada por la base.                                     |

No se agrega `actualizado_en`, horario ni ubicación porque no forman parte de la tabla ya creada.
La fecha programada se maneja como día de calendario para que no cambie al aplicar la zona horaria colombiana.
La fecha de registro sí se presenta en `America/Bogota`.

`database/schema.sql` contiene `CREATE TABLE IF NOT EXISTS` y no elimina datos.
No necesitas ejecutarlo en la base que ya preparaste.
`database/seed.sql` es opcional: agrega ejemplos y evita repetirlos por título y fecha cuando se vuelve a ejecutar de forma secuencial.

## Tratamiento de datos y acceso

- La variable `DATABASE_URL` vive en `.env.local` o en las variables de Vercel; nunca se envía al navegador.
- Las consultas SQL separan los valores enviados por el usuario del texto SQL.
- La API valida los campos y rechaza estados/categorías desconocidos, fechas inválidas, IDs incorrectos y solicitudes con cuerpos demasiado grandes.
- Las rutas de cambio aceptan JSON y verifican el origen de las solicitudes del navegador.
- Los errores públicos no incluyen credenciales ni consultas completas; el log imprime únicamente un código de diagnóstico.
- React representa el contenido de actividades como texto y no usa HTML aportado por usuarios.
- Las respuestas API se envían con `Cache-Control: no-store`.

**No hay autenticación:** quien tenga acceso al sitio podrá operar sobre el registro compartido. Usa datos académicos/de prueba para esta entrega. La protección de origen no reemplaza el control de usuarios y roles.

## Publicar y compartir

Sigue [docs/DESPLIEGUE_VERCEL.md](docs/DESPLIEGUE_VERCEL.md).
Entrega al equipo la URL publicada, el repositorio y [docs/PRUEBAS_EQUIPO.md](docs/PRUEBAS_EQUIPO.md).
Tus compañeros no necesitan instalar PostgreSQL ni tener la contraseña de Neon para probar el sitio publicado.

## Fuentes técnicas de referencia

- Next.js: <https://nextjs.org/docs/app/getting-started/installation>
- Rutas API: <https://nextjs.org/docs/app/api-reference/file-conventions/route>
- Driver de Neon: <https://neon.com/docs/serverless/serverless-driver>
- Variables de entorno en Vercel: <https://vercel.com/docs/environment-variables>

Revisa [docs/VERIFICACION.md](docs/VERIFICACION.md) para conocer qué se comprobó y qué falta validar con tu conexión real.
