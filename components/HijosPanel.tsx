"use client";
import { useState } from "react";
import { useGame } from "@/store/useGame";
import type { Hijo } from "@/types/game";

const NOMBRES = ["Sofía", "Tomás", "Antonia", "Vicente", "Ignacia", "Joaquín", "Camila", "Diego"];

export default function HijosPanel() {
  const { hijos, addHijo, updateHijo, ajustarReputacion, ajustarTrauma, pushLog } = useGame();
  const [nombre, setNombre] = useState("");
  const [filiacion, setFiliacion] = useState<Hijo["filiacion"]>("matrimonial");

  function crearHijo() {
    const n = nombre.trim() || NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    const h: Hijo = {
      id: `h${Date.now()}`,
      nombre: n,
      edad: 0,
      filiacion,
      reconocido: filiacion !== "no_matrimonial",
      cuidadoPersonal: filiacion === "matrimonial" ? "compartido" : "madre",
      alimentosAlDia: true,
      afecto: 80,
      trauma: 0,
      recuerdos: ["Nací bajo el imperio del art. 33 CC."],
    };
    addHijo(h);
    pushLog(`Nace ${n} (${filiacion.replace(/_/g, " ")}).`, "FILIACIÓN");
    setNombre("");
  }

  function reconocer(h: Hijo) {
    updateHijo(h.id, { reconocido: true, recuerdos: [...h.recuerdos, "Fui reconocido formalmente."] });
    ajustarReputacion(3);
    pushLog(`Reconociste a ${h.nombre}. Art. 187 CC.`, "Art. 187 CC");
  }

  function noPagarAlimentos(h: Hijo) {
    updateHijo(h.id, { alimentosAlDia: false, afecto: Math.max(-100, h.afecto - 15), trauma: h.trauma + 10, recuerdos: [...h.recuerdos, "Dejaste de pagar mis alimentos."], rndpa: true });
    ajustarReputacion(-10);
    ajustarTrauma(4);
    pushLog(`Incumpliste alimentos respecto de ${h.nombre}. Apremio personal posible (Ley 14.908). Inscripción en RNDPA (Ley 21.389).`, "Leyes 14.908 / 21.389");
  }

  function pagar(h: Hijo) {
    updateHijo(h.id, { alimentosAlDia: true, afecto: Math.min(100, h.afecto + 10), recuerdos: [...h.recuerdos, "Pagaste mis alimentos al día."], rndpa: false });
    ajustarReputacion(2);
    pushLog(`Pagaste alimentos a ${h.nombre}.`);
  }

  function crecer(h: Hijo) {
    updateHijo(h.id, { edad: h.edad + 5, recuerdos: [...h.recuerdos, `Cumplí ${h.edad + 5} años.`] });
  }

  function cambiarCuidado(h: Hijo) {
    const next = h.cuidadoPersonal === "compartido" ? "madre" : h.cuidadoPersonal === "madre" ? "padre" : "compartido";
    updateHijo(h.id, { cuidadoPersonal: next, recuerdos: [...h.recuerdos, `El cuidado personal pasó a ${next}.`] });
    pushLog(`Cambio de cuidado personal de ${h.nombre} a ${next}.`, "Art. 225 CC");
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Filiación, alimentos y cuidado personal</h2>
      <p className="text-parchment/60 text-sm">
        Filiación con iguales efectos (art. 33 CC, Ley 19.585). Alimentos (Ley 14.908 y 21.389: RNDPA). Cuidado personal (art. 225 CC; preferente la madre salvo acuerdo o resolución judicial). Relación directa y regular (art. 229 CC).
      </p>

      <div className="terminal p-4">
        <div className="grid sm:grid-cols-3 gap-2 items-end">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="bg-ink-700 border border-neon-blue/30 p-2 text-parchment" />
          <select value={filiacion} onChange={(e) => setFiliacion(e.target.value as Hijo["filiacion"])} className="bg-ink-700 border border-neon-blue/30 p-2 text-parchment">
            <option value="matrimonial">Matrimonial</option>
            <option value="no_matrimonial">No matrimonial</option>
            <option value="adoptiva">Adoptiva</option>
          </select>
          <button className="btn" onClick={crearHijo}>+ Inscribir nacimiento</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {hijos.map((h) => (
          <div key={h.id} className="terminal p-4">
            <div className="flex justify-between">
              <div className="label-art text-neon-cyan">{h.nombre}</div>
              <div className="text-xs text-parchment/60">{h.edad} años · {h.filiacion}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div>Afecto: <b className={h.afecto > 0 ? "text-neon-blue" : "text-neon-red"}>{h.afecto}</b></div>
              <div>Trauma: <b className="text-neon-red">{h.trauma}</b></div>
              <div>Alimentos: {h.alimentosAlDia ? <span className="text-neon-blue">al día</span> : <span className="text-neon-red">en mora · RNDPA</span>}</div>
              <div>Reconocido: {h.reconocido ? "✓" : "✗"}</div>
              <div>Cuidado: {h.cuidadoPersonal}</div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {!h.reconocido && <button className="btn text-[10px]" onClick={() => reconocer(h)}>Reconocer (187)</button>}
              {h.alimentosAlDia
                ? <button className="btn btn-danger text-[10px]" onClick={() => noPagarAlimentos(h)}>No pagar alimentos</button>
                : <button className="btn text-[10px]" onClick={() => pagar(h)}>Pagar alimentos</button>}
              <button className="btn text-[10px]" onClick={() => cambiarCuidado(h)}>Cambiar cuidado (225)</button>
              <button className="btn text-[10px]" onClick={() => crecer(h)}>+5 años</button>
            </div>
            <div className="mt-3 text-[11px] text-parchment/50 italic">
              Memoria: {h.recuerdos.slice(-2).join(" · ")}
            </div>
          </div>
        ))}
        {hijos.length === 0 && <div className="text-parchment/40 text-sm italic">Aún sin hijos. La filiación es un acto jurídico solemne.</div>}
      </div>
    </div>
  );
}
