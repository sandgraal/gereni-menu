# Flujo de Trabajo — Menú Gerení

## Roles
- **Contenido:** actualiza `content/menu.md`, valida precios y ortografía.
- **Diseño/Maquetación:** mantiene la plantilla en Canva y aplica cambios visuales.
- **Soporte técnico:** gestiona repositorio, exportes y control de versiones.

## Ramas y Etiquetas
- Rama principal: `main`.
- Ramas de trabajo: `feat/<cambio>`, `fix/<ajuste>`, `chore/<mantenimiento>`.
- Etiquetas de entrega a imprenta: `vYYYY.MM.menu`.

## Proceso de Actualización
0. Revisar y actualizar `BACKLOG.md` para reflejar pendientes y responsables antes de comenzar.
1. Actualizar `content/menu.md` con los cambios aprobados.
2. Ejecutar `node tools/sync-menu.js` para reflejar el contenido en `data/menu.json`.
3. Correr `npm run check:all` (valida precios y render web).
4. Sincronizar la plantilla de Canva (copiar/pegar texto o ajustar directamente; validar enlaces según `design/canva/template-link.md`).
5. Revisar checklist visual y ortográfico.
6. Exportar `Menu_Gereni_print.pdf` y las variantes digitales (`Menu_Gereni_digital_es_dark.pdf`, `Menu_Gereni_digital_es_light.pdf`, `Menu_Gereni_digital_en_dark.pdf`, `Menu_Gereni_digital_en_light.pdf`) con `npm run export:menu`.
7. Guardar PDFs en `output/`.
8. Hacer commit describiendo el cambio (`feat: actualiza precios Antojitos`).
9. Si la versión es para imprenta, crear tag `vYYYY.MM.menu`.

## Checklist de Publicación
- [ ] `content/menu.md` actualizado y revisado.
- [ ] Template de Canva sincronizado.
- [ ] QR de alimentos y bebidas verificado y vigente.
- [ ] `npm run check:all` sin errores.
- [ ] PDFs exportados y verificados visualmente.
- [ ] Commit y tag creados (si aplica).
- [ ] Notificar al dueño sobre la actualización.
- [ ] Licencias/evidencias actualizadas en `design/canva/licenses/README.md` (si se añadieron recursos).
- [ ] Revisar recordatorios vigentes (`workflow/reminders.md`) al cierre de la sesión.

## Emergencias / Cambios Rápidos
- Foco en secciones afectadas (p. ej., cambio de precio puntual).
- Actualizar Canva y `content/menu.md`.
- Exportar únicamente la variante digital necesaria (p. ej. `Menu_Gereni_digital_es_dark.pdf`) si la versión impresa no cambia.
- Comunicar en registro de cambios qué versión en papel sigue vigente.

## Registro de Validación de PDFs
- 2025-10-10 — Digital: ✅ Revisado por soporte (exporte de 4 páginas).
- 2025-10-10 — Print: ✅ Revisado en pantalla; pendiente prueba de impresión doméstica.
