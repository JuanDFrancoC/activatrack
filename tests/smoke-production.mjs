// Verificación HTTP de la compilación real, sin navegador y sin conexión de Neon.
// El servidor se inicia solo durante la prueba y siempre se detiene al terminar.
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createServer } from 'node:net';

const root = fileURLToPath(new URL('../', import.meta.url));
const portProbe = createServer();
await new Promise((resolveReady) => portProbe.listen(0, '127.0.0.1', resolveReady));
const port = portProbe.address().port;
await new Promise((resolveClosed) => portProbe.close(resolveClosed));
const base = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    resolve(root, 'node_modules/next/dist/bin/next'),
    'start',
    '-p',
    String(port),
    '-H',
    '127.0.0.1',
  ],
  {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DATABASE_URL: '', NEXT_TELEMETRY_DISABLED: '1' },
  },
);
let logs = '';
server.stdout.on('data', (data) => {
  logs += data.toString();
});
server.stderr.on('data', (data) => {
  logs += data.toString();
});

try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error('El servidor terminó antes de iniciar.');
    try {
      if ((await fetch(base)).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  assert.ok(ready, 'El servidor de producción debe iniciar.');
  for (const [path, marker] of [
    ['/', 'Un buen día para avanzar'],
    ['/actividades', 'Mis actividades'],
    ['/actividades/nueva', 'Información de la actividad'],
    ['/calendario', 'Calendario de actividades'],
    ['/actividades/1', 'Cargando actividades'],
    ['/actividades/1/editar', 'Cargando actividades'],
  ]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(marker), path);
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    console.log(`OK página ${path}`);
  }
  assert.equal((await fetch(base + '/ruta-inexistente')).status, 404);
  const health = await fetch(base + '/api/health');
  assert.equal(health.status, 503);
  assert.match((await health.json()).error, /DATABASE_URL/);
  assert.equal((await fetch(base + '/api/actividades/abc')).status, 400);
  assert.equal(
    (
      await fetch(base + '/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
    ).status,
    422,
  );
  assert.equal(
    (
      await fetch(base + '/api/actividades/1', {
        method: 'DELETE',
        headers: { Origin: 'https://otro.example' },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + '/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{mal',
      })
    ).status,
    400,
  );
  console.log('OK API: errores de configuración, validación, JSON, origen e ID.');
  console.log('Verificación HTTP de producción completada.');
} catch (error) {
  console.error(error.message);
  console.error(logs);
  process.exitCode = 1;
} finally {
  if (server.exitCode === null) {
    server.kill('SIGTERM');
    await Promise.race([
      once(server, 'exit'),
      new Promise((resolveWait) => setTimeout(resolveWait, 3000)),
    ]);
    if (server.exitCode === null) server.kill('SIGKILL');
  }
}
