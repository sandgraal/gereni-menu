# Actualizar las acciones rápidas de la página de inicio

Las tarjetas de "Acciones rápidas" que aparecen en `index.html` se generan automáticamente a partir del archivo [`data/home-actions.json`](../../data/home-actions.json). Esto permite que el equipo del restaurante ajuste enlaces, textos o el acceso al Wi-Fi sin editar el HTML.

## Cómo editar las acciones

1. Abre [`data/home-actions.json`](../../data/home-actions.json) en GitHub.
2. Cada entrada dentro de `"actions"` representa una tarjeta. Los campos disponibles son:
   - `id`: identificador opcional para referencia interna.
   - `href`: URL o ancla que abrirá la tarjeta.
   - `variant`: estilo del botón (`primary`, `secondary`, etc.).
   - `classes`: arreglo opcional de clases CSS adicionales (por ejemplo `"link-download"`).
   - `title` y `description`: objetos con traducciones `es` e `en`.
   - `icon`: clave del ícono a mostrar (`menu`, `download`, `wifi`).
   - `newTab`: define si el enlace abre en una pestaña nueva (`true`/`false`).
   - `rel`: valor del atributo `rel` cuando se necesita (por ejemplo `"noopener"`).
3. Guarda los cambios con un Commit o Pull Request. Al recargar la página, el script `scripts/homeActions.js` reconstruirá la lista automáticamente.

> [!TIP]
> La tarjeta de Wi-Fi puede apuntar al portal cautivo del proveedor o a un PDF con instrucciones. Solo actualiza `href` y, si aplica, `rel` para reflejar la política de seguridad de tu enlace.

## Fallback sin JavaScript

El HTML mantiene una copia de respaldo de las tres tarjetas principales. Si el navegador bloquea JavaScript o el JSON no está disponible, los visitantes seguirán viendo opciones funcionales.
