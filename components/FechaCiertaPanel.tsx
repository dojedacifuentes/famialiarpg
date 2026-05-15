"use client";
import { useGame } from "@/store/useGame";
import { validarFechaCierta } from "@/lib/reglas";
import type { MedioFechaCierta } from "@/types/game";
import { useState } from "react";

const MEDIOS: { id: MedioFechaCierta; nombre: string; art: string; desc: string }[] = [
  { id: "escritura_publica", nombre: "Escritura pública", art: "Art. 22 letra a) LMC", desc: "Otorgada ante notario. Es el medio más solemne; fecha cierta inmediata." },
  { id: "escritura_privada_protocolizada", nombre: "Escritura privada protocolizada", art: "Art. 22 letra a) LMC", desc: "Documento privado firmado por los cónyuges, protocolizado ante notario." },
  { id: "acta_oficial_registro_civil", nombre: "Acta ante oficial del Registro Civil", art: "Art. 22 letra b) LMC", desc: "Más económico que la escritura pública. Equivalente probatorio." },
  { id: "transaccion_judicial_aprobada", nombre: "Transacción judicial aprobada", art: "Art. 22 letra c) LMC", desc: "Convenio entre cónyuges aprobado por sentencia judicial (Tribunal de Familia)." },
  { id: "notificacion_demanda_art25", nombre: "Notificación de demanda (art. 25)", art: "Art. 25 inc. 2° LMC", desc: "La fecha cierta se fija al notificarse legalmente cualquier demanda donde un cónyuge declare cese." },
];

export default function FechaCiertaPanel() {
  const { personaje, setFechaCierta, setFlag, pushLog } = useGame();
  const [elegido, setElegido] = useState<MedioFechaCierta | null>(null);

  function constituir(medio: MedioFechaCierta) {
    const v = validarFechaCierta({ medio, fechaMatrimonio: personaje.fechaMatrimonio });
    setFechaCierta(v);
    setFlag("cese_acreditado");
    pushLog(`Acreditaste cese de convivencia mediante ${medio.replace(/_/g, " ")}.`, v.articulo);
    setElegido(medio);
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Fecha cierta del cese de convivencia (arts. 22 y 25 LMC)</h2>
      <p className="text-parchment/60 text-sm">
        Para matrimonios celebrados desde el 18-11-2004, la fecha cierta solo se acredita por los medios TAXATIVOS
        del art. 22 LMC y por la notificación de demanda del art. 25 inc. 2°. Antes de esa fecha, la prueba es libre
        (art. 2° transitorio LMC), aunque la jurisprudencia exige prueba calificada (testigos hábiles, instrumentos).
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {MEDIOS.map((m) => (
          <button
            key={m.id}
            onClick={() => constituir(m.id)}
            disabled={!!elegido}
            className={`terminal p-4 text-left hover:bg-neon-blue/5 disabled:opacity-50 ${elegido === m.id ? "border-neon-blue" : ""}`}
          >
            <div className="label-art text-neon-cyan">{m.nombre}</div>
            <div className="tag tag-violet mt-1">{m.art}</div>
            <p className="text-parchment/70 text-xs mt-2">{m.desc}</p>
          </button>
        ))}
      </div>

      {elegido && (
        <div className="terminal p-4 border-neon-blue">
          <div className="label-art text-neon-blue mb-2">Fecha cierta constituida</div>
          <p className="text-parchment text-sm">
            Has fijado la fecha de cese mediante {elegido.replace(/_/g, " ")}.
            A partir de aquí, el plazo del art. 55 LMC corre: 1 año si pides divorcio de común acuerdo,
            3 años si pides divorcio unilateral.
          </p>
        </div>
      )}
    </div>
  );
}
