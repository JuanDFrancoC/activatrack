# Verificación de la entrega

Fecha de preparación: **16 de octubre de 2026** (Colombia).

## Comprobaciones realizadas

| Comprobación                                                                        | Resultado                                                                                                                      |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Instalación de dependencias                                                         | Correcta; se incluye package-lock.json.                                                                                        |
| Compilación de producción (`npm run build`)                                         | Correcta, con las páginas y rutas API generadas.                                                                               |
| Pruebas automáticas (`npm test`)                                                    | 19 pruebas aprobadas.                                                                                                          |
| Pruebas con zona horaria America/Bogota                                             | 19 pruebas aprobadas.                                                                                                          |
| CRUD con las consultas del repositorio y el esquema SQL                             | Crear, leer, editar y eliminar verificados contra PostgreSQL embebido PGlite.                                                  |
| Persistencia en la prueba                                                           | Se consulta directamente la base después de crear/actualizar/eliminar.                                                         |
| Validación                                                                          | Obligatorios, longitudes, estados, categorías, fechas, IDs, JSON y tamaño del cuerpo.                                          |
| Consultas parametrizadas                                                            | Texto con sintaxis SQL se almacena como texto; la tabla se conserva.                                                           |
| Errores HTTP                                                                        | 400, 403, 404, 413, 415, 422 y 503 comprobados en pruebas.                                                                     |
| Comprobación HTTP de la compilación                                                 | Inicio, listado, registro, calendario, detalle y edición responden 200; ruta desconocida responde 404.                         |
| Configuración ausente                                                               | La API responde 503 con mensaje claro; la compilación no requiere la clave privada.                                            |
| Consulta de vulnerabilidades de dependencias de producción (`npm audit --omit=dev`) | No se reportaron vulnerabilidades en la consulta realizada al preparar la entrega. No equivale a un análisis de la aplicación. |

Las pruebas usan una base temporal embebida y no acceden a tu proyecto Neon ni modifican sus registros.
Las pruebas HTTP levantan un proceso temporal de producción y lo detienen al terminar.

## Pendiente en tu entorno

- Configurar tu cadena privada `DATABASE_URL` y confirmar la consulta al proyecto real en Neon.
- Revisar visualmente la interfaz en tu navegador y probar el flujo completo desde la web.
- Publicar el repositorio y la aplicación en Vercel.
- Comprobar persistencia entre dos navegadores/dispositivos desde la URL publicada.
- Ejecutar las pruebas de Selenium/SonarQube, carga con JMeter y seguridad con ZAP que le corresponden al equipo.

No se ejecutaron pruebas de navegador ni se certificó el aspecto visual mediante capturas en este entorno.
Los estilos de escritorio/celular están implementados, pero la revisión visual final debe hacerse al abrir el proyecto.
No se ejecutaron pruebas de carga ni escaneos activos de seguridad.
