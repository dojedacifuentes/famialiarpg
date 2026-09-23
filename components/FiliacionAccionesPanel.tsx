"use client";
// Acciones de filiación (arts. 195-221 CC). Cada acción se ejerce una vez por
// hijo y ciclo: repetirla no suma efectos ni ensucia el registro.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import type { Hijo } from "@/types/game";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad from "@/components/ui/Actividad";
import { Paginado } from "@/components/ui/Ajuste";
import { ListaDeltas } from "@/components/ui/Consecuencia";
import Icono from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";

const REGLA = {
  titulo: "Acciones de filiación (arts. 195-221 CC, Ley 19.585)",
  parrafos: [
    "La filiación produce iguales efectos sin distinción (art. 33). La acción de RECLAMACIÓN es imprescriptible para el hijo (art. 195); para los demás legitimados, prescribe en 2 años desde el fallecimiento (art. 206).",
    "La IMPUGNACIÓN se sujeta a los plazos del art. 212. La prueba biológica (art. 199) es decisiva: la negativa injustificada genera la presunción del art. 199 inc. 2°.",
  ],
  articulo: "Arts. 195-221 CC",
};

export default function FiliacionAccionesPanel() {
  const game = useGame();
  const { hijos, hechos } = game;
  const [cambios, setCambios] = useState<Record<string, Delta[]>>({});
  const cap = capitulo("filiacion_acciones")!;
  const progreso = progresoCapitulo("filiacion_acciones", game);

  function ejercer(h: Hijo, accion: "reclamar" | "impugnar" | "prueba") {
    const d = conCambios(() => {
      if (!game.registrarHecho(`filiacion:${h.id}:${accion}`)) return;
      const st = useGame.getState();
      const actual = st.hijos.find((x) => x.id === h.id) ?? h;
      if (accion === "reclamar") {
        st.updateHijo(h.id, { reclamacionFiliacion: { interpuesta: true, acogida: true, art: "Art. 205 CC" }, reconocido: true });
        st.pushLog(`Acogida la acción de reclamación de filiación respecto de ${h.nombre}.`, "Arts. 195, 205, 206 CC");
        st.ajustarReputacion(3);
      } else if (accion === "impugnar") {
        st.updateHijo(h.id, { impugnacionFiliacion: { interpuesta: true, acogida: false, art: "Art. 212 CC" } });
        st.pushLog(`Interpuesta acción de impugnación respecto de ${h.nombre}. Plazos del art. 212 CC.`, "Art. 212 CC");
      } else {
        st.updateHijo(h.id, { recuerdos: [...actual.recuerdos, "Se decretó prueba biológica (art. 199 CC). La negativa hace presumir la paternidad."] });
        st.pushLog(`Decretada prueba biológica respecto de ${h.nombre} (art. 199).`, "Art. 199 CC");
      }
    });
    const nota: Record<typeof accion, Delta> = {
      reclamar: { texto: "Reclamación acogida (art. 205)", signo: "•", tono: "verde" },
      impugnar: { texto: "Impugnación interpuesta: plazos del art. 212", signo: "•", tono: "oro" },
      prueba: { texto: "Prueba biológica decretada (art. 199)", signo: "•", tono: "cian" },
    };
    setCambios((c) => ({ ...c, [h.id]: [nota[accion], ...d] }));
  }

  return (
    <Actividad titulo="Acciones de filiación" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} introClave="intro:filiacion" lugar="laboratorio" retrato="perito">
      <div className="cuerpo">
        {hijos.length === 0 ? (
          <div className="tarjeta space-y-2">
            <p className="t-lectura txt-2">Sin hijos registrados. Las acciones presuponen filiación discutida.</p>
            <Link href="/mundo/hijos" className="btn btn-secundario">Ir a Filiación y cuidado (cap. V)</Link>
          </div>
        ) : (
          <Paginado
            items={hijos}
            clave={(h) => h.id}
            etiqueta="Hijos"
            columnas={(w) => (w > 760 ? 2 : 1)}
            render={(h) => {
              const hecho = (a: string) => `filiacion:${h.id}:${a}` in hechos;
              return (
                <article className="tarjeta h-full flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Icono nombre="hijo" tam={24} className="txt-oro" />
                    <h3 className="font-display font-bold flex-1">{h.nombre}</h3>
                  </div>
                  <p className="t-meta txt-2">{h.edad} años · {h.filiacion.replace(/_/g, " ")} · {h.reconocido ? "reconocido" : "sin reconocer"}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {!h.reconocido && !hecho("reclamar") && <button type="button" className="btn btn-secundario" onClick={() => ejercer(h, "reclamar")}>Reclamar (art. 205)</button>}
                    <button type="button" className="btn btn-peligro" disabled={hecho("impugnar")} onClick={() => ejercer(h, "impugnar")}>
                      {hecho("impugnar") ? "Impugnación interpuesta" : "Impugnar (art. 212)"}
                    </button>
                    <button type="button" className="btn btn-secundario" disabled={hecho("prueba")} onClick={() => ejercer(h, "prueba")}>
                      {hecho("prueba") ? "Prueba decretada" : "Prueba biológica (art. 199)"}
                    </button>
                  </div>
                  {cambios[h.id] && <ListaDeltas deltas={cambios[h.id]} />}
                  <p className="t-meta txt-3 italic">{h.recuerdos.slice(-2).join(" · ")}</p>
                </article>
              );
            }}
          />
        )}
      </div>
    </Actividad>
  );
}
