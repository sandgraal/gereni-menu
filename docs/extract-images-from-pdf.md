# Flujo Externo: Imágenes del Menú con Fondo Transparente

> Usa este procedimiento cuando necesites extraer fotografías del PDF original del menú y convertirlas a PNG con transparencia antes de integrarlas al sitio o a la maqueta Canva.

## 1. Extraer imágenes desde el PDF

### Opción A — Canva
1. Sube el PDF original (`output/MENU GERENI-Original.pdf`) a Canva.
2. Abre la página que contiene la foto que necesitas.
3. Selecciona la imagen → `Restablecer recorte` para obtener la versión completa.
4. Haz clic derecho → `Descargar imagen` (PNG o JPG).

### Opción B — Photopea (edición en el navegador)
1. Abre [https://www.photopea.com/](https://www.photopea.com/).
2. `Archivo → Abrir` y selecciona el PDF original.
3. En la ventana emergente, elige la página donde se ve la foto.
4. Photopea importará la página como un lienzo independiente; utiliza la herramienta de selección para aislar la imagen y copia (`Ctrl/Cmd+C`) a un nuevo lienzo (`Archivo → Nuevo desde portapapeles`).
5. Exporta el recorte en PNG (`Archivo → Exportar como → PNG`).

> Si prefieres Photoshop, GIMP, Preview (macOS) u otra herramienta, el objetivo es llegar a un PNG o JPG de la imagen aislada.

## 2. Eliminar el fondo
1. Visita [https://www.remove.bg/](https://www.remove.bg/) o un servicio equivalente.
2. Carga el PNG/JPG obtenido en el paso anterior.
3. Ajusta, si es necesario, las zonas de recorte (botones `Erase/Restore`).
4. Descarga el resultado en PNG (con transparencia).

## 3. Guardar en el repositorio
1. Mueve el PNG transparente a `assets/photos/` (crea la carpeta si no existe).
2. Nombra el archivo usando el formato `categoria-nombre-plato.png` (ej. `gustitos-fajitas-mixtas.png`).
3. Si la imagen reemplaza una existente, archiva la versión anterior dentro de `assets/photos/archive/YYYY-MM/` usando la plantilla `assets/ARCHIVE_NOTES_TEMPLATE.md`.

## 4. Integración
- **Web (`menu.html` / `styles/`):** Inserta la imagen en la sección correspondiente y ajusta estilos para mantener consistencia visual.
- **Canva:** Sube el PNG transparente y colócalo donde corresponda, respetando la jerarquía visual.
- **Exportes PDF:** Regenera `Menu_Gereni_print.pdf` y las variantes digitales (`Menu_Gereni_digital_es_dark.pdf`, `Menu_Gereni_digital_es_light.pdf`, `Menu_Gereni_digital_en_dark.pdf`, `Menu_Gereni_digital_en_light.pdf`) si los cambios impactan la versión final.

## Checklist rápido
- [ ] Imagen extraída del PDF con la mayor resolución disponible.
- [ ] Fondo eliminado y guardado como PNG con transparencia.
- [ ] Archivo guardado en `assets/photos/` con nombre descriptivo.
- [ ] Licencia/documentación actualizada en `design/canva/licenses/README.md` si aplica.
- [ ] Cambios integrados en web/Canva y exportes regenerados (si se requiere).
