# 🍽️ Gereni Bar y Restaurante – Menú Editable

Repositorio oficial del **menú digital y para impresión** del Gereni Bar y Restaurante.  
Permite editar precios, descripciones y fotografías fácilmente, generando automáticamente versiones web y PDF.

---

## 📂 Estructura

| Ruta | Descripción |
|------|--------------|
| `index.html` | Página principal |
| `menu.html` | Menú dinámico cargado desde `data/menu.json` |
| `content/menu.md` | Fuente editable (Markdown) del menú |
| `data/menu.json` | Versión generada para la web |
| `ai/scripts/` | Scripts automatizados (análisis, sincronización, optimización) |
| `assets/` | Imágenes, íconos y logotipos |
| `tools/validate-prices.js` | Valida formato `₡0.000` |
| `tools/sync-menu.js` | Sincroniza Markdown → JSON |
| `tools/validate-social-links.js` | Verifica enlaces sociales válidos |
| `service-worker.js` | Soporte PWA y modo offline |
| `design/canva/licenses/` | Evidencias y licencias de diseño |
| `PROJECT_PLAN.md` | Plan y progreso consolidado del proyecto |

---

## ⚙️ Requisitos

- **Node.js 18+**  
  Ejecuta los scripts de sincronización y exportación.  
- **Python 3.8+ (opcional)**  
  Para generar códigos QR en `tools/qr/`.

Instalar dependencias:
```bash
npm install
```

---

## ✏️ Cómo editar el menú

1. Edita `content/menu.md`  
   - Usa el formato `₡5.650` para precios.  
   - Respeta los encabezados de sección y formato bilingüe (ES/EN).  
2. Sincroniza el contenido:
   ```bash
   node tools/sync-menu.js
   ```
3. Valida consistencia:
   ```bash
   npm run check:all
   ```
   Si trabajas sin red:
   ```bash
   SKIP_SOCIAL_LINK_CHECK=1 npm run check:all
   ```
4. Exporta versiones PDF:
   ```bash
   npm run export:menu
   ```
   Si falla Puppeteer, instala:
   ```bash
   sudo apt install libatk1.0-0
   ```
5. Haz commit y sube los cambios:
   ```bash
   git add .
   git commit -m "Actualización de menú"
   git push
   ```

---

## 🚀 Automatización y CI/CD

Scripts en `ai/scripts/`:
- `analytics.mjs` — Rastreo de visitas y descargas.  
- `data-sync.mjs` — Actualiza `data/menu.json` de forma automática.  
- `image-optimize.mjs` — Optimiza imágenes antes de despliegue.  
- `package-render.mjs` — Genera paquetes listos para publicación.

Workflows en `.github/workflows/`:
- `ai-changelog.yml` — Actualiza el CHANGELOG.  
- `update-menu-artifacts.yml` — Exporta automáticamente versiones del menú.  
- `deploy.yml` *(pendiente)* — Despliegue continuo en Netlify/Vercel.

---

## 📱 Progressive Web App (PWA)

El archivo `service-worker.js` permite:
- Carga offline del menú y fotos.
- Cacheo automático de `data/menu.json` y assets.  
Prueba abriendo el sitio una vez, luego desconéctate y recarga.

---

## 🗂️ Plan del Proyecto

El progreso completo, hitos y responsables se gestionan en  
[`PROJECT_PLAN.md`](./PROJECT_PLAN.md)

---

## 📚 Recursos adicionales

- `workflow/reminders.md` — Recordatorios operativos.  
- `handoff.md` — Guía para la transferencia de control al propietario.

---

© 2025 Gereni Bar y Restaurante  
Desarrollado con ❤️ por el equipo de soporte técnico y diseño.
