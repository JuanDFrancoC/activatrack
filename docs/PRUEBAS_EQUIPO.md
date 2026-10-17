# Guía para las pruebas del equipo

## Qué se está entregando

Un CRUD de actividades conectado a PostgreSQL. Las pantallas Inicio, Mis actividades, Calendario, Registro, Edición y Detalle usan la misma información.
No hay autenticación: las actividades son compartidas por el equipo.

## Casos funcionales sugeridos

Usen un título reconocible como `QA - Nombre del compañero - Caso 01` para identificar sus registros.

| Caso                 | Pasos                                                        | Resultado esperado                                           |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Crear                | Completar todos los campos y guardar.                        | Mensaje de éxito y detalle del registro con ID.              |
| Persistir            | Recargar y abrir en otro navegador.                          | La actividad sigue existiendo.                               |
| Consultar            | Buscar por parte del título o responsable, abrir el detalle. | Datos completos y correctos.                                 |
| Editar               | Cambiar título, responsable, fecha y estado; guardar.        | El cambio se refleja al recargar.                            |
| Calendario           | Abrir el enlace “Ver en calendario” desde el detalle.        | Se selecciona el día de la actividad y aparece en la agenda. |
| Filtrar              | Elegir estado/categoría/rango de fechas.                     | Solo se muestran coincidencias.                              |
| Vacío                | Usar una búsqueda que no coincida.                           | Mensaje sin resultados y opción de limpiar filtros.          |
| Cancelar eliminación | Pulsar eliminar y cancelar.                                  | Se conserva el registro.                                     |
| Eliminar             | Confirmar la eliminación de un registro de prueba.           | Ya no aparece después de recargar.                           |
| Obligatorios         | Intentar guardar el formulario vacío.                        | Errores por campo; no se crea un registro.                   |
| Longitud             | Enviar desde API un título con más de 150 caracteres.        | HTTP 422, sin guardar.                                       |
| Fecha inválida       | Enviar `2026-02-30` desde API.                               | HTTP 422, sin guardar.                                       |
| Registro inexistente | Consultar un ID inexistente.                                 | HTTP 404 y mensaje claro.                                    |
| Celular              | Revisar a 390 px de ancho.                                   | Menú móvil, tarjetas y formulario adaptados.                 |

Las actividades vencidas son las que tienen fecha anterior al día actual y estado Pendiente o En curso.
El porcentaje del dashboard divide realizadas entre todas las no canceladas.

## API para herramientas

Usa la URL publicada como base. No hay token de acceso.

| Método | Ruta                    | Uso                                           |
| ------ | ----------------------- | --------------------------------------------- |
| GET    | `/api/health`           | Comprobar conexión y existencia de la tabla.  |
| GET    | `/api/actividades`      | Consultar el listado.                         |
| GET    | `/api/actividades/{id}` | Consultar un registro.                        |
| POST   | `/api/actividades`      | Crear.                                        |
| PUT    | `/api/actividades/{id}` | Reemplazar los campos editables del registro. |
| DELETE | `/api/actividades/{id}` | Eliminar un registro.                         |

Para POST/PUT usa la cabecera `Content-Type: application/json` y este cuerpo:

```json
{
  "titulo": "QA - Feria de empleo",
  "descripcion": "Actividad temporal para pruebas del equipo.",
  "responsable": "Compañero de pruebas",
  "fecha": "2026-10-20",
  "categoria": "Feria de empleo",
  "estado": "Pendiente"
}
```

La respuesta de creación es HTTP 201 con `{ "data": { ... } }`; guarda `data.id` para consultar, editar y eliminar ese mismo registro.
PUT requiere los mismos seis campos que POST (no es una actualización parcial).
DELETE devuelve HTTP 200 con `message` e `id`.

Otros códigos: 400 solicitud/ID incorrecto; 403 origen cruzado; 404 no existe; 413 cuerpo demasiado grande; 415 tipo de contenido incorrecto; 422 campos inválidos; 503 problema de configuración/conexión.

## Selenium

Elementos estables del formulario:

| Selector                            | Elemento                     |
| ----------------------------------- | ---------------------------- |
| `#titulo`                           | Título.                      |
| `#categoria`                        | Select de categoría.         |
| `#responsable`                      | Responsable.                 |
| `#fecha`                            | Fecha ISO `AAAA-MM-DD`.      |
| `#estado`                           | Select de estado.            |
| `#descripcion`                      | Descripción.                 |
| `[data-testid="save-activity"]`     | Botón de guardar.            |
| `[data-testid="search-activities"]` | Búsqueda del listado.        |
| `[data-testid="confirm-delete"]`    | Confirmación de eliminación. |

Los botones de eliminar y editar del listado también tienen etiquetas accesibles con el título de la actividad.
El guardado y la carga son asíncronos: usa esperas por elementos/resultados, no solo pausas fijas.

## SonarQube

El repositorio incluye `sonar-project.properties` con las carpetas de fuentes y pruebas.
El compañero encargado configura su servidor/escáner y sus credenciales según su entorno.
No incluye token, cobertura simulada ni resultados inventados.
SonarQube analiza el código; Selenium comprueba la interacción del navegador. Son tareas diferentes, aunque la captura del profesor permite una u otra herramienta en ese punto.

## JMeter / carga

Comienza por GET `/api/actividades` y registra errores, tiempos, duración, concurrencia y rendimiento.
Si pruebas creación/edición/eliminación, correlaciona el ID de cada actividad y limpia únicamente los registros de prueba.
Confirma qué significa el valor **250** de la consigna antes de fijar el escenario.
Los planes gratuitos tienen límites: un CRUD que funciona normalmente no garantiza soportar una carga concreta.
Ejecuta las pruebas sobre el proyecto del equipo y dentro de los límites aplicables del alojamiento.

## OWASP ZAP

Documenta la URL/alcance del análisis, herramienta y versión, alertas, evidencia y revisión de falsos positivos.
Los análisis activos pueden crear o modificar registros; usen datos de prueba.
La falta de roles/autenticación es una limitación explícita del alcance académico y debe registrarse como tal, no ocultarse.

## Evidencias

Para cada prueba: escenario, datos de entrada, pasos, resultado esperado, resultado obtenido, evidencia y conclusión.
Las pruebas incluidas en el código sirven para desarrollo; no sustituyen los análisis, informes ni el video que exige el profesor.
