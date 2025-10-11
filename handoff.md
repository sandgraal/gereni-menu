# Guía de Uso para el Dueño — Menú Gerení

## Objetivo
Permitir que el dueño actualice el menú en menos de 5 minutos sin depender de un diseñador.

## Accesos Necesarios
- Enlace directo a la plantilla de Canva (ver instrucciones en `design/canva/template-link.md` si está pendiente).
- Usuario y contraseña de GitHub (si aplica) o acceso vía colaborador.
- URL editable donde se hospeda la carta de alimentos y bebidas para el QR.

## Pasos para Actualizar un Platillo
1. Abrir `content/menu.md` y localizar la sección correspondiente.
2. Ajustar nombre, descripción o precio (mantener formato `₡5.650`).
3. Ejecutar `node tools/sync-menu.js` para actualizar la versión web (`data/menu.json`).
4. Guardar el cambio y anotar la fecha en el registro interno.
5. Abrir la plantilla de Canva, copiar el texto actualizado y pegarlo respetando estilos.
6. Verificar ortografía y alineación.
7. Exportar el PDF digital si se requiere compartir en línea.
8. Si el cambio es oficial, coordinar con soporte para exportar versión Print y etiquetar la versión.

## Pasos para Actualizar Precios de Bebidas
1. Actualizar la URL que contiene la carta de alimentos y bebidas (Google Doc, sitio web, etc.).
2. Regenerar el QR de alimentos y bebidas usando la guía en `tools/qr/README.md`.
3. Reemplazar el QR de alimentos y bebidas en Canva arrastrando la nueva imagen.
4. Validar que el QR de alimentos y bebidas abra la URL correcta desde un celular.

## Checklist Rápido Antes de Imprimir
- [ ] Todos los precios revisados y aprobados.
- [ ] QR de alimentos y bebidas funcional y actualizado.
- [ ] Logotipo y colores consistentemente aplicados.
- [ ] Exportación Print con sangrado y marcas de corte.
- [ ] Prueba dura impresa y aprobada.

## Soporte y Respaldo
- Comunicar cambios mayores vía WhatsApp o correo con el equipo de soporte.
- Mantener los PDFs en `output/` y respaldos en la nube si es posible.
- Programar revisión trimestral del diseño para mantener frescura y consistencia.

## Board de Mantenimiento Recurrente
| Frecuencia | Tarea | Responsable | Notas |
|------------|-------|-------------|-------|
| Semanal | Revisar abastecimiento y precios variables (bebidas, mariscos) | Dueño / Contenido | Actualizar `content/menu.md` y Canva si hay cambios |
| Mensual | Verificar QR de alimentos y bebidas | Soporte técnico | Regenerar con `tools/qr/generate.py` si la URL cambió |
| Mensual | Repasar ortografía y tildes con checklist lingüística | Contenido | Usar `content/style-checklist.md` |
| Trimestral | Ajustar diseño en Canva y exportar PDFs nuevos | Diseño/Maquetación | Guardar exportes en `output/` y taggear versión |
| Trimestral | Backup del repositorio y Canva | Soporte técnico | Subir a almacenamiento externo o drive compartido |
| Anual | Revisión integral de identidad gráfica y paleta | Dueño + Diseño | Evaluar feedback de clientes y tendencias |

## Agenda de Capacitación — Usuario + Codex (30 minutos)
1. **Bienvenida y objetivos (3 min)**  
   - Usuario confirma alcance inmediato (cambios frecuentes, PDFs, QR).  
   - Codex repasa criterios de éxito y próxima entrega en `BACKLOG.md`.
2. **Repositorio y flujos (5 min)**  
   - Codex guía por `workflow.md` enfatizando `npm run check:all`.  
   - Usuario identifica dónde registrar cambios (README, backlog, historial de capacitación).
3. **Edición supervisada (8 min)**  
   - Usuario modifica un platillo en `content/menu.md`.  
   - Codex acompaña la ejecución de `node tools/sync-menu.js` y verifica `npm run check:all`.
4. **Actualización en Canva (6 min)**  
   - Usuario abre la plantilla, pega el cambio y revisa estilos.  
   - Codex valida que se respete checklist visual (`design/canva/guide.md`).
5. **Exportes y respaldo (5 min)**  
   - Codex ejecuta `npm run export:menu` y muestra archivos en `output/`.  
   - Usuario registra verificación rápida en `output/print-checklist.md`.
6. **Cierre y próximos pasos (3 min)**  
   - Revisar tareas pendientes prioritarias (logo, enlace Canva, URL QR).  
   - Programar seguimiento y actualizar `handoff.md` con la fecha de capacitación.

### Sugerencias para agendar la sesión
- Usuario propone dos horarios disponibles (ideal dentro de la próxima semana).
- Coordinar por chat y confirmar en calendario compartido.
- Registrar la fecha confirmada en `handoff.md` → Historial de Capacitación y marcar el avance en `BACKLOG.md`.

## Historial de Capacitación
- 2025-10-10 — Sesión inicial: ✅ Realizada (Usuario + Codex, handoff completo).
