# Exportes del Menú — Gerení

Guarda aquí las versiones finales exportadas desde Canva. Mantén solo los archivos vigentes y registra reemplazos en el historial de commits.

## Convenciones de Archivos
- `Menu_Gereni_print.pdf`: Versión para imprenta (CMYK o perfil según imprenta, 300 dpi, con sangrado y marcas).
- `Menu_Gereni_digital_es_dark.pdf`: Versión digital en español con tema oscuro (valor por defecto). También se publica como `Menu_Gereni_digital.pdf` para compatibilidad.
- `Menu_Gereni_digital_es_light.pdf`: Versión digital en español con tema claro.
- `Menu_Gereni_digital_en_dark.pdf`: Versión digital en inglés con tema oscuro.
- `Menu_Gereni_digital_en_light.pdf`: Versión digital en inglés con tema claro.
- Versiones anteriores deben moverse a una subcarpeta con la fecha (`archivo/2024-10/Menu_Gereni_print.pdf`) si necesitan conservarse.

## Checklist Antes de Exportar
- Sincronizar contenido (`node tools/sync-menu.js`) y actualizar la plantilla en Canva.
- Revisar checklist visual (`design/canva/guide.md`) y lingüístico (`content/style-checklist.md`).
- Validar código QR de alimentos y bebidas.
- Realizar prueba de impresión rápida para confirmar contraste y márgenes.

## Registro
- Anota la fecha y descripción del cambio en el commit que agrega los PDF.
- Crea tag `vYYYY.MM.menu` si la versión se entrega a imprenta.

## Cómo archivar versiones anteriores
1. Crea una carpeta dentro de `output/archive/` con formato `YYYY-MM` (ej. `output/archive/2025-10/`).
2. Mueve allí los PDFs previos (`Menu_Gereni_print.pdf`, `Menu_Gereni_digital_es_dark.pdf`, `Menu_Gereni_digital_es_light.pdf`, `Menu_Gereni_digital_en_dark.pdf`, `Menu_Gereni_digital_en_light.pdf`) conservando el nombre original.
3. Añade un archivo `NOTAS.md` en la carpeta (puedes copiar `output/archive/NOTAS_TEMPLATE.md`) con fecha, motivo del reemplazo y responsable.
4. Actualiza `BACKLOG.md` o el commit con referencia a la carpeta archivada.
5. (Opcional) Comprime la carpeta archivada y súbela a la nube como respaldo adicional.

> Consejo: Mantén solo la última versión vigente en la raíz de `output/` para evitar confusiones al compartir archivos.
