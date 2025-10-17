# AgroTrack - Portal Interno (MVP)

Este proyecto implementa la primera versión (MVP) de un portal web interno para la pyme agroindustrial "AgroTrack", utilizando Node.js con módulos nativos exclusivamente (http, fs, path, url, os), sin el uso de frameworks como Express. Cumple con la Actividad Obligatoria 1 de Programación de Aplicaciones Web II.

---

### Información del Estudiante

- Nombre: María Agostina Garaizabal Gordillo
- Legajo: 46587065 (DNI)

---

### Instrucciones para Ejecutar

1.  Tener Node.js instalado.
2.  Clonar el repositorio.
3.  Navegar a la carpeta raíz del proyecto (agrotrack/).
4.  Ejecutar el servidor con el siguiente comando:

    ```bash
    node server.js
    ```

5.  El servidor se iniciará en el puerto8888 (Puerto utilizado: 8888, según la recomendación).

6.  Abre tu navegador y navega a:
    `http://localhost:8888`

---

### Descripción de Rutas

GET / Muestra la página principal, sirviendo el archivo public/index.html.

GET /productos.html o GET /contacto.html Sirve las páginas estáticas correspondientes desde la carpeta public/.

GET /login Muestra el formulario HTML para el inicio de sesión de demostración.

POST /auth/recuperar Procesa los datos enviados desde el formulario de login. Lee el cuerpo del mensaje, usa URLSearchParams para extraer los valores de usuario y clave, y devuelve un HTML con un mensaje mostrando los datos recibidos.

GET /contacto Muestra el formulario HTML de contacto.

POST /contacto/cargar Guarda los datos del formulario de contacto (nombre, email, mensaje). Lee el cuerpo del mensaje, crea una entrada de texto con la fecha actual, y la guarda en el archivo data/consultas.txt usando fs.appendFile. Responde con un HTML de agradecimiento.

GET /contacto/listar Lee el archivo data/consultas.txt. Si tiene contenido, lo muestra dentro de una etiqueta <pre> en HTML. Si el archivo está vacío o no existe, muestra el mensaje "Aún no hay consultas".

GET /\*.ext (e.g., /estilos.css) Sirve cualquier otro archivo estático (CSS, JS, imágenes) ubicado en public/, asegurando el MIME type adecuado.

Cualquier otra ruta Devuelve una página de error 404 - No Encontrada con un mensaje claro y un enlace a la raíz /.

---

### Ejemplo de Salida

Al ejecutar el servidor:

AgroTrack MVP server corriendo en http://localhost:8888
Carpeta pública: /ruta/al/proyecto/agrotrack/public
Archivo de consultas: /ruta/al/proyecto/agrotrack/data/consultas.txt

---

### Justificación Técnica

#### Partes Asíncronas (Operaciones I/O)

Todas las operaciones de Entrada/Salida (I/O) del servidor se manejan de forma asíncrona para asegurar que el servidor no se bloquee y pueda manejar múltiples peticiones simultáneamente:

- Lectura de archivos estáticos: Se utiliza `fs.readFile` para servir archivos HTML y CSS (incluyendo el index).
- Lectura de consultas: La ruta `/contacto/listar` utiliza `fs.readFile(CONSULTAS_FILE, 'utf8', ...)` para obtener el contenido de las consultas.
- Escritura de consultas: La ruta `/contacto/cargar` utiliza `fs.appendFile` para añadir la nueva consulta a `data/consultas.txt` sin sobrescribir el contenido existente.
- Inicialización: La función `ensureInitialFiles` utiliza `fs.mkdir`, `fs.stat` y `fs.writeFile` de forma asíncrona para crear la estructura de directorios (`public/`, `data/`) y los archivos por defecto si no existen.
- Manejo de POST: La recepción del cuerpo de los formularios POST se gestiona asíncronamente a través de los eventos `req.on('data')` y `req.on('end')`.

#### Manejo de MIME

Se utiliza un objeto `MIME` en `server.js` para mapear las extensiones de archivo (`.html`, `.css`, etc.) a su respectivo `Content-Type` correcto (ej. `text/html; charset=utf-8` o `text/css; charset=utf-8`). Esto asegura que el navegador interprete correctamente el contenido de los archivos estáticos servidos.

#### Manejo de Errores y Códigos de Estado

El servidor maneja los códigos de estado HTTP y los errores del sistema de la siguiente manera:

- 200 (OK): Utilizado para todas las respuestas exitosas, incluyendo el servicio de archivos estáticos y las respuestas dinámicas de POST/GET.
- 404 (Not Found): Implementado con la función `send404`, que se dispara cuando una URL solicitada no coincide con ninguna ruta definida o cuando se intenta acceder a un archivo estático que no existe (`err.code === 'ENOENT'`). Envía una respuesta HTML clara y personalizada.
- 500 (Internal Server Error): Implementado con la función `send500`, que se llama dentro de los _callbacks_ de I/O (ej., `fs.readFile` o `fs.appendFile`) cuando ocurre un error de lectura/escritura del sistema de archivos. Envía una respuesta HTML con el mensaje "Error interno del servidor".
