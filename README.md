# Menú — Bar & Restaurante Gerení

Proyecto para rediseñar y mantener el **menú oficial** de Gerení en un formato **editable, imprimible y fácil de actualizar**, con estética **rústica de montaña (Cartago/CR)**.  
Se trabaja con **Canva** para edición por el dueño, y **GitHub** para control de versiones y respaldo.  
Formato de precios del local: **₡5.650**. Logo en **Café oscuro (#5B3A29)**.  
En “Bebidas” se mantiene **“Consulte opciones y precios”**, con mejoras vía **QR** y rangos orientativos.

## Objetivos
- Que el dueño pueda **editar** platos y precios sin depender de un diseñador.
- Entregar un **PDF Print** de alta calidad (con sangrado) y un **PDF digital** liviano.
- Consolidar todo en un **repositorio** con historial claro (qué cambió y cuándo).
- Alinear la identidad visual a un **estilo tico rústico** (papel, madera, café, verde montaña).

## Alcance (incluye)
- **Plantilla en Canva** con estilos, paleta y tipografías (Alegreya + Source Sans 3).
- **Contenido normalizado** en `content/menu.md` (fuente de verdad en español).
- **PDF Print** (300 dpi, sangrado 3 mm) y **PDF digital** optimizado.
- **Recolor del logo** a Café oscuro y versión blanca para fondos oscuros.
- **Guía de impresión** (tamaño Carta, papel sin brillo, prueba dura) y **checklist**.
- **QR dinámico** para la sección “Bebidas” (lista viva de marcas/promos).
- **Estructura de repo** para cambios seguros (ramas, tags por versión).

## Fuera de alcance (por ahora)
- Sesión de fotos profesional o ilustraciones a la medida.
- Impresión física (se coordina con imprenta externa).
- Traducción a otros idiomas.
- Desarrollo de sitio web completo (más allá de alojar el PDF/QR).

## Entregables
- `/design/canva/` plantilla y guía de maquetación.
- `/content/menu.md` con secciones **Gustitos, Con arroz, Antojitos, Especialidades, Para el café, Bebidas**.
- `/assets/` logo recoloreado, texturas e imágenes stock con licencia apta.
- `/output/Menu_Gereni_print.pdf` y `/output/Menu_Gereni_digital.pdf`.
- `/tools/qr/` instructivo para regenerar el QR sin reimprimir.

## Flujo de trabajo (simple)
1. Editar texto en `content/menu.md` o directo en Canva (manteniendo estilos).
2. Exportar **PDF Print** (con sangrado) + **PDF digital**.
3. Guardar en `/output/` y hacer commit con mensaje claro (p. ej., `feat: actualiza precios Antojitos`).
4. Etiquetar versión para la imprenta (`vYYYY.MM.menu`).

## Requisitos previos
- Logo original (PNG/SVG si está disponible).
- Acceso a **Canva** y al **repositorio** (puede ser privado y administrado por el equipo).
- Lista de platos/precios validados y cualquier restricción de alérgenos.

## Criterios de éxito
- **Legibilidad** en ambiente de restaurante (tamaño de letra y contraste).
- **Actualización en < 5 minutos** por cambio de precio o plato.
- **Consistencia** de formato (precios en `₡5.650`, tildes correctas, estilos).
- **Impresión** sin sorpresas (prueba dura aprobada).

## Riesgos y cómo los mitigamos
- *Colores se ven distintos al imprimir:* exportar prueba, usar papel **sin brillo** y ajustar si hace falta.
- *Canva exporta en RGB:* avisar a imprenta para conversión a CMYK con prueba.
- *Precios de bebidas cambian seguido:* usar **QR dinámico** y/o **rangos** (“desde ₡…”) para no reimprimir.
- *Demasiada información por página:* priorizar platos “de la casa” y usar inserto estacional 1/3 de página.

## Licencias
- Tipografías: **Google Fonts** (libres).
- Imágenes/íconos: **stock libre** para uso comercial (en `assets/` se guarda fuente/URL).
- Contenido y marca: **propiedad de Bar & Restaurante Gerení**.
