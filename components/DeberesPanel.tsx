"use client";
// Deberes recíprocos (arts. 131-134 CC). Cada deber es una decisión única por
// ciclo: cumplirlo o incumplirlo (leve o grave). Los incumplimientos quedan en
// el expediente y el epílogo los recuerda; el cónyuge reacciona.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import type { DeberMatrimonial, IncumplimientoDeber } from "@/types/game";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad, { Progreso } from "@/components/ui/Actividad";
import { Paginado } from "@/components/ui/Ajuste";
import { ListaDeltas } from "@/components/ui/Consecuencia";
import Icono from "@/components/ui/Icono";
import type { Animo } from "@/components/arte/Retrato";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";

const DEBERES: { id: DeberMatrimonial; nombre: string; articulo: string; descripcion: string }[] = [
  { id: "fidelidad", nombre: "Fidelidad", articulo: "Arts. 131-132 CC", descripcion: "Guardarse fe. El adulterio es grave infracción, no produce per se efectos civiles automáticos." },
  { id: "socorro", nombre: "Socorro", articulo: "Arts. 131, 134 CC", descripcion: "Auxilio en todas las circunstancias de la vida y proveer al sustento de la familia." },
  { id: "ayuda_mutua", nombre: "Ayuda mutua", articulo: "Art. 131 CC", descripcion: "Asistencia recíproca en lo cotidiano y existencial." },
  { id: "respeto_proteccion", nombre: "Respeto y protección", articulo: "Art. 131 CC", descripcion: "Respeto recíproco y deber de proteger la integridad del otro." },
  { id: "vida_en_comun", nombre: "Vida en común", articulo: "Art. 133 CC", descripcion: "Derecho y deber de vivir en el hogar común, salvo causa grave." },
  { id: "auxilio_enfermedad", nombre: "Auxilio en enfermedad", articulo: "Art. 134 CC", descripcion: "Extensión del deber de socorro frente a enfermedad o adversidad." },
];

type Decision = "cumple" | "leve" | "grave";
const TEXTO: Record<Decision, string> = { cumple: "Cumpliste", leve: "Incumplimiento leve", grave: "Incumplimiento grave · causal culposa" };

export default function DeberesPanel() {
  const game = useGame();
  const { incumplimientos, hechos, personaje } = game;
  const [ultimos, setUltimos] = useState<Record<string, Delta[]>>({});
  const [animo, setAnimo] = useState<Animo>("neutral");
  const cap = capitulo("deberes")!;
  const progreso = progresoCapitulo("deberes", game);

  function decidir(d: (typeof DEBERES)[number], dec: Decision) {
    const deltas = conCambios(() => {
      if (!game.registrarHecho(`deber:${d.id}`, dec)) return;
      const st = useGame.getState();
      if (dec === "cumple") {
        if (st.conyuge) st.setConyuge({ ...st.conyuge, afecto: Math.min(100, st.conyuge.afecto + 5) });
        st.pushLog(`Cumpliste el deber de ${d.nombre}.`, d.articulo);
        return;
      }
      const inc: IncumplimientoDeber = {
        id: `inc-deber-${d.id}-c${personaje.cicloVital}`,
        deber: d.id,
        fecha: Date.now(),
        detalle: d.descripcion,
        articulo: d.articulo,
        habilitaCulpa: dec === "grave",
      };
      st.addIncumplimiento(inc);
      st.pushLog(`Registraste incumplimiento del deber de ${d.nombre}.`, d.articulo);
      st.ajustarReputacion(-4);
      if (st.conyuge) st.setConyuge({ ...st.conyuge, deberesCumplidos: Math.max(0, st.conyuge.deberesCumplidos - 10) });
    });
    if (dec === "cumple") deltas.unshift({ texto: "Afecto del cónyuge +5", signo: "+", tono: "verde" });
    else deltas.push({ texto: "Cumplimiento de deberes del cónyuge −10", signo: "−", tono: "rojo" });
    setUltimos((u) => ({ ...u, [d.id]: deltas }));
    setAnimo(dec === "cumple" ? "aprueba" : dec === "grave" ? "molesto" : "triste");
  }

  const score = Math.max(0, 100 - incumplimientos.length * 10);
  const decididos = DEBERES.filter((d) => `deber:${d.id}` in hechos).length;

  return (
    <Actividad
      titulo="Deberes recíprocos del matrimonio"
      objetivo={cap.objetivo}
      progreso={progreso}
      lugar="cocina"
      retrato="conyuge"
      animo={animo}
      regla={{
        titulo: "Deberes recíprocos (arts. 131-134 CC)",
        parrafos: ["El incumplimiento grave y reiterado de estos deberes habilita causal de divorcio culposo (art. 54 N°2 LMC) y permite al juez denegar o reducir prudencialmente la compensación económica al culpable (art. 62 inc. 2° LMC)."],
        articulo: "Arts. 131-134 CC · 54 LMC · 62 LMC",
      }}
    >
      <div>
        <div className="flex justify-between t-meta"><span className="rotulo">Cumplimiento global</span></div>
        <Progreso hecho={score} total={100} etiqueta="Cumplimiento global" />
      </div>
      <div className="cuerpo">
        <Paginado
          items={DEBERES}
          clave={(d) => d.id}
          etiqueta="Deberes"
          columnas={(w) => (w > 760 ? 2 : 1)}
          render={(d) => {
            const dec = hechos[`deber:${d.id}`] as Decision | undefined;
            return (
              <article className="tarjeta h-full flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-bold txt-1">{d.nombre}</h3>
                  <span className="articulo">{d.articulo}</span>
                </div>
                <p className="t-base txt-2">{d.descripcion}</p>
                {dec ? (
                  <div className="space-y-1">
                    <p className={`t-meta font-bold flex items-center gap-1 ${dec === "cumple" ? "txt-verde" : "txt-rojo"}`}>
                      <Icono nombre={dec === "cumple" ? "check" : "alerta"} tam={16} /> {TEXTO[dec]}
                    </p>
                    {ultimos[d.id] && <ListaDeltas deltas={ultimos[d.id]} />}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-auto">
                    <button type="button" className="btn btn-secundario" onClick={() => decidir(d, "cumple")}>Cumplir</button>
                    <button type="button" className="btn btn-secundario" onClick={() => decidir(d, "leve")}>Incumplimiento leve</button>
                    <button type="button" className="btn btn-peligro" onClick={() => decidir(d, "grave")}>Grave (art. 54 LMC)</button>
                  </div>
                )}
              </article>
            );
          }}
        />
      </div>
      {decididos === DEBERES.length && (
        <div className="barra-accion">
          <p className="t-meta txt-2 w-full">Historial: {incumplimientos.length} incumplimiento(s), {incumplimientos.filter((i) => i.habilitaCulpa).length} con causal culposa. Queda en tu expediente.</p>
          <Link href="/juego" className="btn btn-primario">Volver al mapa <Icono nombre="mapa" tam={18} /></Link>
        </div>
      )}
    </Actividad>
  );
}
