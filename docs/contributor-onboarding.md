# Contributor Onboarding Checklist

> Usa esta guía rápida para preparar tu entorno, proponer cambios y entregar el menú listo para publicar.

## 1. Preparación del entorno
- **Clonar y crear rama:**
  1. `git clone https://github.com/sandgraal/gereni-menu.git`
  2. `cd gereni-menu`
  3. `git checkout -b feature/<nombre-corto>`
- **Instalar dependencias:**
  - `npm ci`
  - (Opcional) `python -m venv .venv && source .venv/bin/activate` si ejecutarás utilidades en `tools/qr/`.
- **Revisar documentación clave:**
  - `workflow.md` para roles, checklist operativo y flujo de publicación.
  - `design/canva/template-link.md` para confirmar acceso a plantillas.

## 2. Actualizar contenido
- Edita `content/menu.md` siguiendo el formato bilingüe `Texto ES | Text EN` y precios `₡0.000`.
- Si necesitas resaltar novedades en la portada, sincroniza los datos con la guía `docs/home-highlights.md`.
- Ejecuta `node tools/sync-menu.js` para regenerar `data/menu.json`.
- Si agregas imágenes o íconos, coloca los archivos en `assets/` y documenta licencias en `assets/README.md` o `design/canva/licenses/` según corresponda.

## 3. Validar cambios
- `npm run check:all` — Ejecuta validadores de precios y pruebas de render.
- Revisar `data/menu.json` para confirmar que la salida coincide con el Markdown.
- Abrir `menu.html` en un navegador local (`npx http-server .` o alternativa) para revisar la vista bilingüe.

## 4. Exportar artefactos
- `npm run export:menu` para generar PDFs en `output/`.
- Verifica que los nombres de archivos incluyan idioma/tema correcto y que el enlace QR apunte a la URL vigente.
- Adjunta cualquier especificación de imprenta nueva en `design/` y referencia los cambios en la nota de commit.

## 5. Checklist antes del PR
- Confirmar que los cambios están en tu rama feature (`git status`).
- Ejecutar `npm run check:all` nuevamente si editaste después de la primera corrida.
- `git commit -am "feat: <resumen corto>"` y `git push`.
- Crear el Pull Request usando la plantilla del repositorio, enlazando a issues relevantes y describiendo pruebas.
- Marcar en `workflow/reminders.md` cualquier tarea programada (por ejemplo, actualizar QR o revisar licencias) si aplicó.

## 6. Revisión y despliegue
- Resuelve comentarios del PR asegurando que los scripts (`tools/sync-menu.js`, `tools/validate-prices.js`) sigan pasando.
- Tras el merge a `main`, confirma en GitHub Actions que el flujo **Update Menu Artifacts** concluyó sin errores.
- Publica la nueva versión siguiendo la convención de tags `vYYYY.MM.menu` y actualiza `handoff.md` con un resumen.

## Recursos rápidos
- `README.md` — Estructura del repositorio y comandos principales.
- `workflow/reminders.md` — Cronograma de tareas periódicas.
- `docs/extract-images-from-pdf.md` — Guía para optimizar imágenes heredadas.
- `docs/home-highlights.md` — Procedimiento para la sección de destacados en portada.
