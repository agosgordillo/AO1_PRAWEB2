/**
 * server.js
 * ----------------------------------------------------------------
 * Servidor HTTP nativo en Node.js (sin Express) que implementa un
 * MVP del portal interno "AgroTrack".
 *
 * Características:
 * - Usa solo módulos nativos: http, fs, path, url, os
 * - Crea automáticamente la estructura de carpetas y archivos
 * (public/*, data/consultas.txt) con contenido de ejemplo.
 * - Router para manejar GET y POST según la especificación.
 * - Operaciones de archivos asíncronas (fs.readFile, fs.appendFile, etc.)
 *
 * Instrucciones:
 * 1. Guardar este archivo como `server.js` dentro de la carpeta `agrotrack/`.
 * 2. Ejecutar: node server.js
 * 3. Abrir en el navegador: http://localhost:3000
 *
 * ----------------------------------------------------------------
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const os = require('os'); // por si queremos usar info del sistema (no obligatorio)

// ----- Configuración -----
const PORT = 8888;
const BASE_DIR = __dirname; // asume que server.js está en agrotrack/
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const DATA_DIR = path.join(BASE_DIR, 'data');
const CONSULTAS_FILE = path.join(DATA_DIR, 'consultas.txt');

// MIME types simples
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// ----- Contenido por defecto para archivos públicos (ESTÉTICA MEJORADA) -----
const DEFAULT_FILES = {
  'index.html': `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>AgroTrack - Portal Interno</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <div class="logo">
        <h1>🌾 AgroTrack</h1>
        <p class="slogan">Tecnología al servicio del campo</p>
      </div>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto">Contacto</a>
        <a href="/login">Login</a>
      </nav>
    </header>

    <main>
      <section class="hero">
        <h2>Bienvenido al portal interno de AgroTrack</h2>
        <p>Innovamos en soluciones tecnológicas para optimizar la producción agropecuaria.</p>
        <a class="boton-principal" href="/productos.html">Explorar Productos</a>
      </section>
    </main>

    <footer>
      <p>&copy; 2025 AgroTrack | Innovación y Sustentabilidad</p>
    </footer>
  </body>
  </html>
  `,

  'productos.html': `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Productos - AgroTrack</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <div class-="logo">
        <h1>🌾 AgroTrack</h1>
      </div>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html" class="activo">Productos</a>
        <a href="/contacto">Contacto</a>
        <a href="/login">Login</a>
      </nav>
    </header>

    <main>
      <h2>Nuestros Productos</h2>
      <p>Soluciones tecnológicas para la gestión agroindustrial.</p>
      <div class="grid-productos">
        <div class="card">
          <h3>Sensor de Humedad C-210</h3>
          <p>Monitorea en tiempo real la humedad del suelo con conexión IoT.</p>
        </div>
        <div class="card">
          <h3>Semilla Premium S-001</h3>
          <p>Desarrollada para maximizar el rendimiento bajo diversas condiciones climáticas.</p>
        </div>
        <div class="card">
          <h3>Fertilizante Inteligente F-034</h3>
          <p>Optimiza nutrientes de forma automatizada según análisis del terreno.</p>
        </div>
      </div>
    </main>

    <footer>
      <p>&copy; 2025 AgroTrack | Tecnología para el crecimiento sostenible</p>
    </footer>
  </body>
  </html>
  `,

  'contacto.html': `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Contacto - AgroTrack</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <div class="logo">
        <h1>🌾 AgroTrack</h1>
      </div>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto" class="activo">Contacto</a>
        <a href="/login">Login</a>
      </nav>
    </header>

    <main>
      <h2>Contáctenos</h2>
      <p>Complete el siguiente formulario para enviarnos su consulta:</p>

      <form class="formulario" action="/contacto/cargar" method="POST">
        <label>Nombre:</label>
        <input type="text" name="nombre" required>

        <label>Email:</label>
        <input type="email" name="email" required>

        <label>Mensaje:</label>
        <textarea name="mensaje" rows="5" required></textarea>

        <button type="submit">Enviar Consulta</button>
      </form>

      <div class="acciones">
        <a href="/contacto/listar">📜 Ver consultas recibidas</a>
      </div>
    </main>

    <footer>
      <p>&copy; 2025 AgroTrack | Innovación en gestión agropecuaria</p>
    </footer>
  </body>
  </html>
  `,

  'login.html': `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Login - AgroTrack</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <div class="logo">
        <h1>🌾 AgroTrack</h1>
      </div>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto">Contacto</a>
        <a href="/login" class="activo">Login</a>
      </nav>
    </header>

    <main>
      <h2>Ingreso al Portal</h2>
      <p>Ingrese sus credenciales de acceso.</p>

      <form class="formulario" action="/auth/recuperar" method="POST">
        <label>Usuario:</label>
        <input type="text" name="usuario" required>

        <label>Clave:</label>
        <input type="password" name="clave" required>

        <button type="submit">Acceder</button>
      </form>
    </main>

    <footer>
      <p>&copy; 2025 AgroTrack | Portal Interno</p>
    </footer>
  </body>
  </html>
  `,

  'estilos.css': `
  /* ================================
     AgroTrack - Estilos Generales
     Paleta: Verde Bosque (#1D713B), Fondo Gris Claro (#F7F7F7)
     ================================ */

  * {
    box-sizing: border-box;
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    background-color: #F7F7F7;
    color: #222;
    margin: 0;
    padding: 0;
  }

  header {
    background-color: #1D713B;
    color: #fff;
    padding: 20px;
    text-align: center;
  }

  header .logo h1 {
    margin: 0;
    font-size: 1.8em;
  }

  header .slogan {
    font-size: 0.9em;
    opacity: 0.9;
  }

  nav {
    margin-top: 10px;
  }

  nav a {
    color: #fff;
    text-decoration: none;
    margin: 0 10px;
    font-weight: bold;
    padding: 6px 10px;
    border-radius: 4px;
    transition: background-color 0.2s ease-in-out, opacity 0.2s;
  }

  nav a:hover {
    background-color: #14542B;
  }

  nav a.activo {
    background-color: #14542B;
  }

  main {
    max-width: 900px;
    margin: 30px auto;
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
  }

  h2 {
    color: #1D713B;
    margin-top: 0;
  }

  p {
    line-height: 1.6;
  }

  .hero {
    text-align: center;
  }

  .boton-principal {
    display: inline-block;
    background-color: #1D713B;
    color: #fff;
    padding: 10px 20px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
    transition: opacity 0.2s ease-in-out;
  }

  .boton-principal:hover {
    opacity: 0.9;
  }

  .grid-productos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .card {
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    transition: transform 0.2s ease;
  }

  .card:hover {
    transform: translateY(-5px);
  }

  .formulario {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }

  .formulario input,
  .formulario textarea {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1em;
  }

  .formulario input:focus,
  .formulario textarea:focus {
    border-color: #1D713B;
    outline: none;
  }

  .formulario button {
    background-color: #1D713B;
    color: #fff;
    border: none;
    padding: 10px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s ease-in-out;
  }

  .formulario button:hover {
    background-color: #14542B;
  }

  .acciones {
    margin-top: 20px;
  }

  .acciones a {
    color: #1D713B;
    text-decoration: none;
    font-weight: bold;
  }

  .acciones a:hover {
    text-decoration: underline;
  }

  footer {
    text-align: center;
    padding: 15px;
    background-color: #1D713B;
    color: #fff;
    margin-top: 40px;
    font-size: 0.9em;
  }
  `
};


// ----- Inicialización: crear carpetas y archivos si faltan -----
function ensureInitialFiles(callback) {
  // Crear public/ y data/ de forma asíncrona
  fs.mkdir(PUBLIC_DIR, { recursive: true }, (err) => {
    if (err) return callback(err);
    fs.mkdir(DATA_DIR, { recursive: true }, (err2) => {
      if (err2) return callback(err2);

      // Crear archivos públicos si no existen (usar fs.stat para verificar)
      const tasks = Object.keys(DEFAULT_FILES).map((filename) => {
        return (cb) => {
          const fullPath = path.join(PUBLIC_DIR, filename);
          fs.stat(fullPath, (statErr) => {
            if (!statErr) {
              // ya existe: no sobrescribir
              return cb(null);
            }
            // no existe -> crear con contenido por defecto
            fs.writeFile(fullPath, DEFAULT_FILES[filename], 'utf8', (wErr) => {
              if (wErr) return cb(wErr);
              cb(null);
            });
          });
        };
      });

      // Asegurar que data/consultas.txt exista (vacío si no existe)
      tasks.push((cb) => {
        fs.stat(CONSULTAS_FILE, (stErr) => {
          if (!stErr) return cb(null); // existe
          // crear archivo vacío
          fs.writeFile(CONSULTAS_FILE, '', 'utf8', (wErr) => {
            if (wErr) return cb(wErr);
            cb(null);
          });
        });
      });

      // Ejecutar tareas en serie simple
      let i = 0;
      function next(errTask) {
        if (errTask) return callback(errTask);
        const t = tasks[i++];
        if (!t) return callback(null);
        t(next);
      }
      next();
    });
  });
}


// ================================
// 🌾 AgroTrack - Respuestas dinámicas estilizadas (NUEVAS FUNCIONES)
// ================================

// Función auxiliar para enviar HTML correctamente
function sendHTML(res, statusCode, html) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// Escapa caracteres peligrosos
function escapeHtml(unsafe) {
  return unsafe.replace(/[&<"'>]/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

// ================================
// 404 - Página No Encontrada
// ================================
function send404(res, requestedPath) {
  const html = `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>404 - Página no encontrada | AgroTrack</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <h1>AgroTrack</h1>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto.html">Contacto</a>
        <a href="/login.html">Login</a>
      </nav>
    </header>
    <main>
      <h2>404 - Página no encontrada</h2>
      <p>La ruta <strong>${escapeHtml(requestedPath)}</strong> no existe en nuestro servidor.</p>
      <p><a href="/" class="btn">Volver al inicio</a></p>
    </main>
    <footer>
      <p>© 2025 AgroTrack | Tecnología e Innovación Agroindustrial</p>
    </footer>
  </body>
  </html>`;
  sendHTML(res, 404, html);
}

// ================================
// 500 - Error Interno del Servidor
// ================================
function send500(res, err) {
  const html = `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Error interno del servidor | AgroTrack</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <h1>AgroTrack</h1>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto.html">Contacto</a>
        <a href="/login.html">Login</a>
      </nav>
    </header>
    <main>
      <h2>500 - Error interno del servidor</h2>
      <p>Ha ocurrido un error inesperado al procesar su solicitud.</p>
      <pre>${escapeHtml(err.message)}</pre>
      <p><a href="/" class="btn">Volver al inicio</a></p>
    </main>
    <footer>
      <p>© 2025 AgroTrack | Tecnología e Innovación Agroindustrial</p>
    </footer>
  </body>
  </html>`;
  sendHTML(res, 500, html);
}

// ================================
// POST /auth/recuperar - Resultado del Login
// ================================
function handleAuthRecuperar(res, body) {
  const params = new URLSearchParams(body);
  const usuario = params.get('usuario') || '';
  const clave = params.get('clave') || '';

  const html = `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Resultado del login | AgroTrack</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <h1>AgroTrack</h1>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto.html">Contacto</a>
        <a href="/login.html">Login</a>
      </nav>
    </header>
    <main>
      <h2>Datos recibidos</h2>
      <div class="card">
        <p><strong>Usuario:</strong> ${escapeHtml(usuario)}</p>
        <p><strong>Clave:</strong> ${escapeHtml(clave)}</p>
      </div>
      <p><a href="/login.html" class="btn">Volver al login</a></p>
    </main>
    <footer>
      <p>© 2025 AgroTrack | Tecnología e Innovación Agroindustrial</p>
    </footer>
  </body>
  </html>`;
  sendHTML(res, 200, html);
}

// ================================
// POST /contacto/cargar - Confirmación de envío
// ================================
function handleContactoCargar(res, nombre, email, mensaje) {
  const html = `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Gracias por su consulta | AgroTrack</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <h1>AgroTrack</h1>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto.html">Contacto</a>
        <a href="/login.html">Login</a>
      </nav>
    </header>
    <main>
      <h2>¡Gracias por su consulta!</h2>
      <div class="card">
        <p>Hemos recibido su mensaje correctamente.</p>
        <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      </div>
      <p><a href="/" class="btn">Volver al inicio</a></p>
    </main>
    <footer>
      <p>© 2025 AgroTrack | Tecnología e Innovación Agroindustrial</p>
    </footer>
  </body>
  </html>`;
  sendHTML(res, 200, html);
}

// ================================
// GET /contacto/listar - Consultas guardadas
// ================================
function handleContactoListar(res, consultas) {
  const contenido = consultas.trim() 
    ? `<pre>${escapeHtml(consultas)}</pre>`
    : `<p>Aún no hay consultas registradas.</p>`;

  const html = `
  <!doctype html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Consultas recibidas | AgroTrack</title>
    <link rel="stylesheet" href="/estilos.css">
  </head>
  <body>
    <header>
      <h1>AgroTrack</h1>
      <nav>
        <a href="/">Inicio</a>
        <a href="/productos.html">Productos</a>
        <a href="/contacto.html">Contacto</a>
        <a href="/login.html">Login</a>
      </nav>
    </header>
    <main>
      <h2>Consultas recibidas</h2>
      <div class="card">
        ${contenido}
      </div>
      <p><a href="/contacto.html" class="btn">Volver al formulario</a></p>
    </main>
    <footer>
      <p>© 2025 AgroTrack | Tecnología e Innovación Agroindustrial</p>
    </footer>
  </body>
  </html>`;
  sendHTML(res, 200, html);
}

// ----- Servidor HTTP y ruteo -----
const server = http.createServer((req, res) => {
  // Parsear URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Rutas GET
  if (req.method === 'GET') {
    // Ruta base '/'
    if (pathname === '/') {
      // Servir public/index.html
      const p = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(p, 'utf8', (err, data) => {
        if (err) {
          // Si no encuentra -> 404 o 500 según el error
          if (err.code === 'ENOENT') return send404(res, '/');
          return send500(res, err);
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        return res.end(data);
      });
      return;
    }

    // Ruta /login -> servir login.html
    if (pathname === '/login') {
      const p = path.join(PUBLIC_DIR, 'login.html');
      fs.readFile(p, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') return send404(res, '/login');
          return send500(res, err);
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        return res.end(data);
      });
      return;
    }

    // Ruta /contacto -> servir contacto.html
    if (pathname === '/contacto') {
      const p = path.join(PUBLIC_DIR, 'contacto.html');
      fs.readFile(p, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') return send404(res, '/contacto');
          return send500(res, err);
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        return res.end(data);
      });
      return;
    }

    // Ruta /contacto/listar -> leer data/consultas.txt y mostrar
    if (pathname === '/contacto/listar') {
      fs.readFile(CONSULTAS_FILE, 'utf8', (err, content) => {
        if (err) {
          // Si no existe, considerar el contenido vacío y dejar que handleContactoListar lo maneje.
          if (err.code === 'ENOENT') {
            return handleContactoListar(res, '');
          }
          return send500(res, err);
        }
        // Usar la nueva función estilizada
        return handleContactoListar(res, content || '');
      });
      return;
    }

    // Rutas estáticas: /productos.html, /estilos.css, otros ficheros dentro de public/
    // Evitar acceso fuera de la carpeta public con path.normalize y comprobación
    // Mapear pathname directo a public/<nombre>
    const requestedFile = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const safePath = path.normalize(requestedFile).replace(/^(\.\.(\/|\\|$))+/, ''); // evitar ../
    const filePath = path.join(PUBLIC_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // No es un archivo público -> 404
        return send404(res, pathname);
      }
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';
      // Leer archivo de forma asíncrona (binario si no es .html/.css/.txt)
      const encoding = ext === '.html' || ext === '.css' || ext === '.txt' || ext === '.js' ? 'utf8' : null;
      fs.readFile(filePath, encoding, (rfErr, data) => {
        if (rfErr) {
          return send500(res, rfErr);
        }
        res.writeHead(200, { 'Content-Type': mime });
        return res.end(data);
      });
    });
    return;
  } // fin GET

  // Rutas POST
  if (req.method === 'POST') {
    // POST /auth/recuperar -> login demo
    if (pathname === '/auth/recuperar') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        // (Opcional) limitar tamaño -> si es muy grande, terminar con 413
        if (body.length > 1e6) {
          // 1MB límite arbitrario
          res.writeHead(413, { 'Content-Type': 'text/plain' });
          res.end('Payload too large');
          req.connection.destroy();
        }
      });
      req.on('end', () => {
        try {
          // Llama a la nueva función estilizada, que maneja la extracción de parámetros y la respuesta HTML.
          return handleAuthRecuperar(res, body);
        } catch (e) {
          return send500(res, e);
        }
      });
      return;
    }

    // POST /contacto/cargar -> guardar consulta en data/consultas.txt
    if (pathname === '/contacto/cargar') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        if (body.length > 1e6) {
          res.writeHead(413, { 'Content-Type': 'text/plain' });
          res.end('Payload too large');
          req.connection.destroy();
        }
      });
      req.on('end', () => {
        try {
          const params = new URLSearchParams(body);
          const nombre = params.get('nombre') || '(sin nombre)';
          const email = params.get('email') || '(sin email)';
          const mensaje = params.get('mensaje') || '(sin mensaje)';

          // Formatear la entrada con fecha
          const now = new Date();
          const fechaStr = now.toLocaleString('es-AR'); // formato local (Argentina)
          const entrada = `---\nFecha: ${fechaStr}\nNombre: ${nombre}\nEmail: ${email}\nMensaje:\n${mensaje}\n\n`;

          // Guardar usando fs.appendFile (asíncrono)
          fs.appendFile(CONSULTAS_FILE, entrada, 'utf8', (err) => {
            if (err) {
              return send500(res, err);
            }
            // Responder con la nueva función estilizada
            return handleContactoCargar(res, nombre, email, mensaje);
          });
        } catch (e) {
          return send500(res, e);
        }
      });
      return;
    }

    // Si POST a otra ruta -> 404
    send404(res, pathname);
    return;
  } // fin POST

  // Otros métodos (PUT, DELETE, etc.) -> 404/No soportado
  send404(res, `${req.method} ${pathname}`);
});

// ----- Iniciar proceso: asegurar estructura y luego escuchar puerto -----
ensureInitialFiles((err) => {
  if (err) {
    console.error('Error al crear archivos iniciales:', err);
    process.exit(1);
  }
  server.listen(PORT, () => {
    console.log(`AgroTrack MVP server corriendo en http://localhost:${PORT}`);
    console.log(`Carpeta pública: ${PUBLIC_DIR}`);
    console.log(`Archivo de consultas: ${CONSULTAS_FILE}`);
  });
});

/**
 * Nota sobre seguridad / producción:
 * - Este servidor es un MVP educativo. En producción no se debe usar este servidor
 *   sin las mejoras adecuadas: sanitización completa, CSRF, validación más estricta,
 *   manejo de sesiones/HTTPS, límites de concurrencia, etc.
 *
 * Comentarios por sección:
 * - Inicialización: ensureInitialFiles crea public/ y data/ y escribe archivos por defecto
 * - Enrutamiento GET: maneja '/', '/login', '/contacto', '/contacto/listar' y archivos estáticos
 * - Enrutamiento POST: maneja '/auth/recuperar' y '/contacto/cargar' leyendo el cuerpo con
 *   req.on('data') y req.on('end'), usando new URLSearchParams(body) para parsear form-data urlencoded.
 * - Manejo de archivos: todas las operaciones con fs.* son asíncronas (readFile, appendFile, writeFile)
 * - Errores: send404 y send500 envían páginas HTML amigables con códigos 404 y 500 respectivamente.
 */