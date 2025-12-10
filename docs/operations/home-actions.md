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
3. Para la tarjeta de Wi-Fi (`id: "connect-wifi"`) puedes añadir el objeto `wifi` con la siguiente estructura:
   ```json
   "wifi": {
     "ssid": { "es": "Nombre red ES", "en": "Network EN" },
     "password": "Contraseña",
     "security": "WPA2",
     "instructions": { "es": "Texto guía", "en": "Guide text" },
     "portalUrl": "https://tu.portal.cautivo/",
     "portalLabel": { "es": "Abrir portal", "en": "Open portal" }
   }
   ```
   - `ssid`: acepta texto o un objeto con traducciones. Representa el nombre de la red (SSID) y se incluye en el texto que se copia al portapapeles. Si prefieres, puedes usar `networkName` o `network` como alias de `ssid`.
   - `password`: cadena que se copiará junto con el nombre de la red cuando el visitante pulse **Copiar acceso a Wi-Fi**.
   - `security`: describe el tipo de cifrado (WPA2, WPA3, abierto, etc.) y también se agrega al texto copiado si está presente.
   - `instructions`: texto corto que sí aparece en el panel para guiar al visitante.
   - `portalUrl`: enlace directo al portal cautivo (opcional). Si lo omites, el botón se ocultará.
   - `portalLabel`: etiqueta bilingüe del botón del portal.

   El panel de Wi-Fi también funciona como _fallback_: si no actualizas el JSON, conservará la información de respaldo definida en `index.html`.

   El HTML incluye `data-wifi-copy` con las credenciales actuales (`Gereni` / `Fesan318` / `WPA2`) para que el botón de copia siga funcionando si falla la carga del JSON. Recuerda actualizar ambas fuentes si cambian las claves.
   
   Si completas `ssid`, `password` y `security`, el panel mostrará un código QR con la cadena `WIFI:S:<ssid>;T:<security>;P:<password>;H:false;` junto a los botones de copia y portal. El QR permanece oculto cuando falta alguno de esos campos, ya que el nombre de la red (SSID) es indispensable para generar un QR válido.
3. Guarda los cambios con un Commit o Pull Request. Al recargar la página, el script `scripts/homeActions.js` reconstruirá la lista automáticamente.

> [!TIP]
> La tarjeta de Wi-Fi puede apuntar al portal cautivo del proveedor o a un PDF con instrucciones. Usa `portalUrl` para mostrar el botón dentro del panel y actualiza `href` si prefieres llevar al visitante directamente fuera del sitio.

## Fallback sin JavaScript

El HTML mantiene una copia de respaldo de las tres tarjetas principales. Si el navegador bloquea JavaScript o el JSON no está disponible, los visitantes seguirán viendo opciones funcionales.
