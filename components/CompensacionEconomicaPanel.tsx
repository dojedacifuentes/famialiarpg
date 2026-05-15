"use client";
import { useState } from "react";
import { useGame } from "@/store/useGame";
import { calcularCompensacionEconomica } from "@/lib/reglas";
import type { FactoresCE, ModalidadPagoCE } from "@/types/game";

const MODALIDADES: { id: ModalidadPagoCE; nombre: string; desc: string }[] = [
  { id: "monto_unico", nombre: "Monto único", desc: "Suma fija pagadera de una vez. Requiere capacidad económica del deudor." },
  { id: "cuotas_reajustables", nombre: "Cuotas reajustables", desc: "Pago periódico reajustable conforme a UF o IPC. Garantías reales o personales pueden imponerse (art. 66 LMC)." },
  { id: "transferencia_bienes", nombre: "Transferencia de bienes", desc: "Adjudicación de bienes específicos del deudor al beneficiario." },
  { id: "usufructo_uso_habitacion", nombre: "Usufructo, uso o habitación", desc: "Derecho real temporal sobre un bien del deudor. Útil cuando hay vivienda compartida." },
];

export default function CompensacionEconomicaPanel() {
  const { conyuge, personaje, flags, setCE, pushLog } = useGame();
  const [f, setF] = useState<FactoresCE>({
    duracionMatrimonioAños: 10,
    edadConyugeBeneficiario: 45,
    saludDeficiente: false,
    situacionPrevisional: "deficitaria",
    calificacionProfesional: "baja",
    accesoMercadoLaboral: "dificil",
    dedicacionExclusivaHogar: true,
    colaboracionActividadConyuge: false,
  });
  const [modalidad, setModalidad] = useState<ModalidadPagoCE>("cuotas_reajustables");
  const [calculo, setCalculo] = useState<ReturnType<typeof calcularCompensacionEconomica> | null>(null);

  const culpable =
    flags.includes("incumplio_131") ||
    flags.includes("prueba_infidelidad") ||
    flags.includes("denuncia_vif");
  const bloqueoCulpa = culpable; // simplificación: si el demandante incurrió en causal culposa

  function calcular() {
    const c = calcularCompensacionEconomica(f);
    setCalculo(c);
  }

  function acordar() {
    if (!calculo) return;
    setCE({
      beneficiario: personaje.sexo === "femenino" ? "mujer" : "marido",
      factores: f,
      montoEstimado: calculo.monto,
      modalidad,
      bloqueadaPorCulpaGrave: bloqueoCulpa,
      acordada: true,
      ejecutoriada: true,
    });
    pushLog(`Compensación económica acordada: $${calculo.monto.toLocaleString("es-CL")} en modalidad ${modalidad}.`, "Art. 65 LMC");
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Compensación económica (arts. 61-66 LMC)</h2>
      <p className="text-parchment/60 text-sm">
        Procede cuando uno de los cónyuges, por dedicarse al cuidado del hogar o de los hijos
        o realizar trabajo en menor medida, no pudo desarrollar actividad remunerada durante el
        matrimonio (art. 61). Los criterios del art. 62 ponderan el "menoscabo económico".
      </p>

      <div className="terminal p-5 space-y-3">
        <div className="label-art text-neon-violet text-sm">Factores (art. 62 LMC)</div>
        <div className="grid md:grid-cols-2 gap-3 text-xs">
          <label>Duración del matrimonio (años): <input type="number" className="w-20 bg-ink-700 border border-neon-blue/30 p-1 ml-2" value={f.duracionMatrimonioAños} onChange={(e) => setF({ ...f, duracionMatrimonioAños: +e.target.value })} /></label>
          <label>Edad del beneficiario: <input type="number" className="w-20 bg-ink-700 border border-neon-blue/30 p-1 ml-2" value={f.edadConyugeBeneficiario} onChange={(e) => setF({ ...f, edadConyugeBeneficiario: +e.target.value })} /></label>
          <label><input type="checkbox" checked={f.saludDeficiente} onChange={(e) => setF({ ...f, saludDeficiente: e.target.checked })} /> Salud deficiente</label>
          <label><input type="checkbox" checked={f.dedicacionExclusivaHogar} onChange={(e) => setF({ ...f, dedicacionExclusivaHogar: e.target.checked })} /> Dedicación exclusiva al hogar e hijos</label>
          <label><input type="checkbox" checked={f.colaboracionActividadConyuge} onChange={(e) => setF({ ...f, colaboracionActividadConyuge: e.target.checked })} /> Colaboración en actividad del otro</label>
          <label>Situación previsional:
            <select className="bg-ink-700 border border-neon-blue/30 p-1 ml-2" value={f.situacionPrevisional} onChange={(e) => setF({ ...f, situacionPrevisional: e.target.value as any })}>
              <option value="deficitaria">deficitaria</option><option value="media">media</option><option value="suficiente">suficiente</option>
            </select>
          </label>
          <label>Calificación profesional:
            <select className="bg-ink-700 border border-neon-blue/30 p-1 ml-2" value={f.calificacionProfesional} onChange={(e) => setF({ ...f, calificacionProfesional: e.target.value as any })}>
              <option value="baja">baja</option><option value="media">media</option><option value="alta">alta</option>
            </select>
          </label>
          <label>Acceso al mercado laboral:
            <select className="bg-ink-700 border border-neon-blue/30 p-1 ml-2" value={f.accesoMercadoLaboral} onChange={(e) => setF({ ...f, accesoMercadoLaboral: e.target.value as any })}>
              <option value="imposible">imposible</option><option value="dificil">difícil</option><option value="factible">factible</option>
            </select>
          </label>
        </div>
        <button className="btn" onClick={calcular}>▸ Calcular</button>
      </div>

      {calculo && (
        <div className="terminal p-5">
          <div className="label-art text-neon-cyan mb-2">Monto estimado</div>
          <div className="text-5xl text-neon-blue glitch-text">${calculo.monto.toLocaleString("es-CL")}</div>
          <div className="mt-3 text-xs space-y-1">
            {calculo.desglose.map((d, i) => (
              <div key={i} className="flex justify-between text-parchment/70">
                <span>{d.factor} <span className="tag tag-violet ml-1">{d.articulo}</span></span>
                <span className="text-neon-cyan">+${d.aporte.toLocaleString("es-CL")}</span>
              </div>
            ))}
          </div>
          {bloqueoCulpa && (
            <div className="mt-3 p-3 border border-neon-red text-neon-red text-xs">
              ⚠ Causal culposa imputable al demandante (flags activos). El art. 62 inc. 2° LMC autoriza al juez
              a DENEGAR o disminuir prudencialmente el monto.
            </div>
          )}
          <div className="mt-4">
            <div className="label-art text-neon-violet text-sm mb-2">Modalidad de pago (art. 65 LMC)</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {MODALIDADES.map((m) => (
                <button key={m.id} onClick={() => setModalidad(m.id)} className={`p-3 border text-left text-xs ${modalidad === m.id ? "border-neon-blue bg-neon-blue/10" : "border-ink-400"}`}>
                  <div className="text-neon-cyan">{m.nombre}</div>
                  <div className="text-parchment/60">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <button className="btn mt-4" onClick={acordar}>▸ Acordar y ejecutoriar</button>
        </div>
      )}
    </div>
  );
}
