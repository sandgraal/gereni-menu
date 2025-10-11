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
tools/sync-menu.js → Script para sincronizar Markdown → JSON

## ⚙️ Requisitos

- Node.js 18+ para ejecutar `tools/sync-menu.js`.
- Python 3.8+ (opcional) para `tools/qr/generate.py`.

## ✏️ Cómo editar el menú

1. Abre `content/menu.md` y actualiza nombres, precios o descripciones (formato `₡5.650`).
2. Ejecuta `node tools/sync-menu.js` para regenerar `data/menu.json`.
3. Haz commit y sube los cambios.
4. Espera 1‑2 minutos y revisa tu sitio en:

👉 `https://sandgraal.github.io/gereni-menu/menu.html`

## 🖰️ Versión para impresión

- Ejecuta `npm run export:menu` para generar `output/Menu_Gereni_print.pdf` y `output/Menu_Gereni_digital.pdf`.
- Alternativamente, abre `menu.html`, presiona **Ctrl + P** y selecciona “Guardar como PDF”.  
  Los estilos de impresión (`styles/print.css`) se aplican automáticamente.

## 🎨 Créditos

Diseño y estructura por ChatGPT + colaboración del equipo de Gereni.
Licencia MIT.
