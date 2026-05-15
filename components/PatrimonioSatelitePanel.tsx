"use client";
import { useState } from "react";
import { useGame } from "@/store/useGame";
import { clasificarSatelite, efectoOpcionGananciales } from "@/lib/reglas";
import type { Bien } from "@/types/game";

type Caso = {
  nombre: string;
  valor: number;
  origen: Parameters<typeof clasificarSatelite>[0]["origen"];
  esperado: "reservado_art150" | "satelite_art166" | "satelite_art167" | "haber_absoluto";
};

const CASOS: Caso[] = [
  { nombre: "Sueldo mensual de la mujer obtenido en empleo propio", valor: 1_200_000, origen: "trabajo_separado", esperado: "reservado_art150" },
  { nombre: "Auto comprado por la mujer con su sueldo profesional", valor: 12_000_000, origen: "trabajo_separado", esperado: "reservado_art150" },
  { nombre: "Casa heredada por la mujer con condición de que el marido no la administre", valor: 90_000_000, origen: "donacion_condicion_no_admin", esperado: "satelite_art166" },
  { nombre: "Acciones pactadas como separadas en capitulación matrimonial preparatoria", valor: 30_000_000, origen: "capitulaciones_separacion_parcial", esperado: "satelite_art167" },
];

export default function PatrimonioSatelitePanel() {
  const { personaje, addBien, pushLog, ajustarAtributo, ajustarTrauma } = useGame();
  const [i, setI] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; texto: string; art: string } | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fase, setFase] = useState<"clasificar" | "opcion">("clasificar");
  const [decision, setDecision] = useState<"aceptar" | "renunciar" | null>(null);

  const caso = CASOS[i];

  function elegir(c: Caso["esperado"]) {
    const res = clasificarSatelite({ sexo: personaje.sexo, origen: caso.origen });
    const ok = res.clase === c;
    setFeedback({ ok, texto: res.justificacion, art: res.articulo });
    if (ok) {
      setAciertos((a) => a + 1);
      ajustarAtributo("inteligencia_juridica", 1);
      const bien: Bien = {
        id: `sat-${Date.now()}`,
        nombre: caso.nombre,
        valor: caso.valor,
        clase: res.clase,
        naturaleza: caso.valor > 30_000_000 ? "inmueble" : "mueble",
        fuente: caso.origen === "trabajo_separado" ? "trabajo_separado_mujer" : caso.origen === "donacion_condicion_no_admin" ? "donacion" : "compra",
      };
      addBien(bien);
      pushLog(`Clasificado correctamente: ${caso.nombre} → ${res.clase}`, res.articulo);
    } else {
      ajustarTrauma(2);
    }
  }

  function avanzar() {
    setFeedback(null);
    if (i + 1 >= CASOS.length) setFase("opcion");
    else setI(i + 1);
  }

  if (personaje.sexo !== "femenino") {
    return (
      <div className="terminal p-5">
        <h2 className="label-art text-neon-blue text-xl mb-3">Patrimonios satélite</h2>
        <p className="text-parchment/70 text-sm">
          El patrimonio reservado del art. 150 CC y los satélites de los arts. 166 y 167 son institutos privativos
          de la mujer casada en sociedad conyugal. En esta partida tu personaje es de sexo masculino: no procede esta sección.
        </p>
        <p className="text-parchment/50 text-xs mt-3 italic">
          Reflexión doctrinaria: la asimetría es histórica y ha sido objeto de proyectos de reforma. Para fines didácticos,
          el código vigente mantiene la dicotomía marido/mujer en SC.
        </p>
      </div>
    );
  }

  if (fase === "opcion") {
    const reservado = 13_200_000; // suma estimada de los aciertos para simulación didáctica
    const cuotaGananciales = 8_000_000;
    const pasivoReservado = 1_000_000;
    const efecto = efectoOpcionGananciales({ reservadoArt150: reservado, cuotaGananciales, pasivoReservado });
    return (
      <div className="space-y-4">
        <h2 className="label-art text-neon-blue text-xl">Opción del art. 150 inc. final CC</h2>
        <p className="text-parchment/70 text-sm">
          Al disolverse la sociedad conyugal, la mujer debe optar (decisión IRREVOCABLE).
          Cifras simuladas: Reservado ${reservado.toLocaleString("es-CL")} · Cuota gananciales ${cuotaGananciales.toLocaleString("es-CL")} · Pasivo reservado ${pasivoReservado.toLocaleString("es-CL")}.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <button className="terminal p-4 text-left hover:bg-neon-blue/5" onClick={() => setDecision("aceptar")}>
            <div className="label-art text-neon-cyan">ACEPTAR gananciales</div>
            <div className="text-3xl text-neon-blue mt-2">${efecto.aceptar.neto.toLocaleString("es-CL")}</div>
            <p className="text-parchment/70 text-xs mt-2">{efecto.aceptar.texto}</p>
          </button>
          <button className="terminal p-4 text-left hover:bg-neon-blue/5" onClick={() => setDecision("renunciar")}>
            <div className="label-art text-neon-violet">RENUNCIAR a gananciales</div>
            <div className="text-3xl text-neon-violet mt-2">${efecto.renunciar.neto.toLocaleString("es-CL")}</div>
            <p className="text-parchment/70 text-xs mt-2">{efecto.renunciar.texto}</p>
          </button>
        </div>
        {decision && (
          <div className="terminal p-4 border-neon-blue">
            <p className="text-parchment text-sm">
              Optaste por <b className="text-neon-cyan">{decision.toUpperCase()}</b>. La decisión es irrevocable conforme al art. 150 inc. final CC.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Patrimonios satélite de la mujer casada (arts. 150, 166, 167 CC)</h2>
      <div className="terminal p-5">
        <div className="tag mb-2">CASO {i + 1} / {CASOS.length}</div>
        <div className="label-art text-parchment">{caso.nombre}</div>
        <div className="text-parchment/60 text-xs mt-1">Valor: ${caso.valor.toLocaleString("es-CL")}</div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        <button disabled={!!feedback} onClick={() => elegir("reservado_art150")} className="p-3 border border-neon-cyan text-neon-cyan text-xs uppercase tracking-widest disabled:opacity-40">Reservado art. 150</button>
        <button disabled={!!feedback} onClick={() => elegir("satelite_art166")} className="p-3 border border-neon-violet text-neon-violet text-xs uppercase tracking-widest disabled:opacity-40">Satélite art. 166</button>
        <button disabled={!!feedback} onClick={() => elegir("satelite_art167")} className="p-3 border border-neon-amber text-neon-amber text-xs uppercase tracking-widest disabled:opacity-40">Satélite art. 167</button>
        <button disabled={!!feedback} onClick={() => elegir("haber_absoluto")} className="p-3 border border-neon-blue text-neon-blue text-xs uppercase tracking-widest disabled:opacity-40">Haber absoluto</button>
      </div>
      {feedback && (
        <div className={`terminal p-4 ${feedback.ok ? "border-neon-blue" : "border-neon-red"}`}>
          <div className={`label-art ${feedback.ok ? "text-neon-blue" : "text-neon-red"}`}>{feedback.ok ? "✓ Correcto" : "✗ Incorrecto"}</div>
          <p className="text-parchment/80 text-xs mt-2">{feedback.texto}</p>
          <div className="tag tag-violet mt-2">{feedback.art}</div>
          <button className="btn mt-3" onClick={avanzar}>▸ {i + 1 >= CASOS.length ? "Pasar a la opción" : "Siguiente"}</button>
        </div>
      )}
    </div>
  );
}
