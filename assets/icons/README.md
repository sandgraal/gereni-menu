# Icon Assets

Las versiones PNG de los íconos de la app se inyectan directamente en `manifest.webmanifest` como data URLs para evitar subir binarios al repositorio (las revisiones automáticas que usamos no aceptan archivos binarios nuevos). Si necesitas volver a generarlos:

1. Coloca una copia de `assets/logo-gereni-bar-restaurant.png` en un directorio temporal.
2. Genera derivados a 192×192 y 512×512 usando tu editor de confianza (Photoshop, GIMP, etc.).
3. Convierte cada archivo a base64 y reemplaza la cadena correspondiente dentro de `manifest.webmanifest`.

Un ejemplo rápido con Node.js (requiere tener los PNG temporales en la raíz del proyecto):

```sh
node - <<'JS'
const fs = require('fs');
for (const size of [192, 512]) {
  const data = fs.readFileSync(`gereni-icon-${size}.png`).toString('base64');
  console.log(`${size}: ${data.slice(0, 60)}…`);
}
JS
```

Luego, sustituye cada valor después de `data:image/png;base64,` en el manifest por el nuevo resultado.
