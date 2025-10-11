# Guía de Activos — Menú Gerení

## Logos
- Guarda los archivos oficiales en `assets/logo/` (crea la carpeta si aún no existe).
- Nomenclatura sugerida:
  - `logo-gereni-color.<ext>` para la versión principal.
  - `logo-gereni-blanco.<ext>` para la versión en blanco.
  - `logo-gereni-vector.<ext>` para el archivo maestro (AI, SVG, PDF).
- Al recibir el logo original:
  1. Sube el archivo sin modificar a `assets/logo/original/`.
  2. Genera las versiones optimizadas (PNG transparente 300 dpi y SVG).
  3. Si necesitas recolor, usa Canva o un editor vectorial y documenta el proceso en `design/canva/guide.md` (sección de licencias).

## Iconografía e ilustraciones
- Almacena íconos en `assets/icons/` con nombres descriptivos (`toucan.svg`, `volcan.svg`).
- Documenta la fuente/licencia de cada ícono en la tabla de `design/canva/guide.md`.

## Texturas y fondos
- Crea `assets/textures/` para papeles, fibras o ilustraciones de fondo.
- Incluye un archivo `NOTAS.md` dentro de la carpeta indicando origen, licencia y ajustes de color si los hay.

## Control de versiones
- Evita eliminar archivos antiguos; mueve versiones obsoletas a una subcarpeta `archive/YYYY-MM/`.
- Agrega un `README` o `NOTAS.md` (usa `assets/ARCHIVE_NOTES_TEMPLATE.md` como base) en cada subcarpeta de archivo describiendo qué cambió y por qué.

> Tip: Si el dueño proporciona archivos vía Google Drive o correo, descarga y guarda la copia original en la carpeta correspondiente antes de exportar versiones optimizadas.
