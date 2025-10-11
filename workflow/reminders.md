# Recordatorios Operativos — Menú Gerení

> Usa este archivo como guía para programar recordatorios recurrentes en tu calendario (Google Calendar, iCloud u otra herramienta). Cada evento debe invitar al Usuario (dueño) y a Codex/soporte según corresponda.

## Frecuencias sugeridas

| Frecuencia | Evento | Responsable principal | Detalles recomendados |
|------------|--------|-----------------------|-----------------------|
| Semanal (lunes 9 a.m.) | Revisar cambios en precios variables | Usuario | Consultar abastecimiento, anotar ajustes en `content/menu.md`. |
| Mensual (primer martes 10 a.m.) | Verificar QR alimentos y bebidas | Codex + Usuario | Abrir URL del QR, regenerar con `tools/qr/generate.py` si cambió. |
| Mensual (primer martes 10:30 a.m.) | Revisión de ortografía y checklist lingüístico | Usuario | Seguir `content/style-checklist.md`, anotar pendientes. |
| Trimestral (primer miércoles de enero/abril/julio/octubre 2 p.m.) | Refresh visual y exportes | Codex | Actualizar Canva, correr `npm run export:menu`, subir PDFs vigentes. |
| Trimestral (mismo día 2:45 p.m.) | Respaldo del repositorio y Canva | Codex | Generar backup ZIP del repo + exportar plantilla Canva, subir a nube. |
| Anual (primer lunes de noviembre 11 a.m.) | Revisión integral de identidad gráfica | Usuario + Codex | Evaluar paleta, tipografías y feedback de clientes. |

## Cómo implementar los recordatorios
1. Define un calendario compartido o usa uno personal y agrega a Codex como invitado cuando requiera acción conjunta.
2. Crea eventos recurrentes con descripción que incluya:
   - Paso rápido a seguir (ej. “Abrir `workflow.md` y seguir proceso”).
   - Enlace directo al archivo relevante (`content/menu.md`, `design/canva/guide.md`, etc.).
   - Checklist corta con los criterios de éxito.
3. Activa notificaciones (24 h y 1 h antes) para evitar omisiones, especialmente en tareas trimestrales/anuales.
4. Tras completar cada evento, registra notas o decisiones en el commit, en `BACKLOG.md` o en la sección “Historial” correspondiente.

## Seguimiento
- Revisa y ajusta estas frecuencias después de los primeros tres meses según carga de trabajo real.
- Si un recordatorio se pospone, reprograma la invitación inmediatamente para mantener el ciclo activo.
