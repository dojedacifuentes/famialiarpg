"use client";
import { useGame } from "@/store/useGame";
import type { Hijo } from "@/types/game";

export default function FiliacionAccionesPanel() {
  const { hijos, updateHijo, pushLog, ajustarReputacion } = useGame();

  function reclamar(h: Hijo) {
    updateHijo(h.id, { reclamacionFiliacion: { interpuesta: true, acogida: true, art: "Art. 205 CC" }, reconocido: true });
    pushLog(`Acogida la acción de reclamación de filiación respecto de ${h.nombre}.`, "Arts. 195, 205, 206 CC");
    ajustarReputacion(3);
  }

  function impugnar(h: Hijo) {
    updateHijo(h.id, { impugnacionFiliacion: { interpuesta: true, acogida: false, art: "Art. 212 CC" } });
    pushLog(`Interpuesta acción de impugnación respecto de ${h.nombre}. Plazos del art. 212 CC.`, "Art. 212 CC");
  }

  function pedirPrueba(h: Hijo) {
    updateHijo(h.id, { recuerdos: [...h.recuerdos, "Se decretó prueba biológica (art. 199 CC). La negativa hace presumir la paternidad."] });
    pushLog(`Decretada prueba biológica respecto de ${h.nombre} (art. 199).`, "Art. 199 CC");
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Acciones de filiación (arts. 195-221 CC, Ley 19.585)</h2>
      <p className="text-parchment/60 text-sm">
        La filiación produce iguales efectos sin distinción (art. 33). La acción de RECLAMACIÓN es imprescriptible
        para el hijo (art. 195); para los demás legitimados, prescribe en 2 años desde el fallecimiento (art. 206).
        La IMPUGNACIÓN se sujeta a los plazos del art. 212. La prueba biológica (art. 199) es decisiva: la negativa
        injustificada genera la presunción del art. 199 inc. 2°.
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {hijos.map((h) => (
          <div key={h.id} className="terminal p-4">
            <div className="label-art text-neon-cyan">{h.nombre}</div>
            <div className="text-xs text-parchment/60">{h.edad} años · {h.filiacion} · {h.reconocido ? "reconocido" : "sin reconocer"}</div>
            <div className="flex gap-1 mt-3 flex-wrap">
              {!h.reconocido && <button className="btn text-[10px]" onClick={() => reclamar(h)}>Reclamar (art. 205)</button>}
              <button className="btn btn-danger text-[10px]" onClick={() => impugnar(h)}>Impugnar (art. 212)</button>
              <button className="btn text-[10px]" onClick={() => pedirPrueba(h)}>Prueba biológica (art. 199)</button>
            </div>
            <div className="mt-3 text-[11px] text-parchment/50 italic">
              {h.recuerdos.slice(-2).join(" · ")}
            </div>
          </div>
        ))}
        {hijos.length === 0 && <p className="text-parchment/40 italic text-sm">Sin hijos registrados. Las acciones presuponen filiación discutida.</p>}
      </div>
    </div>
  );
}
