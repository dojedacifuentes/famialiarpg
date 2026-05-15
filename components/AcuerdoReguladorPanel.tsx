"use client";
import { useGame } from "@/store/useGame";
import { evaluarAcuerdoRegulador } from "@/lib/reglas";
import { useState } from "react";
import type { AcuerdoRegulador } from "@/types/game";

export default function AcuerdoReguladorPanel() {
  const { hijos, conyuge, setConyuge, pushLog } = useGame();
  const [a, setA] = useState<AcuerdoRegulador>({
    alimentosHijos: false, cuidadoPersonal: false, relacionDirectaRegular: false,
    alimentosConyuge: false, bienesFamiliares: false, liquidacionRegimen: false,
    compensacionEconomica: false, completo: false, suficiente: false,
  });
  const [eval_, setEval] = useState<ReturnType<typeof evaluarAcuerdoRegulador> | null>(null);

  function toggle<K extends keyof AcuerdoRegulador>(k: K) {
    setA((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  function evaluar() {
    const r = evaluarAcuerdoRegulador(a, hijos.length > 0);
    setEval(r);
    if (r.completo && r.suficiente && conyuge) {
      setConyuge({ ...conyuge, acuerdoRegulador: { ...a, completo: true, suficiente: true } });
      pushLog("Acuerdo regulador completo y suficiente. Habilita art. 55 inc. 1 LMC.", r.articulo);
    }
  }

  const ITEMS: { k: keyof AcuerdoRegulador; label: string; art: string }[] = [
    { k: "alimentosHijos", label: "Alimentos para hijos comunes", art: "Ley 14.908 / Art. 21 LMC" },
    { k: "cuidadoPersonal", label: "Cuidado personal de los hijos", art: "Arts. 225, 27 LMC" },
    { k: "relacionDirectaRegular", label: "Relación directa y regular", art: "Art. 229 CC" },
    { k: "alimentosConyuge", label: "Alimentos entre cónyuges (si procede)", art: "Arts. 321, 134 CC" },
    { k: "bienesFamiliares", label: "Destino de bienes familiares", art: "Arts. 141-149 CC" },
    { k: "liquidacionRegimen", label: "Liquidación o renuncia del régimen", art: "Arts. 1765 ss. / 1792-3 ss. CC" },
    { k: "compensacionEconomica", label: "Compensación económica", art: "Arts. 61-66 LMC" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Acuerdo regulador completo y suficiente (arts. 21 y 27 LMC)</h2>
      <p className="text-parchment/60 text-sm">
        Para el divorcio de común acuerdo (art. 55 inc. 1° LMC), los cónyuges deben acompañar un acuerdo que regule
        sus relaciones mutuas y respecto de los hijos comunes. El acuerdo será COMPLETO si cubre todas las materias
        del art. 21 y SUFICIENTE si resguarda el interés superior de los hijos, procura aminorar el menoscabo económico
        y establece relaciones equitativas entre los cónyuges.
      </p>

      <div className="terminal p-4 space-y-2">
        {ITEMS.map((it) => (
          <label key={it.k as string} className="flex items-start gap-3 text-xs">
            <input type="checkbox" checked={!!a[it.k]} onChange={() => toggle(it.k)} className="mt-1" />
            <div>
              <div className="text-parchment">{it.label}</div>
              <div className="text-parchment/50 text-[10px]">{it.art}</div>
            </div>
          </label>
        ))}
      </div>

      <button className="btn" onClick={evaluar}>▸ Evaluar acuerdo</button>

      {eval_ && (
        <div className={`terminal p-4 ${eval_.completo && eval_.suficiente ? "border-neon-blue" : "border-neon-red"}`}>
          <div className={`label-art ${eval_.completo && eval_.suficiente ? "text-neon-blue" : "text-neon-red"}`}>
            {eval_.completo && eval_.suficiente ? "✓ Acuerdo completo y suficiente" : "✗ Acuerdo insuficiente"}
          </div>
          <div className="tag tag-violet mt-2">{eval_.articulo}</div>
          {eval_.observaciones.length > 0 && (
            <ul className="mt-3 text-xs space-y-1 text-parchment/70">
              {eval_.observaciones.map((o, i) => <li key={i}>• {o}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
