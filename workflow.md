# Flujo de Trabajo — Menú Gereni

## Roles

- **Contenido:** actualiza `content/menu.md`, valida precios y ortografía.
- **Diseño/Maquetación:** mantiene la plantilla en Canva y verifica coherencia visual.
- **Soporte técnico:** ejecuta scripts, automatizaciones y despliegue.

---

## Ramas y Etiquetas

- Rama principal: `main`
- Ramas de trabajo: `feat/<cambio>`, `fix/<ajuste>`, `chore/<mantenimiento>`
- Etiquetas de entrega a imprenta: `vYYYY.MM.menu`

---

## Proceso de Actualización

0. Revisar y actualizar el progreso en [`PROJECT_PLAN.md`](./PROJECT_PLAN.md).
1. Actualizar `content/menu.md` con los cambios aprobados.
2. Ejecutar sincronización:

   ```bash
   node tools/sync-menu.js
   npm run check:all
   ```

3. Si se requiere exportación:

   ```bash
   npm run export:menu
   ```

   (Corrige dependencias de Puppeteer si es necesario: `sudo apt install libatk1.0-0`)

4. Sincronizar Canva solo si hay cambios visuales no automatizados.
5. Verificar que el QR funcione correctamente (puede automatizarse con `ai/scripts/analytics.mjs`).
6. Confirmar actualización en `data/menu.json`.
7. Commit descriptivo:

   ```bash
   git add .
   git commit -m "feat: actualización menú Octubre 2025"
   git push
   ```

8. Crear tag `vYYYY.MM.menu` si aplica.
9. Confirmar despliegue automático mediante GitHub Actions.

---

## Checklist de Publicación

- [ ] `content/menu.md` actualizado
- [ ] Canva sincronizado (solo si hubo cambios)
- [ ] QR validado
- [ ] `npm run check:all` sin errores
- [ ] Exportes PDF generados (`output/`)
- [ ] Commit y tag creados
- [ ] Despliegue automatizado completado
- [ ] Licencias actualizadas en `design/canva/licenses/README.md`
- [ ] Revisar recordatorios en `workflow/reminders.md`

---

## Automatización

Los siguientes flujos se ejecutan automáticamente:

- `update-menu-artifacts.yml` — exporta versiones digitales e imprime PDFs.
- `ai-changelog.yml` — mantiene actualizado el CHANGELOG.
- `deploy.yml` _(pendiente)_ — publica cambios en Netlify/Vercel.
- `ai/scripts/data-sync.mjs` — sincroniza contenido y registros.
- `ai/scripts/analytics.mjs` — recopila métricas de visitas y descargas.

---

## Emergencias / Cambios Rápidos

1. Editar solo las secciones afectadas en `content/menu.md`.
2. Correr sincronización mínima:

   ```bash
   node tools/sync-menu.js
   npm run check:all
   git commit -m "fix: ajuste urgente precios"
   git push
   ```

3. Los workflows se encargan de regenerar y desplegar.

---

## Referencias

- [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — fases y tareas actuales.
- [`README.md`](./README.md) — descripción general del sistema.
- [`handoff.md`](./handoff.md) — acceso y traspaso de control.
