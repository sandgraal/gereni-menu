# Checklist Lingüístico y de Formato — Menú Gerení

Usa esta lista breve antes de sincronizar cambios desde `content/menu.md`. Ayuda a mantener un tono consistente y a evitar errores comunes al actualizar la carta.

## Estilo General
- Mantén el tono cercano y descriptivo, sin jerga técnica ni mayúsculas innecesarias.
- Asegura que los nombres de platillos vayan en **Title Case Español** (solo primera palabra y nombres propios con mayúscula).
- Evita abreviaturas salvo unidades conocidas (p. ej., “cm”, “ml”). Si son necesarias, agrega la explicación en la descripción.

## Ortografía y Tildes
- Revisa tildes en palabras frecuentes (Café, Sencilla, Camarón, Azteca, Mixtas).
- Usa “y” antes de la última opción en listados (“Cerdo, pollo y camarones”).
- Confirma que los términos ingleses estén en cursiva o traducidos cuando aplique.

## Precios y Formato
- Formatea precios como `₡0.000` (punto decimal para miles, sin espacios).
- Si hay rangos o combos, acláralos en la descripción: “Desde `₡3.500`” o “Combo `₡4.200` incluye bebida”.
- Asegura que cada entrada tenga precio único; si no aplica, agrega nota “Consultar”.

## Descripciones
- Empieza con verbo o frase descriptiva breve (“Acompañado de…”).
- Limita a 120 caracteres aprox. para evitar desbordar la maqueta.
- Indica guarniciones o ingredientes relevantes; evita repetir información idéntica entre platillos.

## Notas y Temporalidades
- Para platillos fuera del menú temporalmente, muévelos a la sección “Notas” con fecha y motivo.
- Agrega comentarios HTML (`<!-- ... -->`) para instrucciones internas que no deben publicarse.

## Verificación Final
- Leer en voz alta cada sección para confirmar fluidez.
- Ejecutar `node tools/sync-menu.js` y verificar que no se muestran errores.
- Registrar fecha y responsable del cambio en el commit o nota interna.
