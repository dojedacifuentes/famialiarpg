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

## Comandos
`npm ci`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. En Windows usar npm.cmd si PowerShell bloquea scripts. Cambios deben pasar antes de push. No confundir push exitoso con despliegue Vercel confirmado; consultar estado y verificar URL pública. Actualizar este documento con hashes, resultados y pendientes antes del cierre.
