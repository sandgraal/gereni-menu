# QR Dinámico — Alimentos y Bebidas

## Objetivo

Mantener un código QR que dirija a la carta de comida y bebidas actualizada sin necesidad de reimprimir el menú físico.

## Requisitos

- URL editable (p. ej., documento público, página web o servicio de redirección).
- Herramienta para generar QR (sugerido: [qr-code-generator.com](https://www.qr-code-generator.com/) o script local).

## Procedimiento Manual

1. Actualizar la carta de alimentos y bebidas en la URL designada.
2. Visitar la herramienta de generación de QR.
3. Pegar la URL y exportar en formato SVG o PNG de alta resolución.
4. Guardar el archivo en `assets/qr/fecha.png` (crear carpeta si no existe).
5. Reemplazar el QR de alimentos y bebidas en la plantilla de Canva.

## Procedimiento Automatizado (opcional)

Repositorio incluye un script listo (`tools/qr/generate.py`):

```bash
pip install qrcode[pil]
python tools/qr/generate.py "https://tu-url-de-alimentos-y-bebidas"
# opcionalmente agrega un alias para identificar la versión
python tools/qr/generate.py "https://tu-url-de-alimentos-y-bebidas" marzo-2025
```

## Control de Versiones

- Nombrar commits relacionados como `chore: actualiza QR alimentos-bebidas`.
- Etiquetar la versión del menú cuando el QR cambie (`git tag vYYYY.MM.menu`).
- Mantener historial en `assets/qr/` para trazabilidad.
