#!/usr/bin/env python3
"""
Genera un código QR para la carta de alimentos y bebidas.

Uso:
  python tools/qr/generate.py https://tu-url-de-alimentos-y-bebidas [alias]
"""

import sys
from datetime import datetime
from pathlib import Path

try:
    import qrcode  # type: ignore
except ImportError:
    print("Dependencia faltante. Instala con: pip install qrcode[pil]")
    sys.exit(1)


def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python tools/qr/generate.py <url> [alias]")
        sys.exit(1)

    url = sys.argv[1]
    alias = sys.argv[2] if len(sys.argv) > 2 else datetime.now().strftime("%Y%m%d")

    output_dir = Path(__file__).resolve().parents[1] / "assets" / "qr"
    output_dir.mkdir(parents=True, exist_ok=True)
    filename = output_dir / f"qr_alimentos_bebidas_{alias}.png"

    qr = qrcode.make(url)
    qr.save(filename)
    print(f"QR guardado en {filename}")


if __name__ == "__main__":
    main()
