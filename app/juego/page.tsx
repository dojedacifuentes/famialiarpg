"use client";
// ============================================================================
// MAPA DE LA CAMPAÑA — cuatro actos, quince capítulos.
// Cada destino muestra su estado con icono y texto (no sólo color): bloqueado,
// disponible, en curso (con progreso) o completado. El "siguiente objetivo"
// guía al jugador; la ficha del destino explica qué se juega y qué falta.
// ============================================================================
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGame, useMontado } from "@/store/useGame";
import {
  ACTOS, CAPITULOS, estadoCapitulo, progresoCapitulo, siguienteCapitulo, TEXTO_REQUISITO,
  type Capitulo, type EstadoCapitulo,
} from "@/data/capitulos";
import { NOMBRE_ESTADO_CIVIL, NOMBRE_LUGAR, NOMBRE_REGIMEN } from "@/data/escenario";
import GameShell from "@/components/ui/GameShell";
import Icono from "@/components/ui/Icono";
import { Paginado, useTamano } from "@/components/ui/Ajuste";
import { Progreso } from "@/components/ui/Actividad";
import { PlanoCiudad } from "@/components/arte/Escenario";

const ETIQUETA: Record<EstadoCapitulo, string> = {
  bloqueado: "Bloqueado",
  disponible: "Disponible",
  en_curso: "En curso",
  completado: "Completado",
};

function Emblema({ cap, estado, tam = 52, recomendado }: { cap: Capitulo; estado: EstadoCapitulo; tam?: number; recomendado?: boolean }) {
  const color = estado === "completado" ? "var(--verde)" : estado === "bloqueado" ? "#6b7288" : "var(--oro)";
  return (
    <span
      className="relative grid place-items-center rounded-full shrink-0"
      style={{
        width: tam, height: tam,
        background: estado === "bloqueado" ? "#11141c" : "radial-gradient(circle at 35% 30%, #2a2416, #12110d)",
        border: `2px ${estado === "bloqueado" ? "dashed" : "solid"} ${color}`,
        boxShadow: recomendado ? "0 0 0 4px rgba(224,178,92,.18), 0 0 22px rgba(224,178,92,.35)" : undefined,
        color,
      }}
      aria-hidden
    >
      <Icono nombre={estado === "bloqueado" ? "candado" : cap.icono} tam={Math.round(tam * 0.46)} />
      {estado === "completado" && (
        <span className="absolute -right-1 -bottom-1 grid place-items-center w-5 h-5 rounded-full" style={{ background: "var(--verde)", color: "#0b0d14" }}>
          <Icono nombre="check" tam={13} grosor={3} />
        </span>
      )}
    </span>
  );
}

export default function Juego() {
  const montado = useMontado();
  const router = useRouter();
  const game = useGame();
  const { personaje, finalizado, log } = game;
  const sig = siguienteCapitulo(game);
  const [acto, setActo] = useState<number | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    if (montado && !personaje.nombre) router.replace("/creacion");
  }, [montado, personaje.nombre, router]);

  const actoVisible = acto ?? sig?.acto ?? 1;
  const caps = useMemo(() => CAPITULOS.filter((c) => c.acto === actoVisible), [actoVisible]);
  const seleccionado = CAPITULOS.find((c) => c.id === sel) ?? (sig && sig.acto === actoVisible ? sig : caps[0]);

  if (!montado || !personaje.nombre) {
    return <GameShell titulo="Mapa del expediente" stats={false}><div /></GameShell>;
  }

  const completados = CAPITULOS.filter((c) => estadoCapitulo(c, game) === "completado").length;
  const actoInfo = ACTOS.find((a) => a.n === actoVisible)!;
  const completosActo = caps.filter((c) => estadoCapitulo(c, game) === "completado").length;
  const estadoSel = estadoCapitulo(seleccionado, game);
  const progSel = progresoCapitulo(seleccionado.id, game);

  const cambiarActo = (d: number) => {
    const n = Math.max(1, Math.min(ACTOS.length, actoVisible + d));
    setActo(n);
    const primero = CAPITULOS.find((c) => c.acto === n && (estadoCapitulo(c, game) === "disponible" || estadoCapitulo(c, game) === "en_curso")) ?? CAPITULOS.find((c) => c.acto === n);
    setSel(primero?.id ?? null);
  };

  const ficha = (
    <section className="panel marco p-3 flex flex-col gap-2 mapa-ficha" aria-label={`Destino: ${seleccionado.titulo}`} aria-live="polite">
      <div className="flex items-center gap-3">
        <Emblema cap={seleccionado} estado={estadoSel} tam={44} />
        <div className="min-w-0 flex-1">
          <div className="rotulo txt-oro">Cap. {seleccionado.numeral} · {NOMBRE_LUGAR[seleccionado.lugar]}</div>
          <h2 className="font-display font-bold txt-1 leading-tight">{seleccionado.titulo}</h2>
        </div>
        <span className="insignia" data-tono={estadoSel === "completado" ? "verde" : estadoSel === "bloqueado" ? undefined : "oro"}>{ETIQUETA[estadoSel]}</span>
      </div>
      <p className="t-meta txt-2">{seleccionado.subt}</p>
      {estadoSel === "bloqueado" ? (
        <p className="t-meta txt-2 flex gap-1.5"><Icono nombre="candado" tam={16} className="mt-0.5" /> {seleccionado.req ? TEXTO_REQUISITO[seleccionado.req] : ""}</p>
      ) : (
        <>
          <p className="t-meta txt-1 flex gap-1.5"><Icono nombre="bandera" tam={16} className="mt-0.5 txt-oro" /> {seleccionado.objetivo}</p>
          {progSel.hecho > 0 && <Progreso hecho={progSel.hecho} total={progSel.total} />}
        </>
      )}
      <div className="barra-accion !pt-1">
        {estadoSel === "bloqueado" ? (
          <button type="button" className="btn btn-secundario" disabled>
            <Icono nombre="candado" tam={18} /> Bloqueado
          </button>
        ) : (
          <Link href={`/mundo/${seleccionado.id}`} className="btn btn-primario">
            {estadoSel === "completado" ? "Revisar" : estadoSel === "en_curso" ? "Continuar" : "Entrar"} <Icono nombre="flechaDer" tam={18} />
          </Link>
        )}
      </div>
    </section>
  );

  return (
    <GameShell
      eyebrow={`Ciclo ${personaje.cicloVital} · ${completados}/${CAPITULOS.length} capítulos`}
      titulo={personaje.nombre}
      acciones={finalizado ? <Link href="/epilogo" className="btn btn-secundario" title="Leer epílogo"><Icono nombre="pergamino" tam={18} /><span className="hidden sm:inline">Epílogo</span></Link> : undefined}
    >
      <div className="mapa">
        <div className="mapa-tablero panel">
          <div className="mapa-acto">
            <button type="button" className="btn btn-secundario btn-icono" onClick={() => cambiarActo(-1)} disabled={actoVisible === 1} aria-label="Acto anterior">
              <Icono nombre="flechaIzq" tam={20} />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <h2 className="font-display font-bold txt-oro leading-tight">{actoInfo.titulo}</h2>
              <p className="t-meta txt-2">{completosActo}/{caps.length} completados<span className="hidden sm:inline"> · {actoInfo.lema}</span></p>
            </div>
            <button type="button" className="btn btn-secundario btn-icono" onClick={() => cambiarActo(1)} disabled={actoVisible === ACTOS.length} aria-label="Acto siguiente">
              <Icono nombre="flechaDer" tam={20} />
            </button>
          </div>
          <Ruta caps={caps} seleccion={seleccionado.id} recomendado={sig?.id} onSel={setSel} acto={actoVisible} />

        </div>
        <div className="mapa-lateral">
          {ficha}
          <div className="panel p-3 mapa-estado">
            <div className="rotulo mb-1">Tu situación</div>
            <p className="t-meta txt-2">
              {NOMBRE_ESTADO_CIVIL[personaje.estadoCivil] ?? personaje.estadoCivil}
              {personaje.regimen ? ` · ${NOMBRE_REGIMEN[personaje.regimen]}` : ""} · {game.bienes.length} bienes · {game.hijos.length} hijos
            </p>
          </div>
          <div className="panel p-3 mapa-estado flex-1 min-h-0 flex flex-col">
            <div className="rotulo mb-1">Registro reciente</div>
            <Paginado
              items={log.slice(0, 12)}
              clave={(l, i) => `${l.t}-${i}`}
              etiqueta="Registro"
              gap={4}
              render={(l) => (
                <p className="t-meta txt-2 border-l-2 border-oro/40 pl-2">{l.texto}</p>
              )}
            />
            {log.length === 0 && <p className="t-meta txt-3">Sin actuaciones. Pronto la lluvia jurídica caerá.</p>}
          </div>
        </div>
      </div>
    </GameShell>
  );
}

/** Ruta del acto: camino sinuoso sobre la ciudad en pantallas amplias; lista vertical paginada en teléfonos. */
function Ruta({ caps, seleccion, recomendado, onSel, acto }: { caps: Capitulo[]; seleccion: string; recomendado?: string; onSel: (id: string) => void; acto: number }) {
  const game = useGame();
  const [ref, tam] = useTamano<HTMLDivElement>();
  const amplio = tam.w >= 640 && tam.h >= 300;

  // Puntos del camino (en %), en zigzag de izquierda a derecha.
  const puntos = caps.map((_, i) => {
    const n = caps.length;
    const x = n === 1 ? 50 : 12 + (76 * i) / (n - 1);
    const y = i % 2 === 0 ? 34 : 70;
    return { x, y };
  });

  return (
    <div ref={ref} className="relative flex-1 min-h-0 flex flex-col">
      {amplio ? (
        <div className="absolute inset-0 overflow-hidden rounded-b-[10px]">
          <div className="absolute inset-0" aria-hidden>
            <PlanoCiudad />
          </div>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <polyline points={puntos.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#e0b25c" strokeOpacity="0.55" strokeWidth="0.6" strokeDasharray="1.5 1.2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
          </svg>
          <ol className="absolute inset-0" aria-label={`Capítulos del acto ${acto}`}>
            {caps.map((c, i) => {
              const est = estadoCapitulo(c, game);
              const pr = progresoCapitulo(c.id, game);
              return (
                <li key={c.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${puntos[i].x}%`, top: `${puntos[i].y}%` }}>
                  <motion.button
                    type="button"
                    whileHover={{ y: -3 }}
                    onClick={() => onSel(c.id)}
                    aria-pressed={seleccion === c.id}
                    className={`flex flex-col items-center gap-1 w-[9.5rem] p-1.5 rounded-lg text-center ${seleccion === c.id ? "bg-[rgba(224,178,92,.12)] outline outline-2 outline-[var(--oro)]" : ""}`}
                  >
                    <Emblema cap={c} estado={est} recomendado={recomendado === c.id} />
                    <span className="t-meta font-bold txt-1 leading-tight rounded px-1" style={{ background: "rgba(11,13,20,.85)" }}>{c.numeral} · {c.titulo}</span>
                    <span className="t-micro txt-2 rounded px-1" style={{ background: "rgba(11,13,20,.85)" }}>
                      {ETIQUETA[est]}{est === "en_curso" ? ` ${pr.hecho}/${pr.total}` : ""}
                      {recomendado === c.id ? " · Siguiente" : ""}
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col px-2 pb-1">
          <Paginado
            items={caps}
            clave={(c) => c.id}
            etiqueta="Capítulos"
            gap={6}
            reinicio={acto}
            render={(c) => {
              const est = estadoCapitulo(c, game);
              const pr = progresoCapitulo(c.id, game);
              return (
                <button type="button" onClick={() => onSel(c.id)} aria-pressed={seleccion === c.id} className="eleccion !flex-row !items-center gap-3">
                  <Emblema cap={c} estado={est} tam={44} recomendado={recomendado === c.id} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold txt-1 leading-tight">{c.numeral} · {c.titulo}</span>
                    <span className="block t-meta txt-2">
                      {ETIQUETA[est]}{est === "en_curso" ? ` · ${pr.hecho}/${pr.total}` : ""}
                      {recomendado === c.id && <span className="txt-oro"> · Siguiente objetivo</span>}
                    </span>
                  </span>
                </button>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
