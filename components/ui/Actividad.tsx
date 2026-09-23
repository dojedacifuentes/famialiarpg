"use client";
// ============================================================================
// ACTIVIDAD — marco común de los paneles jugables de cada capítulo.
// Cabecera con objetivo y progreso · (escritorio) escenario lateral · cuerpo
// que ocupa el alto restante. La regla jurídica del panel se presenta una vez
// como diapositiva previa y queda consultable en una hoja acotada.
// ============================================================================
import { useState, type ReactNode } from "react";
import { useGame } from "@/store/useGame";
import type { Lugar, TipoRetrato } from "@/data/escenario";
import Escenario from "@/components/arte/Escenario";
import Retrato, { type Animo } from "@/components/arte/Retrato";
import { Paginado } from "./Ajuste";
import Hoja from "./Hoja";
import Icono from "./Icono";

export type ReglaPanel = { titulo: string; parrafos: ReactNode[]; articulo?: string };

export function Progreso({ hecho, total, etiqueta }: { hecho: number; total: number; etiqueta?: string }) {
  const pct = total > 0 ? Math.round((hecho / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0" role="group" aria-label={`${etiqueta ?? "Progreso"}: ${hecho} de ${total}`}>
      <div className="progreso flex-1" aria-hidden><span style={{ width: `${pct}%` }} /></div>
      <span className="t-meta txt-2 cifra shrink-0">{hecho}/{total}</span>
    </div>
  );
}

export default function Actividad({
  titulo,
  objetivo,
  progreso,
  regla,
  introClave,
  lugar,
  retrato,
  animo = "neutral",
  accion,
  children,
}: {
  titulo: string;
  objetivo?: string;
  progreso?: { hecho: number; total: number };
  regla?: ReglaPanel;
  /** Si se indica, la regla se muestra como diapositiva la primera vez. */
  introClave?: string;
  lugar?: Lugar;
  retrato?: TipoRetrato;
  animo?: Animo;
  /** Botón extra en la cabecera (p. ej. "inscribir otro"), para no ocupar una fila. */
  accion?: ReactNode;
  children: ReactNode;
}) {
  const hechos = useGame((s) => s.hechos);
  const registrarHecho = useGame((s) => s.registrarHecho);
  const sexo = useGame((s) => s.personaje.sexo);
  const [verRegla, setVerRegla] = useState(false);
  const enIntro = !!(introClave && regla && !(introClave in hechos));

  return (
    <div className="actividad">
      {lugar && (
        <div className="visual actividad-visual" aria-hidden>
          <Escenario lugar={lugar} />
          {retrato && (
            <div className="retrato-escena">
              <Retrato tipo={retrato} animo={animo} sexo={sexo} className="w-full h-full respirar" />
            </div>
          )}
        </div>
      )}
      <section className="panel marco actividad-cuerpo" aria-label={titulo}>
        <header className="actividad-cabecera">
          <div className="flex items-start gap-2">
            <h2 className="t-titulo txt-oro flex-1 min-w-0">{titulo}</h2>
            {!enIntro && accion}
            {regla && !enIntro && (
              <button type="button" className="btn btn-secundario btn-icono" onClick={() => setVerRegla(true)} aria-label={`Ver la regla: ${regla.titulo}`} title="Ver la regla jurídica">
                <Icono nombre="info" tam={20} />
              </button>
            )}
          </div>
          {objetivo && (
            <p className="t-meta txt-2 flex items-start gap-1.5 actividad-objetivo">
              <Icono nombre="bandera" tam={16} className="mt-0.5 txt-oro" />
              <span><span className="sr-only">Objetivo: </span>{objetivo}</span>
            </p>
          )}
          {progreso && <Progreso hecho={progreso.hecho} total={progreso.total} />}
        </header>

        {enIntro && regla ? (
          <>
            <div className="flex flex-col flex-1 min-h-0">
              <div className="rotulo txt-violeta mb-2">Antes de actuar · {regla.titulo}</div>
              <Paginado
                items={regla.parrafos}
                clave={(_, i) => `r${i}`}
                render={(p) => <div className="t-lectura txt-1">{p}</div>}
                gap={10}
                etiqueta="Regla"
              />
              {regla.articulo && <div className="mt-2"><span className="articulo">{regla.articulo}</span></div>}
            </div>
            <div className="barra-accion">
              <button type="button" className="btn btn-primario" onClick={() => registrarHecho(introClave!)}>
                Comenzar <Icono nombre="flechaDer" tam={18} />
              </button>
            </div>
          </>
        ) : (
          children
        )}
      </section>

      {regla && (
        <Hoja abierta={verRegla} onCerrar={() => setVerRegla(false)} titulo={regla.titulo}>
          <div className="space-y-3">
            {regla.parrafos.map((p, i) => <div key={i} className="t-lectura txt-1">{p}</div>)}
            {regla.articulo && <span className="articulo">{regla.articulo}</span>}
          </div>
        </Hoja>
      )}
    </div>
  );
}
