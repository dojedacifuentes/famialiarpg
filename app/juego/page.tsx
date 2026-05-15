"use client";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Mundo } from "@/types/game";

const MAPA: { id: Mundo; titulo: string; subt: string; req?: string }[] = [
  { id: "noviazgo", titulo: "I · El Noviazgo Precontractual", subt: "Esponsales, impedimentos, vicios del consentimiento (arts. 98, 5-8 LMC)." },
  { id: "matrimonio", titulo: "II · El Matrimonio", subt: "Capitulaciones y régimen (arts. 135, 1715-1721 CC).", req: "consentimiento" },
  { id: "haber", titulo: "III · El Haber social", subt: "Clasificación: art. 1725. Recompensas y subrogación.", req: "casado" },
  { id: "patrimonios_satelite", titulo: "III bis · Patrimonios satélite", subt: "Arts. 150, 166, 167 — mujer casada en SC.", req: "casada_mujer_sc" },
  { id: "deberes", titulo: "IV · Deberes recíprocos", subt: "Fidelidad, socorro, ayuda, respeto (arts. 131-134 CC).", req: "casado" },
  { id: "hijos", titulo: "V · Filiación y cuidado", subt: "Filiación, alimentos, cuidado personal, RDR (Leyes 19.585, 14.908).", req: "casado" },
  { id: "filiacion_acciones", titulo: "V bis · Acciones de filiación", subt: "Reclamación, impugnación, prueba biológica (arts. 195-221).", req: "casado" },
  { id: "bienes_familiares", titulo: "VI · Bienes familiares", subt: "Arts. 141-149 CC. Declaración, efectos, desafectación.", req: "casado" },
  { id: "crisis", titulo: "VII · Crisis matrimonial", subt: "Infidelidad, VIF, simulación. Causales del art. 54 LMC.", req: "casado" },
  { id: "cese_convivencia", titulo: "VIII · Fecha cierta del cese", subt: "Arts. 22 y 25 LMC: medios taxativos.", req: "ruptura" },
  { id: "acuerdo_regulador", titulo: "IX · Acuerdo regulador", subt: "Arts. 21 y 27 LMC: completo y suficiente.", req: "ruptura" },
  { id: "separacion", titulo: "X · Separación y divorcio", subt: "Vías del art. 54-55 LMC; separación judicial 26-29." },
  { id: "compensacion_economica", titulo: "XI · Compensación económica", subt: "Arts. 61-66 LMC. Cálculo y modalidades.", req: "ruptura" },
  { id: "nulidad", titulo: "XII · Nulidad y matrimonio putativo", subt: "Arts. 5-8, 17, 51 LMC.", req: "casado" },
  { id: "liquidacion", titulo: "XIII · Liquidación", subt: "Boss final patrimonial (arts. 1765-1788 CC).", req: "ruptura" },
  { id: "segunda_vida", titulo: "XIV · Segunda vida", subt: "Post-divorcio. Rehacer patrimonio, segundas nupcias (arts. 124-127).", req: "post_ruptura" },
  { id: "examen", titulo: "XV · Modo Examen", subt: "Cédula de 30 preguntas con explicación normativa." },
];

export default function Juego() {
  const router = useRouter();
  const { personaje, flags, hijos, bienes, log, recompensas, conyuge, finalizado, ce, fechaCierta } = useGame();

  useEffect(() => {
    if (!personaje.nombre) router.replace("/creacion");
  }, [personaje.nombre, router]);

  if (!personaje.nombre) return null;

  const casado = personaje.estadoCivil === "casado" || personaje.estadoCivil === "casado_segundo";
  const ruptura = flags.includes("ruptura_definitiva") || ["separado_judicial", "divorciado", "nulidad"].includes(personaje.estadoCivil);
  const postRuptura = ruptura;
  const consentValido = flags.includes("consentimiento_valido") || casado;
  const esMujerSC = personaje.sexo === "femenino" && personaje.regimen === "sociedad_conyugal";

  function puede(req?: string) {
    if (!req) return true;
    if (req === "consentimiento") return consentValido;
    if (req === "casado") return casado;
    if (req === "casada_mujer_sc") return esMujerSC && casado;
    if (req === "ruptura") return ruptura || casado; // se exploran al avanzar la crisis
    if (req === "post_ruptura") return postRuptura;
    return true;
  }

  return (
    <main className="min-h-screen px-6 py-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div>
          <div className="tag mb-2">EXPEDIENTE ABIERTO · CICLO {personaje.cicloVital}</div>
          <h1 className="label-art text-2xl text-neon-blue">{personaje.nombre}</h1>
          <p className="text-parchment/60 text-xs uppercase tracking-widest">
            {personaje.sexo} · {personaje.profesion} · {personaje.origen} · est. civil: {personaje.estadoCivil}
            {personaje.regimen ? ` · ${personaje.regimen.replace(/_/g, " ")}` : ""}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/codex" className="btn">📜 Codex</Link>
          <Link href="/inventario" className="btn">📦 Inventario</Link>
          {finalizado && <Link href="/epilogo" className="btn">📜 Epílogo</Link>}
          <Link href="/" className="btn btn-danger">⏻ Salir</Link>
        </div>
      </header>

      <section className="grid lg:grid-cols-3 gap-4 mb-6">
        <Stat label="Reputación" value={personaje.reputacion} min={-100} max={100} color="violet" />
        <Stat label="Trauma" value={personaje.trauma} min={0} max={100} color="red" />
        <Stat label="Nivel económico" value={personaje.nivelEconomico} min={0} max={100} color="blue" />
      </section>

      <section className="grid md:grid-cols-2 gap-4 mb-8">
        {MAPA.map((m) => {
          const habilitado = puede(m.req);
          return (
            <motion.div key={m.id} whileHover={{ y: -2 }}>
              <Link
                href={habilitado ? `/mundo/${m.id}` : "#"}
                className={`block terminal p-5 ${!habilitado ? "opacity-40 pointer-events-none" : ""}`}
              >
                <div className="label-art text-neon-cyan text-lg">{m.titulo}</div>
                <div className="text-parchment/60 text-xs mt-1">{m.subt}</div>
                {!habilitado && <div className="tag tag-amber mt-3">BLOQUEADO</div>}
              </Link>
            </motion.div>
          );
        })}
      </section>

      <section className="terminal p-4 mb-8">
        <div className="label-art text-neon-violet text-sm mb-2">Registro del expediente</div>
        <div className="max-h-40 overflow-y-auto text-xs text-parchment/70 space-y-1">
          {log.length === 0 && <div className="italic text-parchment/40">Sin actuaciones. Pronto la lluvia jurídica caerá.</div>}
          {log.map((l, i) => (
            <div key={i}>
              <span className="text-neon-blue">›</span> {l.texto}
              {l.tag && <span className="ml-2 tag">{l.tag}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-3 text-xs">
        <div className="terminal p-3"><b className="text-neon-cyan">{bienes.length}</b> bienes</div>
        <div className="terminal p-3"><b className="text-neon-cyan">{hijos.length}</b> hijos · {hijos.filter(h=>!h.alimentosAlDia).length} en mora</div>
        <div className="terminal p-3"><b className="text-neon-cyan">{recompensas.length}</b> recompensas</div>
        <div className="terminal p-3">
          {fechaCierta ? <b className="text-neon-blue">Cese: {fechaCierta.medio.replace(/_/g, " ")}</b> : <span className="text-parchment/40">Cese pendiente</span>}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, min, max, color }: { label: string; value: number; min: number; max: number; color: "violet" | "red" | "blue" }) {
  const pct = ((value - min) / (max - min)) * 100;
  const c = color === "violet" ? "bg-neon-violet" : color === "red" ? "bg-neon-red" : "bg-neon-blue";
  return (
    <div className="terminal p-4">
      <div className="flex justify-between text-xs uppercase tracking-widest mb-2">
        <span>{label}</span><span className="text-parchment/70">{value}</span>
      </div>
      <div className="h-2 bg-ink-700">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full ${c}`} />
      </div>
    </div>
  );
}
