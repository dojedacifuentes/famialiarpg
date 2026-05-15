"use client";
import { useGame } from "@/store/useGame";

export default function BienesFamiliaresPanel() {
  const { bienes, updateBien, pushLog, setFlag } = useGame();

  function declarar(id: string) {
    updateBien(id, { declaradoBienFamiliar: true, clase: "familiar" });
    setFlag("bien_familiar_declarado");
    pushLog("Declaraste un inmueble como bien familiar.", "Art. 141 CC");
  }

  function desafectar(id: string) {
    updateBien(id, { declaradoBienFamiliar: false });
    pushLog("Desafectaste un bien familiar (art. 145 CC).", "Art. 145 CC");
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Bienes familiares (arts. 141-149 CC)</h2>
      <p className="text-parchment/60 text-sm">
        El inmueble de propiedad de cualquiera de los cónyuges que sirva de residencia principal de la familia,
        y los muebles que la guarnecen, pueden ser declarados bienes familiares (art. 141). La declaración se hace
        judicialmente y limita la disposición sin autorización del otro cónyuge (art. 142). Su afectación no muda
        el dominio. La desafectación procede por acuerdo, por sentencia o si el bien deja de servir a la familia (art. 145).
      </p>

      <div className="space-y-2">
        {bienes.filter((b) => b.fuente === "compra").map((b) => (
          <div key={b.id} className="terminal p-3 flex justify-between items-center">
            <div>
              <div className="text-sm">{b.nombre}</div>
              <div className="text-xs text-parchment/50">${b.valor.toLocaleString("es-CL")} · {b.clase}</div>
            </div>
            {b.declaradoBienFamiliar
              ? <button className="btn btn-danger text-[10px]" onClick={() => desafectar(b.id)}>Desafectar (art. 145)</button>
              : <button className="btn text-[10px]" onClick={() => declarar(b.id)}>Declarar familiar (art. 141)</button>}
          </div>
        ))}
        {bienes.length === 0 && <p className="text-parchment/40 italic text-sm">Aún no tienes bienes para declarar familiares.</p>}
      </div>
    </div>
  );
}
