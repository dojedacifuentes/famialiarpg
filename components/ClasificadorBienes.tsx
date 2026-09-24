"use client";
// ============================================================================
// CLASIFICADOR DEL HABER — arts. 1725, 1726, 1727, 1736, 150 CC.
// Un caso por diapositiva. El avance vive en el guardado (hechos), así que
// recargar o volver no repite casos ni duplica bienes. Los casos fallados
// vuelven en una "segunda revisión": aprender del error sin castigo extra.
// Recompensa por comprensión: +1 Inteligencia jurídica sólo si aciertas al
// primer intento y sin consultar la pista.
// ============================================================================
import { useMemo, useState } from "react";
import { useGame } from "@/store/useGame";
import { asientoRecompensa, clasificarCaso } from "@/lib/clasificacion";
import type { Bien, ClaseBien } from "@/types/game";
import { CASOS_HABER } from "@/data/casos";
import { ICONO_NATURALEZA, NOMBRE_CLASE, NOMBRE_NATURALEZA, pesos } from "@/data/escenario";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad from "@/components/ui/Actividad";
import Consecuencia, { BotonContinuar } from "@/components/ui/Consecuencia";
import { useLectura } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";
import Link from "next/link";
import { casoParaRegimen, opcionesPatrimoniales, REGIMENES } from "@/lib/regimenes";


type Resultado = { i: number; elegida: ClaseBien; ok: boolean; correcta: ClaseBien; justificacion: string; articulo: string; deltas: Delta[]; repaso: boolean; pista: boolean };

export default function ClasificadorBienes() {
  const game = useGame();
  const { hechos, personaje } = game;
  const regimen = personaje.regimen ?? "sociedad_conyugal";
  const contexto = REGIMENES[regimen];
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const lectura = useLectura();
  const cap = capitulo("haber")!;

  const pendientes = CASOS_HABER.map((_, i) => i).filter((i) => !(`haber:${i}` in hechos));
  const repaso = CASOS_HABER.map((_, i) => i).filter((i) => hechos[`haber:${i}`] === "error" && !(`haber:rep:${i}` in hechos));
  const enRepaso = pendientes.length === 0;
  const actual = enRepaso ? repaso[0] : pendientes[0];
  const caso = useMemo(() => actual !== undefined ? casoParaRegimen(CASOS_HABER[actual], regimen, personaje.sexo) : undefined, [actual, regimen, personaje.sexo]);
  const pistaVista = actual !== undefined && `haber:pista:${actual}` in hechos;
  const aciertos = CASOS_HABER.filter((_, i) => hechos[`haber:${i}`] === "ok").length;
  const progreso = progresoCapitulo("haber", game);

  const corr = useMemo(() => (caso ? clasificarCaso(caso, personaje.sexo, regimen) : null), [caso, personaje.sexo, regimen]);

  function responder(c: ClaseBien) {
    if (!caso || !corr || actual === undefined) return;
    const i = actual;
    const clave = enRepaso ? `haber:rep:${i}` : `haber:${i}`;
    const ok = corr.clase === c;
    let registrado = false;
    const deltas = conCambios(() => {
      registrado = game.registrarHecho(clave, ok ? "ok" : "error");
      if (!registrado) return;
      if (ok) {
        if (!enRepaso && !pistaVista) game.ajustarAtributo("inteligencia_juridica", 1);
        const bien: Bien = {
          id: `haber-c${personaje.cicloVital}-${i}`,
          nombre: caso.nombre,
          valor: caso.valor,
          naturaleza: caso.naturaleza,
          fuente: caso.fuente,
          tituloOnerosoOGratuito: caso.tituloOnerosoOGratuito,
          adquiridoAntesDelMatrimonio: caso.adquiridoAntesDelMatrimonio,
          subroga: caso.subroga,
          clase: corr.clase,
          titular: corr.adquirente,
          regimenAdquisicion: regimen,
          casoDidactico: true,
          generaRecompensa: corr.recompensa,
        };
        game.addBien(bien);
        if (corr.recompensa > 0) {
          game.addRecompensa({
            id: `rec-c${personaje.cicloVital}-${i}`,
            ...asientoRecompensa(caso, corr.adquirente),
            monto: corr.recompensa,
            motivo: `Por ${caso.nombre}`,
            articulo: corr.articulo,
          });
        }
        game.pushLog(`Clasificaste correctamente: ${caso.nombre} → ${NOMBRE_CLASE[corr.clase]}`, corr.articulo);
      } else if (!enRepaso) {
        game.ajustarTrauma(1);
        game.pushLog(`Error en ${caso.nombre}. La doctrina te juzga.`, "GLITCH");
      }
    });
    if (!registrado) return;
    setResultado({ i, elegida: c, ok, correcta: corr.clase, justificacion: corr.justificacion, articulo: corr.articulo, deltas, repaso: enRepaso, pista: pistaVista });
  }

  function terminar() {
    const st = useGame.getState();
    const ok = CASOS_HABER.filter((_, i) => st.hechos[`haber:${i}`] === "ok").length;
    if (ok / CASOS_HABER.length >= 0.8) {
      st.desbloquearLogro({ id: "haber_notarial", titulo: "Intuición notarial", descripcion: "Clasificaste al menos el 80 % del haber al primer intento.", articulo: "Art. 1725 CC", desbloqueado: true });
    }
    st.registrarHecho("haber:fin");
  }

  const regla = {
    titulo: contexto.taller,
    parrafos: [
      <>{contexto.regla}</>,
    ],
    articulo: contexto.articulo,
  };

  // ── Resultado de un caso ──────────────────────────────────────────────
  if (resultado) {
    const r = resultado;
    return (
      <Actividad titulo={r.repaso ? "Segunda revisión" : `Caso ${r.i + 1} de ${CASOS_HABER.length}`} progreso={progreso} regla={regla} lugar="despacho" retrato="contador" animo={r.ok ? "aprueba" : "duda"}>
        <div className="cuerpo">
          <Consecuencia
            reinicio={`${r.i}-${r.repaso}`}
            lectura={lectura}
            tono={r.ok ? "exito" : "fallo"}
            titulo={r.ok ? `Correcto: ${NOMBRE_CLASE[r.correcta]}` : `La respuesta era: ${NOMBRE_CLASE[r.correcta]}`}
            narrativa={
              r.ok
                ? r.repaso ? "Esta vez lo viste. El bien queda inscrito en tu inventario." : r.pista ? "Correcto, con ayuda de la pista: el bien entra al inventario, sin bonificación." : "El contador asiente sin levantar la vista. El bien entra a tu inventario."
                : `Elegiste «${NOMBRE_CLASE[r.elegida]}». ${r.repaso ? "Queda para el códex: relee la regla." : "Este caso volverá en la segunda revisión."}`
            }
            deltas={r.deltas}
            regla={{ articulo: r.articulo, texto: r.justificacion, codex: regimen === "sociedad_conyugal" ? "1725" : undefined }}
          />
        </div>
        <div className="barra-accion">
          <BotonContinuar lectura={lectura} onClick={() => setResultado(null)}>
            Siguiente caso <Icono nombre="flechaDer" tam={18} />
          </BotonContinuar>
        </div>
      </Actividad>
    );
  }

  // ── Fin ───────────────────────────────────────────────────────────────
  if (!caso || !corr) {
    const porcentaje = Math.round((aciertos / CASOS_HABER.length) * 100);
    const terminado = "haber:fin" in hechos;
    return (
      <Actividad titulo="Clasificación completa" objetivo={cap.objetivo} progreso={progreso} regla={regla} lugar="despacho" retrato="contador" animo={porcentaje >= 80 ? "aprueba" : "neutral"}>
        <div className="cuerpo">
          <Consecuencia
            tono={porcentaje >= 50 ? "exito" : "fallo"}
            titulo={`${aciertos} de ${CASOS_HABER.length} aciertos al primer intento (${porcentaje} %).`}
            narrativa={
              <>
                {porcentaje >= 80 && "Tu intuición patrimonial es notarial. "}
                {porcentaje < 50 && `Revisa la regla: ${contexto.articulo}. `}
                Los bienes correctamente clasificados se han registrado en tu inventario.
              </>
            }
            deltas={porcentaje >= 80 ? [{ texto: "Logro disponible: Intuición notarial", signo: "•", tono: "oro" }] : []}
            regla={{ articulo: contexto.articulo, texto: contexto.regla }}
          />
        </div>
        <div className="barra-accion">
          <Link href="/inventario" className="btn btn-secundario">Ver inventario</Link>
          {terminado ? (
            <Link href="/juego" className="btn btn-primario">Volver al mapa <Icono nombre="mapa" tam={18} /></Link>
          ) : (
            <button type="button" className="btn btn-primario" onClick={terminar}>Cerrar el despacho <Icono nombre="check" tam={18} /></button>
          )}
        </div>
      </Actividad>
    );
  }

  // ── Caso actual ───────────────────────────────────────────────────────
  const chips = [
    NOMBRE_NATURALEZA[caso.naturaleza],
    caso.fuente.replace(/_/g, " "),
    caso.tituloOnerosoOGratuito ? `título ${caso.tituloOnerosoOGratuito}` : null,
    caso.adquiridoAntesDelMatrimonio ? "antes del matrimonio" : "durante el matrimonio",
  ].filter(Boolean) as string[];

  return (
    <Actividad
      titulo={enRepaso ? `Segunda revisión · ${repaso.length} por revisar` : `Caso ${actual! + 1} de ${CASOS_HABER.length}`}
      objetivo={cap.objetivo}
      progreso={progreso}
      regla={regla}
      introClave="intro:haber"
      lugar="despacho"
      retrato="contador"
      accion={
        !pistaVista ? (
          <button type="button" className="btn btn-secundario" onClick={() => game.registrarHecho(`haber:pista:${actual}`)} title="Consultar pista (sin bonificación de Inteligencia jurídica)">
            <Icono nombre="lampara" tam={18} /> Pista
          </button>
        ) : undefined
      }
    >
      <div className="cuerpo gap-2">
        <article className="tarjeta tarjeta-alta" aria-label="Bien a clasificar">
          <h3 className="t-base font-bold txt-1 flex gap-2">
            <Icono nombre={ICONO_NATURALEZA[caso.naturaleza] ?? "documento"} tam={22} className="txt-oro mt-0.5" />
            <span>{caso.nombre}</span>
          </h3>
          <p className="t-meta txt-2 mt-1">
            <span className="txt-oro cifra font-bold">{pesos(caso.valor)}</span> · {chips.join(" · ")}
          </p>
          {regimen !== "sociedad_conyugal" && <p className="t-meta txt-cian mt-1">Supuesto acreditado: adquiere {corr.adquirente === "mujer" ? "la mujer" : "el marido"}, a su nombre y con fondos propios. Cada caso es independiente.</p>}
          {pistaVista && (
            <p className="t-meta txt-violeta flex gap-1.5 mt-1"><Icono nombre="lampara" tam={16} className="mt-0.5" /> <span>Pista: {caso.pista}</span></p>
          )}
        </article>
        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 mb-1.5">
            <span className="rotulo" id="clases-haber">¿Dónde va este bien?</span>
            <span className="t-micro txt-3">{pistaVista ? "Con pista: sin bonificación" : "Sin pista: +1 Int. jurídica si aciertas"}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2" role="group" aria-labelledby="clases-haber">
            {opcionesPatrimoniales(regimen).map((c) => (
              <button key={c} type="button" className="btn btn-secundario text-left justify-start" onClick={() => responder(c)}>
                {NOMBRE_CLASE[c]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Actividad>
  );
}
