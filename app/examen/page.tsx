"use client";
// ============================================================================
// MODO EXAMEN — cédula de 20 preguntas. Pregunta y resultado son diapositivas
// separadas: la explicación normativa nunca empuja las opciones fuera de la
// pantalla. Las respuestas se guardan (recargar no reinicia) y, al terminar,
// se pueden repasar los errores sin tocar la nota.
// ============================================================================
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGame, useMontado } from "@/store/useGame";
import { PREGUNTAS } from "@/data/examen";
import GameShell from "@/components/ui/GameShell";
import Consecuencia, { BotonContinuar } from "@/components/ui/Consecuencia";
import { Paginado, useLectura } from "@/components/ui/Ajuste";
import { Progreso } from "@/components/ui/Actividad";
import Icono from "@/components/ui/Icono";
import Escenario from "@/components/arte/Escenario";
import Retrato from "@/components/arte/Retrato";

const LETRAS = ["A", "B", "C", "D", "E"];

export default function ExamenPage() {
  const montado = useMontado();
  const game = useGame();
  const respuestas = (Array.isArray(game.hechos["examen:respuestas"]) ? game.hechos["examen:respuestas"] : []) as number[];
  const [viendo, setViendo] = useState<number | null>(null); // índice de la pregunta cuyo resultado se muestra
  const [repaso, setRepaso] = useState<number | null>(null); // posición dentro de la lista de errores
  const lectura = useLectura();

  const i = respuestas.length;
  const terminado = i >= PREGUNTAS.length;
  const aciertos = respuestas.filter((r, k) => r === PREGUNTAS[k]?.correcta).length;
  const nota = (aciertos / PREGUNTAS.length) * 7;
  const errores = respuestas.map((r, k) => (r === PREGUNTAS[k].correcta ? -1 : k)).filter((k) => k >= 0);

  // Registro final (una sola vez por intento).
  useEffect(() => {
    if (!montado || !terminado || "examen:registrado" in game.hechos) return;
    game.registrarHecho("examen:registrado");
    if (aciertos >= PREGUNTAS.length * 0.7) {
      game.setFlag("examen_aprobado");
      game.desbloquearLogro({ id: "examen", titulo: "Cédula aprobada", descripcion: "Aprobaste el modo examen con nota igual o superior a 4,9.", articulo: "—", desbloqueado: true });
    }
    game.pushLog(`Examen de grado simulado finalizado. Nota: ${nota.toFixed(1)}`, "EXAMEN");
  }, [montado, terminado, aciertos, nota, game]);

  function contestar(idx: number) {
    if (terminado || viendo !== null) return;
    game.fijarAvance("examen:respuestas", [...respuestas, idx]);
    setViendo(i);
  }

  function repetir() {
    game.fijarAvance("examen:respuestas", undefined);
    game.fijarAvance("examen:registrado", undefined);
    setViendo(null);
    setRepaso(null);
  }

  // Teclado: 1-4 o A-D para responder.
  const ref = useRef(contestar);
  ref.current = contestar;
  useEffect(() => {
    const t = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [role='dialog']")) return;
      const k = e.key.toUpperCase();
      const n = /^[1-5]$/.test(k) ? Number(k) - 1 : LETRAS.indexOf(k);
      if (n >= 0) ref.current(n);
    };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, []);

  const volver = montado && game.personaje.nombre ? { href: "/juego", etiqueta: "Volver al mapa" } : { href: "/", etiqueta: "Volver a la portada" };
  const shell = (children: React.ReactNode, eyebrow: string) => (
    <GameShell eyebrow={eyebrow} titulo="Cédula de grado" volver={volver} stats={false} nav={montado && !!game.personaje.nombre}>
      <div className="actividad">
        <div className="visual actividad-visual" aria-hidden>
          <Escenario lugar="aula" />
          <div className="retrato-escena"><Retrato tipo="jueza" animo={viendo !== null && respuestas[viendo] !== PREGUNTAS[viendo]?.correcta ? "duda" : "neutral"} className="w-full h-full respirar" /></div>
        </div>
        <section className="panel marco actividad-cuerpo">{children}</section>
      </div>
    </GameShell>
  );

  if (!montado) return shell(<div />, "Modo examen");

  // ── Resultado de una pregunta (o repaso de errores) ──
  const mostrar = repaso !== null ? errores[repaso] : viendo;
  if (mostrar !== null && mostrar !== undefined) {
    const p = PREGUNTAS[mostrar];
    const r = respuestas[mostrar];
    const ok = r === p.correcta;
    const enRepaso = repaso !== null;
    return shell(
      <>
        <header className="actividad-cabecera">
          <div className="rotulo txt-oro">{enRepaso ? `Repaso de errores · ${repaso! + 1} de ${errores.length}` : `Pregunta ${mostrar + 1} de ${PREGUNTAS.length}`}</div>
          <p className="t-base txt-2">{p.q}</p>
        </header>
        <div className="cuerpo">
          <Consecuencia
            reinicio={`${mostrar}-${enRepaso}`}
            lectura={lectura}
            tono={ok ? "exito" : "fallo"}
            titulo={ok ? "Correcto" : "Incorrecto"}
            narrativa={
              <span className="block space-y-1">
                <span className="block"><span className="txt-3">Respuesta correcta: </span>{LETRAS[p.correcta]}. {p.opciones[p.correcta]}</span>
                {!ok && <span className="block"><span className="txt-3">Tu respuesta: </span>{LETRAS[r]}. {p.opciones[r]}</span>}
              </span>
            }
            deltas={[{ texto: `Aciertos: ${respuestas.slice(0, mostrar + 1).filter((x, k) => x === PREGUNTAS[k].correcta).length}`, signo: "•", tono: "oro" }]}
            regla={{ articulo: p.art, texto: p.explicacion }}
          />
        </div>
        <div className="barra-accion">
          {enRepaso ? (
            <>
              <button type="button" className="btn btn-secundario" onClick={() => setRepaso(null)}>Terminar repaso</button>
              {repaso! < errores.length - 1 && <button type="button" className="btn btn-primario" onClick={() => setRepaso(repaso! + 1)}>Siguiente error <Icono nombre="flechaDer" tam={18} /></button>}
            </>
          ) : (
            <BotonContinuar lectura={lectura} onClick={() => setViendo(null)}>
              {mostrar + 1 >= PREGUNTAS.length ? "Ver la nota" : "Siguiente pregunta"} <Icono nombre="flechaDer" tam={18} />
            </BotonContinuar>
          )}
        </div>
      </>,
      "Modo examen"
    );
  }

  // ── Nota final ──
  if (terminado) {
    return shell(
      <>
        <div className="cuerpo">
          <Consecuencia
            tono={nota >= 4.0 ? "exito" : "fallo"}
            titulo={`Nota: ${nota.toFixed(1)}`}
            narrativa={<>Aciertos: {aciertos} / {PREGUNTAS.length}. {nota >= 4.0 ? "Aprobado. La comisión asiente con cansancio." : "Reprobado. Vuelve a estudiar el Libro I del CC y la LMC."}</>}
            deltas={aciertos >= PREGUNTAS.length * 0.7 ? [{ texto: "Logro: Cédula aprobada", signo: "•", tono: "oro" }] : [{ texto: "El logro exige 70 % de aciertos (nota 4,9)", signo: "•", tono: "cian" }]}
          />
        </div>
        <div className="barra-accion">
          {errores.length > 0 && <button type="button" className="btn btn-secundario" onClick={() => setRepaso(0)}><Icono nombre="recuerdo" tam={18} /> Repasar errores ({errores.length})</button>}
          <button type="button" className="btn btn-secundario" onClick={repetir}>Repetir examen</button>
          <Link href={volver.href} className="btn btn-primario">{volver.etiqueta}</Link>
        </div>
      </>,
      "Cédula final"
    );
  }

  // ── Pregunta ──
  const p = PREGUNTAS[i];
  return shell(
    <>
      <header className="actividad-cabecera">
        <div className="flex justify-between gap-2 t-meta"><span className="rotulo txt-oro">Pregunta {i + 1} de {PREGUNTAS.length}</span><span className="txt-2">Aciertos: {aciertos}</span></div>
        <Progreso hecho={i} total={PREGUNTAS.length} etiqueta="Preguntas respondidas" />
      </header>
      <h2 className="t-lectura font-bold txt-1" id="pregunta">{p.q}</h2>
      <div className="cuerpo">
        <Paginado
          items={p.opciones}
          clave={(_, k) => `${i}-${k}`}
          etiqueta="Opciones"
          reinicio={i}
          render={(op, k) => (
            <button type="button" className="opcion" onClick={() => contestar(k)} aria-describedby="pregunta">
              <span className="tecla" aria-hidden>{LETRAS[k]}</span>
              <span className="flex-1">{op}</span>
            </button>
          )}
        />
      </div>
    </>,
    "Modo examen"
  );
}
