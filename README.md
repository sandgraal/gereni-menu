# 🍽️ Gereni Bar y Restaurante – Menú Editable

Este repositorio contiene el menú oficial del Gereni Bar y Restaurante.
Está diseñado para que cualquier persona pueda **editar precios, platos o descripciones fácilmente**.

## 📂 Estructura

index.html → Página principal  
menu.html → Menú cargado dinámicamente  
content/menu.md → Fuente de verdad del contenido  
data/menu.json → Archivo generado para la web  
styles/ → Estilos visuales  
scripts/ → Código para cargar el menú  
assets/ → Imágenes e íconos  
assets/README.md → Pasos para recibir logos y texturas  
tools/sync-menu.js → Script para sincronizar Markdown → JSON
tools/validate-prices.js → Valida que los precios sigan el formato `₡0.000`
tools/validate-social-links.js → Revisa que los enlaces sociales sigan usando URLs válidas
design/canva/licenses/README.md → Registro detallado de licencias y evidencias
workflow/reminders.md → Agenda propuesta para recordatorios operativos
docs/extract-images-from-pdf.md → Guía para extraer y limpiar fotos del menú original
docs/contributor-onboarding.md → Checklist de incorporación para nuevas personas colaboradoras

## ⚙️ Requisitos

- Node.js 18+ para ejecutar `tools/sync-menu.js`.
- Python 3.8+ (opcional) para `tools/qr/generate.py`.

## ✏️ Cómo editar el menú

1. Abre `content/menu.md` y actualiza nombres, precios o descripciones (formato `₡5.650`). Para una guía paso a paso del flujo completo (ramas, pruebas y exportaciones), consulta `docs/contributor-onboarding.md`. Para gestionar los especiales y novedades de la portada, sigue la guía de `docs/home-highlights.md` que explica el flujo distinto para `data/home-highlights.json`.
2. Ejecuta `node tools/sync-menu.js` para regenerar `data/menu.json`.
3. Ejecuta `npm run check:all` (valida precios, enlaces sociales, render y pruebas del parser de Markdown).
   - Si trabajas sin conexión o la red bloquea las peticiones a Facebook/Instagram, usa `SKIP_SOCIAL_LINK_CHECK=1 npm run check:all`.
4. Haz commit y sube los cambios.
5. Espera 1‑2 minutos y revisa tu sitio en:

👉 `https://sandgraal.github.io/gereni-menu/menu.html`

- Si la plantilla de Canva aún no tiene acceso compartido, sigue `design/canva/template-link.md` para habilitar el enlace editable antes de copiar texto.
- Para mostrar el feed correcto, reemplaza la URL de `data-href` en `index.html` con la página oficial de Facebook.

## 🖰️ Versión para impresión

- Ejecuta `npm run export:menu` para generar `output/Menu_Gereni_print.pdf` y las variantes digitales sincronizadas con temas e idiomas (`Menu_Gereni_digital_es_dark.pdf`, `Menu_Gereni_digital_es_light.pdf`, `Menu_Gereni_digital_en_dark.pdf`, `Menu_Gereni_digital_en_light.pdf`). El archivo `Menu_Gereni_digital.pdf` se mantiene como alias de la versión en español oscuro para compatibilidad.
- Alternativamente, abre `menu.html`, presiona **Ctrl + P** y selecciona “Guardar como PDF”.  
  Los estilos de impresión (`styles/print.css`) se aplican automáticamente.
- Cada push en `main` dispara el flujo **Update Menu Artifacts** en GitHub Actions. Este sincroniza `data/menu.json`, regenera los PDFs y los commitea si hay cambios. También puedes lanzarlo manualmente desde la pestaña “Actions”.

## 🎨 Créditos

Diseño y estructura por ChatGPT + colaboración del equipo de Gereni.
Licencia MIT.
