"use client";
import { useGame } from "@/store/useGame";
import type { DeberMatrimonial, IncumplimientoDeber } from "@/types/game";
import { useMemo } from "react";

const DEBERES: { id: DeberMatrimonial; nombre: string; articulo: string; descripcion: string }[] = [
  { id: "fidelidad", nombre: "Fidelidad", articulo: "Arts. 131-132 CC", descripcion: "Guardarse fe. El adulterio es grave infracción, no produce per se efectos civiles automáticos." },
  { id: "socorro", nombre: "Socorro", articulo: "Arts. 131, 134 CC", descripcion: "Auxilio en todas las circunstancias de la vida y proveer al sustento de la familia." },
  { id: "ayuda_mutua", nombre: "Ayuda mutua", articulo: "Art. 131 CC", descripcion: "Asistencia recíproca en lo cotidiano y existencial." },
  { id: "respeto_proteccion", nombre: "Respeto y protección", articulo: "Art. 131 CC", descripcion: "Respeto recíproco y deber de proteger la integridad del otro." },
  { id: "vida_en_comun", nombre: "Vida en común", articulo: "Art. 133 CC", descripcion: "Derecho y deber de vivir en el hogar común, salvo causa grave." },
  { id: "auxilio_enfermedad", nombre: "Auxilio en enfermedad", articulo: "Art. 134 CC", descripcion: "Extensión del deber de socorro frente a enfermedad o adversidad." },
];

export default function DeberesPanel() {
  const { incumplimientos, addIncumplimiento, pushLog, ajustarReputacion, conyuge, setConyuge } = useGame();

  function registrarIncumplimiento(deber: typeof DEBERES[number], habilitaCulpa: boolean) {
    const inc: IncumplimientoDeber = {
      id: `inc-${Date.now()}`,
      deber: deber.id,
      fecha: Date.now(),
      detalle: deber.descripcion,
      articulo: deber.articulo,
      habilitaCulpa,
    };
    addIncumplimiento(inc);
    pushLog(`Registraste incumplimiento del deber de ${deber.nombre}.`, deber.articulo);
    ajustarReputacion(-4);
    if (conyuge) setConyuge({ ...conyuge, deberesCumplidos: Math.max(0, conyuge.deberesCumplidos - 10) });
  }

  const score = useMemo(() => Math.max(0, 100 - incumplimientos.length * 10), [incumplimientos]);

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Deberes recíprocos del matrimonio (arts. 131-134 CC)</h2>
      <p className="text-parchment/60 text-sm">
        El incumplimiento grave y reiterado de estos deberes habilita causal de divorcio culposo (art. 54 N°2 LMC)
        y permite al juez denegar o reducir prudencialmente la compensación económica al culpable (art. 62 inc. 2° LMC).
      </p>

      <div className="terminal p-4">
        <div className="flex justify-between text-xs uppercase tracking-widest mb-2">
          <span>Cumplimiento global</span><span className="text-neon-cyan">{score}/100</span>
        </div>
        <div className="h-2 bg-ink-700">
          <div className="h-full barfill" style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {DEBERES.map((d) => (
          <div key={d.id} className="terminal p-4">
            <div className="label-art text-neon-cyan">{d.nombre}</div>
            <div className="tag tag-violet mt-1">{d.articulo}</div>
            <p className="text-parchment/70 text-xs mt-2">{d.descripcion}</p>
            <div className="flex gap-1 mt-3 flex-wrap">
              <button className="btn text-[10px]" onClick={() => registrarIncumplimiento(d, false)}>Incumplimiento leve</button>
              <button className="btn btn-danger text-[10px]" onClick={() => registrarIncumplimiento(d, true)}>Incumplimiento grave (habilita art. 54 LMC)</button>
            </div>
          </div>
        ))}
      </div>

      {incumplimientos.length > 0 && (
        <div className="terminal p-4 border-neon-red/40">
          <div className="label-art text-neon-red mb-2">Historial de incumplimientos ({incumplimientos.length})</div>
          {incumplimientos.map((i) => (
            <div key={i.id} className="text-xs text-parchment/70 border-b border-ink-400 py-1">
              <b className="text-neon-red">{i.deber}</b> · {i.articulo} {i.habilitaCulpa && <span className="ml-2 tag tag-red">CAUSAL CULPOSA</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
