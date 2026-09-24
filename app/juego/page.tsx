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
import MarcaEva from "@/components/eva/MarcaEva";
import { useGame, useMontado } from "@/store/useGame";
import {
  ACTOS, CAPITULOS, contextualizarCapitulo, estadoCapitulo, progresoCapitulo, siguienteCapitulo, TEXTO_REQUISITO,
  type Capitulo, type EstadoCapitulo,
} from "@/data/capitulos";
import { NOMBRE_ESTADO_CIVIL, NOMBRE_LUGAR, NOMBRE_REGIMEN } from "@/data/escenario";
import GameShell from "@/components/ui/GameShell";
import Icono from "@/components/ui/Icono";
import { Paginado } from "@/components/ui/Ajuste";
import { Progreso } from "@/components/ui/Actividad";

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
  const caps = useMemo(() => CAPITULOS.filter((c) => c.acto === actoVisible).map((c) => contextualizarCapitulo(c, personaje.regimen)), [actoVisible, personaje.regimen]);
  const seleccionado = caps.find((c) => c.id === sel) ?? caps.find((c) => c.id === sig?.id) ?? caps[0];

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

/** Mapa orbital: todos los destinos del acto caben sin arrastre horizontal. */
function Ruta({ caps, seleccion, recomendado, onSel, acto }: { caps: Capitulo[]; seleccion: string; recomendado?: string; onSel: (id: string) => void; acto: number }) {
  const game = useGame();
  const puntos = caps.map((_, i) => {
    const angulo = -Math.PI / 2 + (2 * Math.PI * i) / caps.length;
    return { x: 50 + Math.cos(angulo) * 35, y: 50 + Math.sin(angulo) * 34 };
  });
  return <>
    <div className="eva-orbita" role="group" aria-label={`Capítulos del acto ${acto}`}>
      <div className="eva-orbita-centro"><MarcaEva compacta /></div>
      {caps.map((c, i) => {
        const est = estadoCapitulo(c, game);
        return <button key={c.id} type="button" className="eva-nodo" data-estado={est}
          style={{ left: `${puntos[i].x}%`, top: `${puntos[i].y}%` }}
          aria-pressed={seleccion === c.id} aria-label={`${c.numeral}. ${c.titulo}. ${ETIQUETA[est]}${recomendado === c.id ? ". Siguiente objetivo" : ""}`}
          onClick={() => onSel(c.id)}>
          <Icono nombre={est === "completado" ? "check" : est === "bloqueado" ? "candado" : c.icono} tam={20}/>
          <span>{c.numeral}</span><small>{recomendado === c.id ? "Siguiente" : est === "completado" ? "Hecho" : est === "bloqueado" ? "Cerrado" : "Abrir"}</small>
        </button>;
      })}
    </div>
    <p className="eva-mapa-leyenda"><span>○ Selecciona un nodo</span><span>✓ Completado</span><span>⌁ Ruta del expediente</span></p>
  </>;
}
