"use client";
// Nulidad y matrimonio putativo. La lógica de procedencia es la original
// (el vínculo no disuelto procede si lo ocultaste; las demás causales dependen
// de la prueba, simulada con azar). Cada causal se intenta una vez por ciclo:
// antes se podía insistir hasta que el azar la concediera.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad from "@/components/ui/Actividad";
import Consecuencia from "@/components/ui/Consecuencia";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";

const CAUSALES = [
  { id: "incapacidad", nombre: "Incapacidad de uno de los cónyuges", art: "Arts. 5–7 LMC" },
  { id: "vicio", nombre: "Vicio del consentimiento (error / fuerza)", art: "Art. 8 LMC" },
  { id: "formalidades", nombre: "Defecto en la celebración / falta de testigos", art: "Art. 17 LMC" },
  { id: "vinculo", nombre: "Vínculo matrimonial no disuelto", art: "Art. 5 N°1 LMC" },
];

const REGLA = {
  titulo: "Nulidad / Matrimonio putativo",
  parrafos: ["Si concurre buena fe y justa causa de error, el matrimonio nulo produce los mismos efectos civiles que el válido respecto del cónyuge de buena fe y de los hijos (art. 51 LMC). Realidad jurídica glitcheada."],
  articulo: "Art. 51 LMC",
};

export default function NulidadPanel() {
  const game = useGame();
  const { flags, hechos, personaje } = game;
  const [res, setRes] = useState<{ causal: (typeof CAUSALES)[number]; procede: boolean; deltas: Delta[] } | null>(null);
  const cap = capitulo("nulidad")!;
  const progreso = progresoCapitulo("nulidad", game);
  const tieneBigamia = flags.includes("bigamia_oculta");
  const declarada = personaje.estadoCivil === "nulidad";

  function declararNulidad(c: (typeof CAUSALES)[number]) {
    if (declarada || `nulidad:${c.id}` in hechos) return;
    const procede = c.id === "vinculo" ? tieneBigamia : Math.random() > 0.4;
    const deltas = conCambios(() => {
      if (!game.registrarHecho(`nulidad:${c.id}`, procede ? "acogida" : "rechazada")) return;
      if (procede) {
        game.setPersonaje({ ...useGame.getState().personaje, estadoCivil: "nulidad" });
        game.setFlag("ruptura_definitiva");
        game.pushLog(`Nulidad declarada por ${c.id}. Efectos: retroactivos salvo putatividad (art. 51 LMC).`, "NULIDAD");
      } else {
        game.ajustarTrauma(8);
        game.pushLog(`Causal de nulidad rechazada (${c.id}). El matrimonio persiste como realidad glitcheada.`, "RECHAZO");
      }
    });
    if (procede) deltas.unshift({ texto: "Estado civil: matrimonio nulo", signo: "•", tono: "oro" });
    setRes({ causal: c, procede, deltas });
  }

  if (res) {
    return (
      <Actividad titulo="Resolución de nulidad" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} lugar="tribunal" retrato="jueza" animo={res.procede ? "neutral" : "molesto"}>
        <div className="cuerpo">
          <Consecuencia
            tono={res.procede ? "exito" : "fallo"}
            titulo={`${res.causal.nombre}: ${res.procede ? "nulidad declarada" : "causal rechazada"}`}
            narrativa={res.procede ? "Efectos: retroactivos salvo putatividad (art. 51 LMC)." : "El matrimonio persiste como realidad glitcheada."}
            deltas={res.deltas}
            regla={{ articulo: res.causal.art, texto: REGLA.parrafos[0], codex: "nulidad" }}
          />
        </div>
        <div className="barra-accion">
          {res.procede ? <Link href="/liquidacion" className="btn btn-primario">Ir a liquidación</Link> : <button type="button" className="btn btn-primario" onClick={() => setRes(null)}>Volver a las causales</button>}
        </div>
      </Actividad>
    );
  }

  return (
    <Actividad titulo="Nulidad / Matrimonio putativo" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} introClave="intro:nulidad" lugar="registro" retrato="oficial">
      {declarada && <p className="insignia self-start" data-tono="oro"><Icono nombre="selloRoto" tam={14} /> Nulidad ya declarada en este ciclo</p>}
      <div className="cuerpo">
        <Paginado
          items={CAUSALES}
          clave={(c) => c.id}
          etiqueta="Causales"
          columnas={(w) => (w > 760 ? 2 : 1)}
          render={(c) => {
            const intento = hechos[`nulidad:${c.id}`] as string | undefined;
            return (
              <button type="button" className="eleccion h-full" disabled={declarada || !!intento} onClick={() => declararNulidad(c)}>
                <span className="font-bold txt-1">{c.nombre}</span>
                <span className="articulo">{c.art}</span>
                <span className="t-meta txt-2">{intento ? `Ya intentada: ${intento}` : "Demandar la nulidad por esta causal"}</span>
              </button>
            );
          }}
        />
      </div>
    </Actividad>
  );
}
