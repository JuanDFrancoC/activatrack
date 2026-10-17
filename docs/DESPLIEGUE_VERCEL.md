# Publicar ActivaTrack en Vercel

Primero confirma que funciona en tu computador y que estás consultando la base `neondb` correcta.

## 1. Sube el código a GitHub

Puedes usar GitHub Desktop o Git desde la carpeta que contiene `package.json`.
Crea un repositorio para ActivaTrack y sube el código, incluyendo `package-lock.json`.

No subas `.env.local`, `node_modules` ni `.next`; ya están excluidos en `.gitignore`.
No se requiere incluir la contraseña de Neon en el repositorio.

## 2. Importa el repositorio en Vercel

1. Inicia sesión en Vercel.
2. Crea un proyecto e importa el repositorio.
3. Selecciona **Next.js** si la detección no lo identifica automáticamente.
4. La carpeta raíz debe ser la que contiene `package.json`. Si subiste una carpeta contenedora, selecciónala en Root Directory.
5. Usa **Node.js 24.x**, si está disponible; el proyecto requiere 22 o superior.
6. Deja el comando de compilación `npm run build` y la configuración normal de salida de Next.js.

## 3. Agrega DATABASE_URL

En Environment Variables, agrega:

| Nombre         | Valor                                   |
| -------------- | --------------------------------------- |
| `DATABASE_URL` | Tu cadena completa de conexión de Neon. |

Configúrala para Production y, si los vas a usar, los entornos Preview/Development.
En la interfaz de Vercel pega el valor sin las comillas externas del archivo `.env.local`.
No uses un prefijo `NEXT_PUBLIC_`.

Publica el proyecto. Si agregas o cambias la variable después de desplegar, realiza un nuevo despliegue para aplicar el valor.

## 4. Verifica la URL publicada

1. Abre `/api/health` sobre tu dominio. Debe responder `{"status":"ok","database":"connected"}`.
2. Abre Inicio y el listado.
3. Crea una actividad de prueba desde la aplicación.
4. Abre la URL desde otro navegador o dispositivo y confirma que aparece.
5. Edita esa actividad, recarga y confirma los cambios.
6. Elimina el registro de prueba y verifica que desaparece.

No basta con que el despliegue termine: el código puede compilar aunque `DATABASE_URL` falte. Esa situación se muestra como un error de conexión en la aplicación.

## 5. Entrega al equipo

- URL pública de la aplicación.
- Repositorio con acceso para consultar el código.
- Instrucciones de `docs/PRUEBAS_EQUIPO.md`.
- Alcance: CRUD de actividades, sin autenticación, fotografías ni geolocalización.

No es necesario compartir las credenciales de Neon para hacer pruebas por la web.
La base en Neon se mantiene separada del alojamiento de la aplicación en Vercel.
