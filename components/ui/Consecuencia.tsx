"use client";
// ============================================================================
// CONSECUENCIA — el ciclo situación → decisión → consecuencia se cierra aquí.
// Separa siempre lo NARRATIVO (qué pasó en la historia) de la REGLA JURÍDICA
// (por qué), y enseña qué cambió en el estado del juego. Si no cabe, pagina.
// ============================================================================
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Delta } from "@/lib/deltas";
import { Paginado, type Lectura } from "./Ajuste";
import Icono from "./Icono";

export type Tono = "exito" | "fallo" | "neutral";

const SELLO: Record<Tono, { texto: string; clase: string; icono: "check" | "cruz" | "sello" }> = {
  exito: { texto: "Acierto", clase: "txt-verde", icono: "check" },
  fallo: { texto: "Revés", clase: "txt-rojo", icono: "cruz" },
  neutral: { texto: "Decidido", clase: "txt-oro", icono: "sello" },
};

export function ListaDeltas({ deltas }: { deltas: Delta[] }) {
  if (deltas.length === 0) return <p className="t-meta txt-3">Sin cambios en tus atributos.</p>;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Cambios en tu partida">
      {deltas.map((d, i) => (
        <li key={i} className="insignia" data-tono={d.tono}>
          <span aria-hidden className="font-bold">{d.signo}</span>
          {d.texto}
        </li>
      ))}
    </ul>
  );
}

export function ReglaJuridica({ articulo, texto, codex }: { articulo: string; texto?: string; codex?: string }) {
  return (
    <div className="rounded-lg border border-violeta/40 bg-violeta/5 p-3">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="rotulo txt-violeta">Regla jurídica</span>
        <span className="articulo">{articulo}</span>
      </div>
      {texto && <p className="t-base txt-1">{texto}</p>}
      {codex && (
        <Link href={`/codex?q=${encodeURIComponent(codex)}`} className="inline-flex items-center gap-1 mt-1 t-meta txt-cian underline underline-offset-4 min-h-[44px]">
          <Icono nombre="codex" tam={16} /> Ampliar en el códex
        </Link>
      )}
    </div>
  );
}

export default function Consecuencia({
  tono = "neutral",
  titulo,
  narrativa,
  deltas = [],
  regla,
  extra,
  reinicio,
  lectura,
}: {
  tono?: Tono;
  titulo: string;
  narrativa?: ReactNode;
  deltas?: Delta[];
  regla?: { articulo: string; texto?: string; codex?: string };
  extra?: ReactNode;
  reinicio?: string | number;
  lectura?: Lectura;
}) {
  const s = SELLO[tono];
  const bloques: { k: string; nodo: ReactNode }[] = [
    {
      k: "titulo",
      nodo: (
        <div className="flex items-center gap-3">
          <motion.span
            className={`sello ${s.clase}`}
            initial={{ scale: 1.6, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            aria-hidden
          >
            <Icono nombre={s.icono} tam={22} grosor={2.4} />
          </motion.span>
          <div className="min-w-0">
            <div className={`rotulo ${s.clase}`}>{s.texto}</div>
            <p className="t-lectura font-bold txt-1" role="status">{titulo}</p>
          </div>
        </div>
      ),
    },
  ];
  if (narrativa) bloques.push({ k: "narrativa", nodo: <div><div className="rotulo mb-1">En la historia</div><div className="t-lectura txt-1">{narrativa}</div></div> });
  bloques.push({ k: "deltas", nodo: <div><div className="rotulo mb-1">Qué cambió</div><ListaDeltas deltas={deltas} /></div> });
  if (regla) bloques.push({ k: "regla", nodo: <ReglaJuridica {...regla} /> });
  if (extra) bloques.push({ k: "extra", nodo: extra });

  return (
    <Paginado
      items={bloques}
      clave={(b) => b.k}
      render={(b) => b.nodo}
      gap={12}
      etiqueta="Resultado"
      reinicio={reinicio}
      lectura={lectura}
    />
  );
}

/** Botón principal que primero muestra las páginas pendientes del resultado. */
export function BotonContinuar({ lectura, onClick, children, className = "btn btn-primario" }: { lectura: Lectura; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => lectura.continuar(onClick)}>
      {lectura.quedan ? <>Seguir leyendo <Icono nombre="flechaDer" tam={18} /></> : children}
    </button>
  );
}
