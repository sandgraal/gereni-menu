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
1. Actualizar `content/menu.md` con los cambios aprobados.
2. Ejecutar `node tools/sync-menu.js` para reflejar el contenido en `data/menu.json`.
3. Sincronizar la plantilla de Canva (copiar/pegar texto o ajustar directamente).
4. Revisar checklist visual y ortográfico.
5. Exportar `Menu_Gereni_print.pdf` y `Menu_Gereni_digital.pdf` con `npm run export:menu`.
6. Guardar PDFs en `output/`.
7. Hacer commit describiendo el cambio (`feat: actualiza precios Antojitos`).
8. Si la versión es para imprenta, crear tag `vYYYY.MM.menu`.

## Checklist de Publicación
- [ ] `content/menu.md` actualizado y revisado.
- [ ] Template de Canva sincronizado.
- [ ] QR de alimentos y bebidas verificado y vigente.
- [ ] PDFs exportados y verificados visualmente.
- [ ] Commit y tag creados (si aplica).
- [ ] Notificar al dueño sobre la actualización.

## Emergencias / Cambios Rápidos
- Foco en secciones afectadas (p. ej., cambio de precio puntual).
- Actualizar Canva y `content/menu.md`.
- Exportar únicamente PDF digital si la versión impresa no cambia.
- Comunicar en registro de cambios qué versión en papel sigue vigente.

## Registro de Validación de PDFs
- 2025-10-10 — Digital: ✅ Revisado por soporte (exporte de 4 páginas).
- 2025-10-10 — Print: ✅ Revisado en pantalla; pendiente prueba de impresión doméstica.
