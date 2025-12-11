<<<<<<< HEAD
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
=======
📸 Generador de Registro Fotográfico (HTML + Canvas + JS)

Este proyecto permite subir hasta 6 imágenes, ordenarlas en una plantilla tipo “Registro Fotográfico” y generar un documento en formato imagen (Canvas) con títulos, marcas de agua y diseño limpio.
Las imágenes son opcionales y, si falta alguna, el sistema genera un placeholder automático.

🚀 Características

✔️ Subida de 1 a 6 fotos (no obligatorio llenar todos los campos)
✔️ Vista previa generada en un <canvas>
✔️ Diseño limpio con títulos, bordes, placeholders y timestamp
✔️ Generación automática del registro fotográfico en formato imagen
✔️ Botón de descarga
✔️ Inputs estilizados e interfaz moderna e interactiva

🧩 Tecnologías utilizadas

HTML5

CSS3

JavaScript Vanilla

Canvas API

📁 Estructura del proyecto
/project
 ├── index.html
 ├── styles.css
 ├── script.js
 └── assets/

🖼️ Funcionamiento

El usuario selecciona hasta 6 imágenes en los inputs estilizados.

Al presionar Generar, se crea una plantilla en el canvas:

Cada celda lleva su título: "Registro fotográfico NºX".

Si hay imagen → se ajusta tipo “cover”.

Si no → se inserta un placeholder “Sin imagen”.

Se agrega una marca de agua con fecha/hora.

El usuario puede descargar la imagen generada.

▶️ Uso

Abrir index.html en cualquier navegador moderno.
No requiere servidor.

📦 Descarga y uso local
git clone https://github.com/tuusuario/registro-fotografico.git
cd registro-fotografico
open index.html

🤝 Contribuciones

Las contribuciones son bienvenidas.
Puedes proponer mejoras mediante issues o pull requests.

📄 Licencia

MIT License – libre para usar y modificar.
>>>>>>> 560cb071ca6759f402c0d28a57ad339a66d9acec
