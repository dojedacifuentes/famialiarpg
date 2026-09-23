# Revisión jurídica pendiente

Durante el rediseño (v3) el contenido jurídico **no se modificó**: textos, artículos,
condiciones y excepciones se trasladaron tal cual. Estas son las dudas detectadas al
leerlo, para que las revise alguien con autoridad docente antes de cambiar nada.
Ninguna se "corrigió" en el código.

## Posibles desactualizaciones o imprecisiones

| # | Dónde | Texto actual | Duda |
|---|---|---|---|
| 1 | `lib/reglas.ts` (`CAUSALES_CULPOSAS`), `data/codex.ts` (tema "Causales de divorcio culposo") | Art. 54 N°4 LMC: "Conducta homosexual" | La Ley 21.400 (matrimonio igualitario) habría suprimido esta causal. Verificar el texto vigente del art. 54 y la numeración (el ítem 7 dice "numeración refundida"). |
| 2 | `components/HijosPanel.tsx` (regla del panel) | Cuidado personal "preferente la madre salvo acuerdo o resolución judicial" (art. 225 CC) | La Ley 20.680 (2013) eliminó la preferencia materna del art. 225. |
| 3 | `data/dialogos.ts` (`filiacion_intro`), `FiliacionAccionesPanel`, `data/codex.ts` | Reclamación: "dos años para los demás legitimados desde el fallecimiento (art. 206)" | El art. 206 CC fija **tres** años desde la muerte (hijo póstumo o padre/madre fallecido dentro de 180 días). |
| 4 | `lib/reglas.ts` (`ARTICULOS_DESTACADOS`) | "208 CC: plazos para impugnación de la paternidad por el marido"; "212 CC: impugnación por el hijo" | Parecen invertidos o mal atribuidos: el art. 212 regula la impugnación del marido (180 días / 1 año); la del hijo está en el art. 214; el 208 trata la reclamación con impugnación simultánea. |
| 5 | `data/codex.ts` (tema "Administración"), `lib/reglas.ts` (comentario y `ARTICULOS_DESTACADOS`) | "Art. 1754: la mujer no puede enajenar ni gravar sus bienes propios sin autorización del marido" | El inciso final del art. 1754 dice que la mujer no puede enajenar o gravar los bienes propios **que administre el marido**, salvo los casos de los arts. 138 y 138 bis; el inciso 1° exige la voluntad de la mujer para que el marido enajene esos bienes. Verificar además si hay reformas recientes a la administración de la sociedad conyugal (art. 1749). |
| 6 | `data/examen.ts` (última pregunta) | Respuesta correcta: "Causa nulidad relativa de prescripción 4 años"; explicación: "prescribe en un año desde la celebración (art. 44 LMC)" | La respuesta marcada contradice su propia explicación. Además, la LMC de 2004 no contempla la incompetencia del oficial civil como causal de nulidad. |
| 7 | `components/CrisisPanel.tsx` | "Simular venta (fraude)" citado como "Art. 1723 inc. 2 / nulidad" | El art. 1723 trata la sustitución del régimen durante el matrimonio; la cita de la simulación parece otra. |

## Lógica de juego con implicancia jurídica (no se cambió)

- **Culpa y compensación económica.** `CompensacionEconomicaPanel` considera "culpable" al
  jugador si existen los flags `incumplio_131`, `prueba_infidelidad` o `denuncia_vif`.
  Pero `prueba_infidelidad` se obtiene al **reunir prueba contra el otro cónyuge**
  (escena del hotel y panel de crisis), y `denuncia_vif` al **denunciar** violencia sufrida.
  El art. 62 inc. 2° LMC se refiere al cónyuge que dio lugar al divorcio por su culpa.
  Del mismo modo, en el panel de crisis "Acopiar prueba" registra un incumplimiento con
  causal culposa que el epílogo atribuye al jugador.
- **Bajas generales.** `liquidar()` usa como bajas generales sólo las recompensas del haber
  relativo ("simplificación didáctica del art. 959"). Está declarado en el código; se deja
  constancia por si se quiere explicitar en pantalla.
- **Nulidad.** Las causales distintas del vínculo no disuelto se resuelven con azar (60 %).
  Ahora se permite un intento por causal y ciclo, para que no se pueda insistir hasta ganar.

## Correcciones de programación hechas en el rediseño

No cambian reglas; hacen que el juego aplique la que ya declaraba.

1. **Clasificador del haber: el adquirente sale del enunciado.** Antes se usaba siempre el sexo
   del personaje jugador, de modo que "Parcela donada a la mujer" era *propio del marido*
   si jugabas con un hombre, y el sueldo por trabajo separado de la mujer caía al haber
   absoluto (art. 1739). Ver `data/casos.ts` (`adquirente`) y `tests/reglas.test.ts`.
2. **Recompensa por mejoras (art. 1746).** El asiento registraba a la sociedad como deudora;
   la justificación del caso dice que la sociedad tiene derecho a recompensa. Ahora la
   acreedora es la sociedad.
3. **Bienes familiares.** Declarar un bien cambiaba su clase a "familiar" y lo sacaba del
   haber social en la liquidación, contra la regla del propio panel ("su afectación no muda
   el dominio"). Ahora sólo se marca la declaración; la migración recupera la clase de los
   bienes ya declarados.
4. **Segunda vida.** El flag del inventario solemne (arts. 124-127), decidido en la escena de
   segunda vida, se borraba al empezar el ciclo nuevo; ahora se conserva.
5. **Callejón sin salida.** Ocultar un vínculo anterior en el acto constitutivo dejaba
   bloqueado el capítulo II. El acto se celebró (con nulidad latente), así que el capítulo II
   se abre también con ese antecedente.
