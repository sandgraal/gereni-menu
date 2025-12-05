# Guía de promociones

Las imágenes colocadas en `assets/promos/` se muestran automáticamente en la vitrina de anuncios de la página de inicio. Para mantener una presentación consistente y nítida, utiliza las siguientes recomendaciones.

## Formatos recomendados
- **JPG/JPEG**: ideal para fotografías o composiciones con muchos degradados.
- **PNG**: úsalo cuando necesites conservar transparencias o texto muy definido.
- **WEBP/AVIF**: preferibles cuando dispongas de la exportación, ya que ofrecen mejor compresión.
- **MP4**: clips cortos (silenciados, en bucle) para promociones que necesiten movimiento.
- **SVG**: solo para ilustraciones vectoriales sin efectos complejos de rasterizado.

Evita GIF animados u otros formatos que puedan distraer o aumentar el peso de la página. Para video, limita la duración a pocos segundos y exporta sin audio perceptible para que pueda reproducirse automáticamente.

## Dimensiones y composición
- Diseña en orientación **vertical** con relación de aspecto entre **3:4 y 4:5** (ej. 1080 × 1440 px).
- Exporta siempre al menos al doble del ancho mostrado (≥ 900 px) para pantallas de alta densidad.
- Mantén márgenes seguros de 32 px alrededor de textos o logotipos para que no queden cortados.

## Peso y optimización
- Procura que cada archivo pese **menos de 450 KB**. Usa herramientas de compresión (TinyPNG, Squoosh, etc.).
- Asigna nombres descriptivos en minúsculas y con guiones (ej. `2025-03-cocktail-noche.jpg`).

## Flujo de actualización
1. Coloca los archivos dentro de `assets/promos/` siguiendo las recomendaciones anteriores.
2. Ejecuta `npm run build:promos` (o cualquier flujo que invoque `npm run build:fallback`) para actualizar el manifiesto.
3. Sube los cambios junto con el archivo `promos.json` generado automáticamente.

Los anuncios se ordenan por fecha de modificación más reciente, mostrando primero las campañas más nuevas.
