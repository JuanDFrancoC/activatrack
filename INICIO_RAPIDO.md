# ActivaTrack: empieza aquí

Esta aplicación usa la **misma tabla `public.actividades` que ya creaste en Neon**.
No necesitas instalar PostgreSQL, crear otra base de datos ni volver a insertar el registro.

## 1. Instala Node.js

Instala **Node.js 24 LTS** desde <https://nodejs.org/>. Incluye npm.
Después abre una terminal nueva y comprueba:

```powershell
node --version
npm --version
```

El proyecto requiere Node.js 22 o superior; se verificó con Node.js 24.

## 2. Extrae el ZIP

En Windows: clic derecho sobre el ZIP → **Extraer todo**.
Abre la carpeta `activatrack` con Visual Studio Code.
Abre **Terminal → Nueva terminal**. Debes estar en la carpeta que contiene `package.json`.

## 3. Configura tu conexión de Neon

En la terminal de esa carpeta:

```powershell
Copy-Item .env.example .env.local
```

En macOS/Linux, el equivalente es `cp .env.example .env.local`.

1. Entra a tu proyecto **activatrack** en la consola de Neon.
2. Pulsa **Connect**.
3. Selecciona la rama **production** y la base **neondb**.
4. Copia la cadena que empieza por `postgresql://` (solo la cadena, sin `psql`).
5. Abre `.env.local` y reemplaza el ejemplo:

```dotenv
DATABASE_URL="postgresql://TU_USUARIO:TU_CLAVE@TU_HOST/neondb?sslmode=require"
```

**Pega tu cadena completa y conserva sus parámetros.** Si Neon muestra una conexión con pooling, puedes usarla.
No pegues esta contraseña en un componente, no uses un nombre `NEXT_PUBLIC_...` y no subas `.env.local` al repositorio.
El `.gitignore` ya lo excluye.

## 4. Instala y ejecuta

```powershell
npm ci
npm run dev
```

Abre <http://localhost:3000>.

Si PowerShell indica que `npm.ps1` está bloqueado, usa los mismos comandos así:

```powershell
npm.cmd ci
npm.cmd run dev
```

No hace falta cambiar la política de seguridad de Windows.

## 5. Comprueba que usa tu base real

Deberías encontrar la actividad **Feria de empleo en Medellín** que ya insertaste.
Después:

1. Registra una actividad de prueba.
2. Consulta su detalle.
3. Edítala y cambia su estado.
4. Recarga la página: el cambio debe mantenerse.
5. Elimina **solo la actividad de prueba** y confirma el diálogo.

Para comprobar únicamente la conexión, sin modificar datos:

```powershell
npm run check:db
```

Si cambias `.env.local`, detén el servidor con **Ctrl + C** y ejecuta otra vez `npm run dev`.

## Si algo no funciona

| Mensaje o situación                               | Qué revisar                                                                                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `node` no se reconoce                             | Instala Node.js y abre una terminal nueva.                                                                                   |
| No se encuentra `package.json`                    | Abre la terminal dentro de la carpeta `activatrack`.                                                                         |
| Falta configurar `DATABASE_URL`                   | Revisa que el archivo se llame `.env.local`, no `.env.local.txt`, y reemplaza el ejemplo.                                    |
| No fue posible completar la operación en la base  | Verifica la cadena completa en Neon y el acceso a internet; vuelve a intentar.                                               |
| No se encontró la tabla `actividades`             | La conexión debe apuntar a `production` / `neondb`, donde creaste la tabla.                                                  |
| El puerto 3000 está ocupado                       | Next indicará otro puerto; abre la URL que muestre la terminal.                                                              |
| La actividad de otro compañero todavía no aparece | Pulsa **Actualizar** en Inicio o el icono de actualizar en Mis actividades. No hay sincronización automática en tiempo real. |

Consulta `README.md` para revisar el código y `docs/DESPLIEGUE_VERCEL.md` para publicarlo después.
