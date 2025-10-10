# Implementation Plan — Menú Gerení

Proyecto para rediseñar y mantener el menú oficial de Bar & Restaurante Gerení en un formato editable, imprimible y fácil de actualizar. Se trabaja con Canva para que el dueño mantenga el contenido y con GitHub como fuente de verdad y control de versiones. El estilo visual busca un tono rústico de montaña (Cartago, Costa Rica) con paleta café/verde y precios formateados como `₡5.650`.

## 0. Preparación

- Validar objetivos y alcance con el dueño (edición autónoma, PDF Print + digital, repositorio vivo, estética rústica).
- Reunir requisitos previos: logo original, acceso a Canva y GitHub, lista validada de platos/precios, restricciones de alérgenos.
- Configurar repositorio con estructura base (`content/`, `design/`, `assets/`, `output/`, `tools/`).
- Crear documentación corta del flujo de trabajo y criterios de éxito para alinear expectativas.

### Entregables

- README (este plan) y backlog de tareas abiertas.
- Lista de riesgos priorizados y responsables de mitigación.

## 1. Normalizar Contenido

- Volcar el menú actual y revisar duplicados, nombres y tildes.
- Definir secciones oficiales: Gustitos, Con arroz, Antojitos, Especialidades, Para el café, Bebidas.
- Escribir `content/menu.md` como fuente única de verdad con formato consistente (`₡5.650`) y notas necesarias (alérgenos, promos).
- Documentar reglas de estilo lingüístico (capitalización, abreviaturas permitidas, tono).

### Entregables

- `content/menu.md` listo para importarse o copiarse a Canva.
- Checklist lingüístico y de formato para futuras actualizaciones.

## 2. Construir Sistema Visual

- Definir paleta de color (incluye Café oscuro #5B3A29) y tipografías (Alegreya + Source Sans 3) dentro de Canva.
- Recolorear el logo y generar versión en blanco para fondos oscuros; guardar ambos en `assets/`.
- Preparar texturas e imágenes stock con licencias verificadas y documentadas.
- Configurar estilos de párrafo, títulos, precios y notas en la plantilla Canva.

### Entregables

- `design/canva/` con plantilla y guía de maquetación (capturas o notas).
- `assets/` con logos finales y texturas aprobadas.

## 3. Maquetar en Canva

- Crear el documento principal en tamaño Carta con márgenes y sangrado de 3 mm.
- Aplicar estilos definidos a cada sección del menú; incluir jerarquía visual clara y suficiente espacio en blanco.
- Reservar espacio para el QR dinámico de alimentos y bebidas con texto “Consulte opciones y precios”.
- Validar legibilidad y contraste en pantalla y mediante impresión de prueba doméstica.

### Entregables

- Plantilla Canva lista para edición por el dueño.
- Documento de control visual (capturas + notas de decisiones clave) en `design/canva/guide.md`.

## 4. Automatizar QR y Actualizaciones

- Crear instructivo en `tools/qr/README.md` para generar y actualizar el código QR de alimentos y bebidas (herramienta y URL de destino).
- Crear script para sincronizar `content/menu.md` con `data/menu.json` y documentar su uso (`tools/sync-menu.js`).
- Documentar proceso de exportación de PDF Print y PDF digital, incluyendo ajustes de compresión y nombre de archivo.
- Definir convención de ramas y etiquetas (`feat/`, `fix/`, `vYYYY.MM.menu`) y agregarla a la guía de contribución rápida.

### Entregables

- `tools/qr/` con script o guía paso a paso.
- `tools/sync-menu.js` con instrucciones de ejecución.
- Documento `workflow.md` en la raíz con flujo de commits, exportes y publicación.

## 5. Exportar y Validar

- Exportar desde Canva en dos variantes: Print (300 dpi, CMYK o aviso a imprenta) con sangrado, y Digital optimizado (RGB, peso bajo).
- Guardar archivos en `output/Menu_Gereni_print.pdf` y `output/Menu_Gereni_digital.pdf`.
- Revisar checklist de impresión (papel sin brillo, prueba dura, colores consistentes).
- Obtener aprobación final del dueño y registrar la versión (`git tag vYYYY.MM.menu`).

### Entregables

- PDFs finales en `output/` con control de versiones.
- Registro de validación (resultado de prueba de impresión y feedback del dueño).

## 6. Handoff y Mantenimiento

- Capacitar al dueño (breve sesión o video) para editar textos en Canva y actualizar `content/menu.md`.
- Documentar procedimiento para cambios rápidos (<5 minutos) y publicación de actualizaciones.
- Crear board de tareas recurrentes (revisión de precios de bebidas, actualización de promociones estacionales).
- Programar revisiones periódicas de licencias de imágenes y consistencia visual.

### Entregables

- Guía de uso para el dueño (`handoff.md`).
- Agenda de mantenimiento trimestral o mensual.

## Roles y Responsables

- **Diseño/Maquetación:** prepara sistema visual y plantilla Canva.
- **Contenido:** mantiene `content/menu.md` y valida precios.
- **Dueño del local:** aprueba cambios, inicia actualizaciones y opera Canva.
- **Soporte técnico:** asegura estructura del repositorio, versiones y backups.

## Riesgos y Mitigaciones (vivos)

- Cambios frecuentes de alimentos o bebidas → Mantener QR dinámico y rangos de precio desde `₡x`.
- Diferencias de color en impresión → Probar en papel sin brillo, coordinar conversión a CMYK con imprenta.
- Saturación de información → Priorizar platos “de la casa” y evaluar inserto estacional.
- Falta de disciplina en versiones → Checklist de commits/etiquetas y capacitación inicial.

## Criterios de Hecho

- Menú es legible en ambiente de restaurante y sigue formato de precios `₡5.650`.
- Exportar y publicar una actualización menor toma menos de 5 minutos.
- Repositorio registra qué cambió y cuándo, con PDFs almacenados en `output/`.
- Imprenta produce resultado consistente con la maqueta tras la prueba dura.

## Próximos Pasos Inmediatos

1. Confirmar objetivos con el dueño y obtener logo + lista de platos.
2. Configurar repositorio con la estructura indicada y crear `content/menu.md`.
3. Comenzar la definición de paleta/tipografías en Canva para acelerar la maquetación.
