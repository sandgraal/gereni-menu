# 🍽️ Gereni Bar y Restaurante – Menú Editable

Repositorio oficial del **menú digital y para impresión** del Gereni Bar y Restaurante.  
Permite editar precios, descripciones y fotografías fácilmente, generando automáticamente versiones web y PDF.

---

## 📂 Estructura

| Ruta                             | Descripción                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| `index.html`                     | Página principal                                               |
| `menu.html`                      | Menú dinámico cargado desde `data/menu.json`                   |
| `content/menu.md`                | Fuente editable (Markdown) del menú                            |
| `data/menu.json`                 | Versión generada para la web                                   |
| `data/home-actions.json`         | Configura las tarjetas de acciones rápidas                     |
| `ai/scripts/`                    | Scripts automatizados (análisis, sincronización, optimización) |
| `assets/`                        | Imágenes, íconos y logotipos                                   |
| `tools/validate-prices.js`       | Valida formato `₡0.000`                                        |
| `tools/sync-menu.js`             | Sincroniza Markdown → JSON                                     |
| `tools/validate-social-links.js` | Verifica enlaces sociales válidos                              |
| `service-worker.js`              | Soporte PWA y modo offline                                     |
| `design/canva/licenses/`         | Evidencias y licencias de diseño                               |
| `PROJECT_PLAN.md`                | Plan y progreso consolidado del proyecto                       |

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

1. Ingresa a GitHub y abre este repositorio.
   - Desde la lista de archivos, haz clic en `content/menu.md`.
   - Pulsa el ícono del lápiz (**Edit this file**) para editar directamente en el navegador.
   - Mantén los precios en formato `₡5.650` y respeta los encabezados bilingües (ES/EN).
2. Revisa tu redacción antes de guardar.
   - Usa la pestaña **Preview** para comprobar ortografía, espacios y traducciones.
   - Si algo no luce bien, vuelve a **Edit** y ajusta el texto.
3. Guarda los cambios en una rama nueva.
   - En la sección **Commit changes**, escribe un mensaje breve (ej. “Actualización de menú”).
   - Selecciona **Create a new branch for this commit** y nombra la rama `menu-nombre-del-cambio`.
   - Haz clic en **Propose changes**.
4. Envía la solicitud de cambios.
   - Completa el formulario del Pull Request con un título claro y un resumen corto.
   - Presiona **Create pull request** para que el equipo revise la actualización.
5. Confirma que las automatizaciones terminen.
   - GitHub ejecutará los pasos de sincronización, validación y exportación de PDF de forma automática.
   - Revisa la pestaña **Checks** del Pull Request; todos los indicadores deben mostrarse en verde.
   - Si algún check falla, ábrelo para ver qué parte del menú debes corregir.
6. Publica el cambio cuando esté aprobado.
   - Una vez que los checks estén en verde y tengas la aprobación correspondiente, pulsa **Merge pull request**.
   - El menú en la web y los PDF quedarán actualizados automáticamente tras la fusión.

👉 **Consejo rápido:** Si necesitas descargar los nuevos PDF, entra a la pestaña **Actions**, abre la ejecución más reciente y busca los artefactos adjuntos.

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
- `deploy.yml` _(pendiente)_ — Despliegue continuo en Netlify/Vercel.

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


<!-- AI-STATUS:START -->
Last AI agents run: 2026-03-09T04:36:06.915Z
<!-- AI-STATUS:END -->
