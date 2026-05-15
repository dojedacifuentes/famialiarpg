"use client";
import { useGame } from "@/store/useGame";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Via = "unilateral" | "comun_acuerdo" | "culposo" | "separacion_judicial";

const VIAS: { id: Via; nombre: string; req: string; plazo: string; art: string }[] = [
  { id: "unilateral", nombre: "Divorcio unilateral", req: "Cese efectivo de convivencia (fecha cierta) y voluntad unilateral.", plazo: "≥ 3 años de cese", art: "Art. 55 inc. 3° LMC" },
  { id: "comun_acuerdo", nombre: "Divorcio de común acuerdo", req: "Acuerdo regulador completo y suficiente acompañado a la demanda.", plazo: "≥ 1 año de cese", art: "Art. 55 inc. 1° LMC + Arts. 21, 27 LMC" },
  { id: "culposo", nombre: "Divorcio culposo (sin plazo)", req: "Falta imputable grave del otro cónyuge (siete causales del art. 54).", plazo: "No requiere cese", art: "Art. 54 LMC" },
  { id: "separacion_judicial", nombre: "Separación judicial", req: "Cese o falta imputable. No disuelve el vínculo.", plazo: "—", art: "Arts. 26-29 LMC" },
];

export default function SeparacionPanel() {
  const game = useGame();
  const router = useRouter();
  const [via, setVia] = useState<Via | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);

  function intentar(v: Via) {
    setVia(v);
    const ceseAcred = !!game.fechaCierta || game.flags.includes("cese_acreditado");
    const ceseFalso = game.flags.includes("cese_falso");
    const acuerdoOk = game.conyuge?.acuerdoRegulador?.completo && game.conyuge?.acuerdoRegulador?.suficiente;
    const pruebaCulpa =
      game.flags.includes("prueba_infidelidad") ||
      game.flags.includes("prueba_alcoholismo") ||
      game.flags.includes("denuncia_vif");

    let exito = false; let texto = "";
    if (v === "unilateral") {
      exito = ceseAcred && !ceseFalso;
      texto = exito
        ? "Acreditado el cese por 3 años con fecha cierta, se acoge el divorcio unilateral (art. 55 inc. 3° LMC)."
        : "Falta acreditación calificada del cese. Demanda rechazada.";
    }
    if (v === "comun_acuerdo") {
      exito = !!acuerdoOk && ceseAcred;
      texto = exito
        ? "Acuerdo regulador completo y suficiente acompañado y cese de 1 año: se concede el divorcio (art. 55 inc. 1° LMC)."
        : !acuerdoOk
          ? "Falta acuerdo regulador completo y suficiente (arts. 21 y 27 LMC). Rechazado."
          : "Falta acreditación del cese de convivencia. Rechazado.";
    }
    if (v === "culposo") {
      exito = pruebaCulpa;
      texto = exito
        ? "Acreditada falta imputable grave (art. 54 LMC). Se concede divorcio por culpa. La compensación económica al culpable puede ser denegada o rebajada (art. 62 inc. 2°)."
        : "Sin prueba calificada de la causal culpable. Rechazado.";
    }
    if (v === "separacion_judicial") {
      exito = true;
      texto = "Separación judicial decretada. Subsiste el vínculo, cesa la convivencia y el deber de fidelidad (art. 33 LMC). No habilita nuevo matrimonio.";
    }

    if (exito) {
      const ec = v === "separacion_judicial" ? "separado_judicial" : "divorciado";
      game.setPersonaje({ ...game.personaje, estadoCivil: ec as any });
      game.setFlag("ruptura_definitiva");
      game.pushLog(texto, v.toUpperCase());
    } else {
      game.ajustarTrauma(6);
      game.pushLog(texto, "RECHAZO");
    }
    setResultado(texto);
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Vía de terminación o suspensión del vínculo</h2>
      <p className="text-parchment/60 text-sm">
        El juez evaluará tus flags procesales: fecha cierta del cese (arts. 22 y 25 LMC), acuerdo regulador
        (arts. 21 y 27) y, en su caso, prueba de la causal culposa (art. 54).
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {VIAS.map((v) => (
          <button key={v.id} onClick={() => intentar(v.id)} className="terminal p-4 text-left hover:bg-neon-blue/5">
            <div className="label-art text-neon-cyan">{v.nombre}</div>
            <div className="text-xs text-parchment/70 mt-1">{v.req}</div>
            <div className="flex gap-2 mt-2 flex-wrap"><span className="tag">{v.plazo}</span><span className="tag tag-violet">{v.art}</span></div>
          </button>
        ))}
      </div>

      {resultado && (
        <div className="terminal p-4">
          <div className="label-art text-neon-blue mb-2">Sentencia</div>
          <p className="text-parchment text-sm">{resultado}</p>
          {game.flags.includes("ruptura_definitiva") && (
            <div className="mt-4 flex gap-2 flex-wrap">
              <button className="btn" onClick={() => router.push("/mundo/compensacion_economica")}>▸ Compensación económica</button>
              <button className="btn" onClick={() => router.push("/liquidacion")}>▸ Ir a liquidación</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
