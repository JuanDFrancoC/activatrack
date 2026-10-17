# Relación con el documento de ActivaTrack

La entrega se limita al CRUD funcional permitido por el profesor. El escrito describe un producto más amplio.

| Elemento del escrito/mockups         | Implementación en este ZIP                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Interfaz azul con sidebar y tarjetas | Implementada con CSS propio; responsive.                                                           |
| Dashboard                            | Resumen, próximas actividades, categorías, agenda y avance con datos consultados.                  |
| RF03 Registrar actividad             | Implementado.                                                                                      |
| RF05 Consultar actividades           | Implementado como consulta compartida; sin permisos por rol.                                       |
| Editar y eliminar del mockup         | Implementados con validación y confirmación de eliminación.                                        |
| RF06 Calendario                      | Vista mensual con agenda del día.                                                                  |
| RF07 Estados                         | Pendiente, En curso, Realizada y Cancelada.                                                        |
| RF08 Categorías                      | Las cinco categorías de la tabla ya creada.                                                        |
| RF12 Consolidado                     | Indicadores básicos en Inicio; no informes descargables.                                           |
| RF01 Inicio de sesión / RF02 Roles   | Fuera del alcance reducido.                                                                        |
| RF04 Asignación a usuarios           | Responsable como nombre escrito; sin relación con cuentas.                                         |
| RF09 Evidencias / RF10 Ubicación     | Fuera del alcance reducido.                                                                        |
| RF11 Seguimiento por jefe            | Consulta de estados compartida; sin vista privada por rol.                                         |
| RNF Usabilidad / Responsive          | Labels, mensajes por campo, estados de carga, confirmación y estilos adaptables.                   |
| RNF Seguridad                        | Validación de servidor, SQL parametrizado, secretos privados y cabeceras; autenticación pendiente. |
| Modelo de datos amplio               | Se conserva solo public.actividades conforme al esquema creado en Neon.                            |

## Criterios de aceptación del CRUD

1. Crear una actividad con título, descripción, responsable, fecha, categoría y estado válidos.
2. Consultarla desde el listado y el detalle.
3. Actualizar los campos y mantener el cambio después de recargar.
4. Eliminarla solo tras confirmar; un ID ya eliminado devuelve 404.
5. Mostrarla en la fecha correspondiente del calendario.
6. Rechazar datos inválidos tanto en interfaz como en la API.
7. Mostrar mensajes de conexión fallida sin reemplazar silenciosamente la base por datos falsos.
8. Permitir ejecución local y compilación de producción para Vercel.

La conexión real y los cuatro primeros criterios deben comprobarse también después de configurar DATABASE_URL y publicar el proyecto.
