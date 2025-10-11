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
