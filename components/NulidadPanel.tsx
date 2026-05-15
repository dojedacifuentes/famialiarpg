"use client";
import { useGame } from "@/store/useGame";

const CAUSALES = [
  { id: "incapacidad", nombre: "Incapacidad de uno de los cónyuges", art: "Arts. 5–7 LMC" },
  { id: "vicio", nombre: "Vicio del consentimiento (error / fuerza)", art: "Art. 8 LMC" },
  { id: "formalidades", nombre: "Defecto en la celebración / falta de testigos", art: "Art. 17 LMC" },
  { id: "vinculo", nombre: "Vínculo matrimonial no disuelto", art: "Art. 5 N°1 LMC" },
];

export default function NulidadPanel() {
  const { flags, setPersonaje, personaje, pushLog, setFlag, ajustarTrauma } = useGame();
  const tieneBigamia = flags.includes("bigamia_oculta");

  function declararNulidad(c: string) {
    const procede = c === "vinculo" ? tieneBigamia : Math.random() > 0.4;
    if (procede) {
      setPersonaje({ ...personaje, estadoCivil: "nulidad" });
      setFlag("ruptura_definitiva");
      pushLog(`Nulidad declarada por ${c}. Efectos: retroactivos salvo putatividad (art. 51 LMC).`, "NULIDAD");
    } else {
      ajustarTrauma(8);
      pushLog(`Causal de nulidad rechazada (${c}). El matrimonio persiste como realidad glitcheada.`, "RECHAZO");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-violet text-xl glitch-text">Nulidad / Matrimonio putativo</h2>
      <p className="text-parchment/60 text-sm">
        Si concurre buena fe y justa causa de error, el matrimonio nulo produce los mismos efectos civiles que el válido respecto del cónyuge de buena fe y de los hijos (art. 51 LMC). Realidad jurídica glitcheada.
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        {CAUSALES.map((c) => (
          <button key={c.id} className="terminal p-4 text-left hover:bg-neon-violet/5" onClick={() => declararNulidad(c.id)}>
            <div className="label-art text-neon-cyan">{c.nombre}</div>
            <div className="tag tag-violet mt-2">{c.art}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
