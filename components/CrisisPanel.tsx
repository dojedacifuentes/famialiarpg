"use client";
import { useGame } from "@/store/useGame";
import { useState } from "react";

type Evento = {
  id: string;
  titulo: string;
  desc: string;
  acciones: { label: string; art?: string; efecto: () => void; log: string }[];
};

export default function CrisisPanel() {
  const { conyuge, setConyuge, ajustarTrauma, ajustarReputacion, pushLog, setFlag, addBien, addIncumplimiento, personaje } = useGame();
  const [usados, setUsados] = useState<string[]>([]);

  if (!conyuge) {
    return <p className="text-parchment/60 italic">Necesitas estar casado para experimentar crisis. Vuelve al matrimonio.</p>;
  }

  const eventos: Evento[] = [
    {
      id: "infidelidad",
      titulo: "Mensajes en el teléfono",
      desc: "Hay mensajes con horario nocturno y emojis ambiguos. El art. 132 CC define el adulterio como grave infracción al deber de fidelidad.",
      acciones: [
        { label: "Confrontar honestamente", art: "Art. 132 CC", efecto: () => { setConyuge({ ...conyuge, confianza: conyuge.confianza - 20, infidelidades: conyuge.infidelidades + 1, deberesCumplidos: Math.max(0, conyuge.deberesCumplidos - 15) }); ajustarTrauma(6); addIncumplimiento({ id: `inc${Date.now()}`, deber: "fidelidad", fecha: Date.now(), detalle: "Confrontación por infidelidad detectada", articulo: "Art. 132 CC", habilitaCulpa: false }); }, log: "Confrontaste. La confianza se quiebra." },
        { label: "Acopiar prueba para divorcio culposo", art: "Art. 54 N°2 LMC", efecto: () => { setFlag("prueba_infidelidad"); setConyuge({ ...conyuge, infidelidades: conyuge.infidelidades + 1 }); addIncumplimiento({ id: `inc${Date.now()}`, deber: "fidelidad", fecha: Date.now(), detalle: "Transgresión grave y reiterada", articulo: "Art. 54 N°2 LMC", habilitaCulpa: true }); }, log: "Acopiaste prueba para causal culpable." },
        { label: "Ignorar", efecto: () => { ajustarTrauma(3); }, log: "Reprimiste. El trauma crece silencioso." },
      ],
    },
    {
      id: "ocultar_bienes",
      titulo: "Tentación: ocultar un bien social",
      desc: "Puedes simular una venta a un tercero para sacarlo del haber. La nulidad por simulación está siempre disponible.",
      acciones: [
        { label: "Simular venta (fraude)", art: "Art. 1723 inc. 2 / nulidad", efecto: () => { setFlag("fraude_simulacion"); ajustarReputacion(-15); addBien({ id: `oc${Date.now()}`, nombre: "Bien ocultado simuladamente", valor: 20_000_000, naturaleza: "mueble", clase: "haber_absoluto", fuente: "compra", oculto: true }); }, log: "Simulaste enajenación. Acción de nulidad acecha." },
        { label: "Mantener honestidad patrimonial", efecto: () => ajustarReputacion(4), log: "Decidiste no simular. Tu nombre limpio." },
      ],
    },
    {
      id: "vif",
      titulo: "Violencia intrafamiliar (Ley 20.066)",
      desc: "Una noche el alcohol y el grito. Los Tribunales de Familia conocen las medidas cautelares (arts. 7-9 Ley 20.066).",
      acciones: [
        { label: "Denunciar VIF", art: "Ley 20.066", efecto: () => { setFlag("denuncia_vif"); setConyuge({ ...conyuge, vif: true }); addIncumplimiento({ id: `inc${Date.now()}`, deber: "respeto_proteccion", fecha: Date.now(), detalle: "Denuncia VIF", articulo: "Art. 131 CC / Ley 20.066", habilitaCulpa: true }); }, log: "Denunciaste VIF. Medidas cautelares solicitadas." },
        { label: "Callar", efecto: () => { ajustarTrauma(12); setConyuge({ ...conyuge, vif: true }); }, log: "Callaste. El trauma se enquista." },
      ],
    },
    {
      id: "alcoholismo",
      titulo: "Espiral",
      desc: "Dependencia que impide la vida en común. Causal del art. 54 N°5 LMC: alcoholismo o drogadicción.",
      acciones: [
        { label: "Pedir tratamiento", efecto: () => { setConyuge({ ...conyuge, alcoholismo: true, confianza: conyuge.confianza - 10 }); }, log: "Buscaste tratamiento. La esperanza es un activo intangible." },
        { label: "Documentar conducta", art: "Art. 54 N°5 LMC", efecto: () => { setFlag("prueba_alcoholismo"); addIncumplimiento({ id: `inc${Date.now()}`, deber: "vida_en_comun", fecha: Date.now(), detalle: "Alcoholismo grave", articulo: "Art. 54 N°5 LMC", habilitaCulpa: true }); }, log: "Documentaste para causal culpable." },
      ],
    },
    {
      id: "ruptura",
      titulo: "El punto sin retorno",
      desc: "Decides que ya no. Marca la ruptura definitiva: habilita el camino del cese y la separación.",
      acciones: [
        { label: "Declarar ruptura interna", efecto: () => { setFlag("ruptura_definitiva"); ajustarTrauma(15); pushLog("Marcaste ruptura definitiva. Avanzar a cese de convivencia.", "RUPTURA"); }, log: "Cruzaste el umbral. Ya no hay vuelta." },
      ],
    },
  ];

  function ejecutar(e: Evento, idx: number) {
    const a = e.acciones[idx];
    a.efecto();
    pushLog(a.log, a.art);
    setUsados((u) => [...u, e.id]);
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-red text-xl">Crisis matrimonial</h2>
      <p className="text-parchment/60 text-sm">
        Cada elección altera la causal de divorcio (art. 54 LMC), la procedencia de compensación económica
        (art. 62 inc. 2°) y tu reputación.
      </p>

      <div className="grid md:grid-cols-2 gap-3 text-xs">
        <Stat label="Afecto" value={conyuge.afecto} />
        <Stat label="Confianza" value={conyuge.confianza} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {eventos.map((e) => {
          const hecho = usados.includes(e.id);
          return (
            <div key={e.id} className={`terminal p-4 ${hecho ? "opacity-40" : ""}`}>
              <div className="label-art text-neon-cyan">{e.titulo}</div>
              <p className="text-parchment/70 text-xs mt-1 mb-3">{e.desc}</p>
              {!hecho && e.acciones.map((a, i) => (
                <button key={i} onClick={() => ejecutar(e, i)} className="btn block w-full text-left text-[11px] mb-1">
                  ▸ {a.label} {a.art && <span className="ml-2 tag tag-violet">{a.art}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const pct = ((value + 100) / 200) * 100;
  return (
    <div className="terminal p-3">
      <div className="flex justify-between"><span>{label}</span><span className="text-neon-cyan">{value}</span></div>
      <div className="h-1 bg-ink-700 mt-2"><div className="h-full barfill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
