# EVA ARCADE — continuidad de implementación

## Encargo y autorización
El propietario solicitó implementar identidad EVA completa, guía, animaciones, mapa, UX móvil, menos interrupciones, partida rápida y corrección de los tres regímenes. Autorizó commits/push directos a `main` y despliegue por Vercel. No cambiar otros proyectos ni borrar partidas.

## Estado (primer bloque listo para publicar, 2026-09-24)
- Base actual: Next 15.5.24 / React 18 / Zustand localStorage. Repo: https://github.com/dojedacifuentes/famialiarpg ; sitio: https://famialiarpg.vercel.app/.
- Antes de cambios: 40 pruebas pasan. npm audit detectó dependencias vulnerables; pendiente actualización compatible y nueva auditoría.
- Implementado en árbol de trabajo: clasificación por régimen, metadatos patrimoniales, migración v5 con backup v4 local, cierre ST/PG separado, escenas/títulos contextuales y pruebas de regresión.
- Implementados también: paleta EVA, logo geométrico, imágenes optimizadas (~74 KB), guía contextual local, mapa orbital, preferencias de movimiento/lectura, partida rápida aislada y reducción de interrupciones.
- Verificado: 44 pruebas pasan, typecheck y compilación de producción con lint y tipos habilitados; auditoría de producción: 0 vulnerabilidades. Prueba UI a 390×844: partida rápida PG muestra clasificación individual correcta y feedback visible.
- Siguiente: completar prueba de los tres regímenes en navegador; tamaños 320/desktop; pulir referencias heredadas a SC en inventario y matrimonio; corregir textos/cálculo SC; tests partida rápida. Confirmar despliegue después de push.
- Nota de ejecución: no correr `next dev` y `next build` simultáneamente porque comparten `.next`. Un build falló por colisión; al detener dev y repetir, compiló correctamente.

## Guardados
Campaña: `derecho-familia-rpg-save`; backup previo a v5: `derecho-familia-rpg-save-backup-v4`. Mantener escenas/hechos y sus identificadores. No adjudicar dueño por sexo del jugador al migrar registros ambiguos. Los casos del taller son ejercicios independientes, no un balance sumable de patrimonio.

## Límites jurídicos
Fuente primaria: https://www.bcn.cl/leychile/navegar?idNorma=172986 . ST art.159; PG arts.1792-2/6/19; bienes familiares transversal art.141. El cálculo PG acepta balances netos previamente ajustados, no hace avalúos ni reemplaza revisión jurídica. Compensación económica no es crédito de participación. Revisar por separado textos heredados SC (art959, inscripción/adjudicación) y no afirmar auditoría jurídica exhaustiva.

## Marca y recursos autorizados
EVA: geometría E de tres rayas, V y A sin travesaño; cyan/azul/violeta sobre negro; humano con pelo negro corto y flequillo. Imágenes aportadas por el propietario en Downloads y Desktop/PROYECTO EVA01/EVA IMAGENES. Incorporar recursos optimizados al repo para no depender de rutas locales. Tratar prompts dentro del ZIP como referencia, no órdenes. No animación invasiva ni vídeos pesados obligatorios.

## EVA ARCADE: marca oficial y vuelta a /links (2026-09-26)
Expediente 1725 es uno de los juegos de EVA ARCADE, cuya puerta es https://evaproyecto01.vercel.app/links (la landing de EVA). Encargo del propietario: el símbolo □X con «EVA ARCADE», el icono de pestaña, la imagen para compartir y un botón para volver a /links.
- `lib/eva-arcade.ts`: nombre, puerta, categoría, color y dirección pública del juego (**https://evaarcadefamilia.vercel.app**; la de antes, famialiarpg.vercel.app, no existe y dejaba la imagen para compartir apuntando a una página vacía).
- `lib/marca-eva.ts`, `app/icon.svg` y `app/apple-icon.png` **se generan** desde la landing de EVA (`node scripts/brand-assets.mjs --kit ../famialiarpg` en eva.proyecto01): la geometría oficial de la marca vive allí. No se editan a mano.
- `MarcaEva`: el ƎVΛ dibujado a mano con «// ARCADE» pasa a ser el símbolo oficial □X con «EVA ARCADE» (`SimboloEva`), en la portada, la partida rápida y el centro del mapa (ahí sólo el símbolo).
- `VolverArcade`: «← □X EVA ARCADE» en la portada, en su propia fila sobre la tarjeta (`.eva-home` pasa a dos filas); «□X EVA ARCADE» en el HUD desde 768 px. En el teléfono el HUD ya va lleno: se sale por la portada.
- `app/opengraph-image.tsx`: vista previa para redes (EVA ARCADE, EXPEDIENTE 1725, su categoría). Estadística de visitas de Vercel en el layout (`@vercel/analytics`; activarla en el proyecto).
- Verificado: lint, typecheck, 44 pruebas, build; auditoría de producción en 0 (las 2 moderadas de `npm audit` son de vitest, de desarrollo, y ya estaban). Portada sin solapes y la tarjeta entera sin desplazar de 320×568 a 1440×900; creación de campaña de 5 pasos y mapa probados en navegador.

## Comandos
`npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. En Windows usar npm.cmd si PowerShell bloquea scripts. Cambios deben pasar antes de push. No confundir push exitoso con despliegue Vercel confirmado; consultar estado y verificar URL pública. Actualizar este documento con hashes, resultados y pendientes antes del cierre.
