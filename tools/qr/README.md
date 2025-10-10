# QR Dinámico — Bebidas

## Objetivo

Mantener un código QR que dirija a la carta de comida y bebidas actualizada sin necesidad de reimprimir el menú físico.

## Requisitos

- URL editable (p. ej., documento público, página web o servicio de redirección).
- Herramienta para generar QR (sugerido: [qr-code-generator.com](https://www.qr-code-generator.com/) o script local).

## Procedimiento Manual

1. Actualizar la carta de bebidas en la URL designada.
2. Visitar la herramienta de generación de QR.
3. Pegar la URL y exportar en formato SVG o PNG de alta resolución.
4. Guardar el archivo en `assets/qr/fecha.svg` (crear carpeta si no existe).
5. Reemplazar el QR en la plantilla de Canva.

## Procedimiento Automatizado (opcional)

Si se prefiere automatizar usando Python:

```bash
pip install qrcode[pil]
python tools/qr/generate.py "https://tu-url-de-bebidas"
```

Agregar un script `generate.py` con la siguiente base:

```python
import sys
import qrcode
from datetime import datetime
from pathlib import Path

url = sys.argv[1]
output_dir = Path(__file__).parents[1] / "assets/qr"
output_dir.mkdir(parents=True, exist_ok=True)
timestamp = datetime.now().strftime("%Y%m%d")
filename = output_dir / f"qr_bebidas_{timestamp}.png"

img = qrcode.make(url)
img.save(filename)
print(f"QR guardado en {filename}")
```

## Control de Versiones

- Nombrar commits relacionados como `chore: actualiza QR bebidas`.
- Etiquetar la versión del menú cuando el QR cambie (`git tag vYYYY.MM.menu`).
- Mantener historial en `assets/qr/` para trazabilidad.
