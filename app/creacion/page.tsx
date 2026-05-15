"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/store/useGame";
import type { Atributos, Origen, Profesion, Sexo } from "@/types/game";
import { motion } from "framer-motion";

const ORIGEN: { id: Origen; nombre: string; desc: string; mod: Partial<Atributos>; nivel: number }[] = [
  { id: "popular", nombre: "Origen popular", desc: "Barrio bravo. Resistencia. Desconfianza institucional.", mod: { resistencia_emocional: 2, persuasion: 1 }, nivel: 25 },
  { id: "clase_media", nombre: "Clase media", desc: "Hipoteca y deudas. Equilibrio gris.", mod: { honestidad: 1, inteligencia_juridica: 1 }, nivel: 55 },
  { id: "elite", nombre: "Élite", desc: "Patrimonio heredado. Capitulaciones obligatorias.", mod: { persuasion: 2, empatia: -1 }, nivel: 90 },
  { id: "rural", nombre: "Rural", desc: "Predios, frutos naturales, herencias agrarias.", mod: { honestidad: 2, resistencia_emocional: 2 }, nivel: 30 },
  { id: "academico", nombre: "Académico", desc: "Jurista melancólico. Lee a Somarriva en la noche.", mod: { inteligencia_juridica: 3 }, nivel: 40 },
];

const PROFESION: { id: Profesion; nombre: string; mod: Partial<Atributos> }[] = [
  { id: "abogado", nombre: "Abogado/a", mod: { inteligencia_juridica: 2, persuasion: 1 } },
  { id: "comerciante", nombre: "Comerciante", mod: { persuasion: 2, honestidad: -1 } },
  { id: "funcionario", nombre: "Funcionario público", mod: { honestidad: 1, impulsividad: -1 } },
  { id: "artista", nombre: "Artista", mod: { empatia: 2, resistencia_emocional: -1 } },
  { id: "ingeniero", nombre: "Ingeniero/a", mod: { inteligencia_juridica: 1, empatia: -1 } },
  { id: "obrero", nombre: "Obrero/a", mod: { resistencia_emocional: 2, honestidad: 1 } },
];

export default function Creacion() {
  const router = useRouter();
  const setPersonaje = useGame((s) => s.setPersonaje);
  const reset = useGame((s) => s.reset);

  const [nombre, setNombre] = useState("");
  const [sexo, setSexo] = useState<Sexo>("femenino");
  const [origen, setOrigen] = useState<Origen>("clase_media");
  const [profesion, setProfesion] = useState<Profesion>("abogado");

  function aplicarMods(): Atributos {
    const base: Atributos = {
      persuasion: 5, honestidad: 5, impulsividad: 5,
      inteligencia_juridica: 5, empatia: 5, resistencia_emocional: 5,
    };
    const o = ORIGEN.find((x) => x.id === origen)!.mod;
    const p = PROFESION.find((x) => x.id === profesion)!.mod;
    (Object.keys(base) as (keyof Atributos)[]).forEach((k) => {
      base[k] = Math.max(0, Math.min(10, base[k] + (o[k] ?? 0) + (p[k] ?? 0)));
    });
    return base;
  }

  function comenzar() {
    if (!nombre.trim()) return;
    reset();
    setPersonaje({
      nombre: nombre.trim(),
      sexo,
      origen,
      profesion,
      nivelEconomico: ORIGEN.find((x) => x.id === origen)!.nivel,
      atributos: aplicarMods(),
      reputacion: 0,
      trauma: 0,
      estadoCivil: "soltero",
      cicloVital: 1,
    });
    router.push("/juego");
  }

  const atributos = aplicarMods();

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="tag mb-4">FOLIO 01 — CONSTITUCIÓN DEL SUJETO</div>
      <h1 className="label-art text-3xl text-neon-blue mb-6">Identificación del compareciente</h1>

      <section className="terminal p-6 mb-6">
        <label className="text-xs uppercase tracking-widest text-neon-cyan">Nombre completo</label>
        <input
          autoFocus
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Apellido, Nombre"
          className="mt-2 w-full bg-ink-700 border border-neon-blue/30 text-parchment p-3 focus:outline-none focus:border-neon-blue"
        />
      </section>

      <section className="terminal p-5 mb-6">
        <label className="text-xs uppercase tracking-widest text-neon-cyan block mb-3">Sexo registral</label>
        <div className="text-parchment/50 text-xs mb-3 italic">
          Define el tratamiento patrimonial: el art. 150 (patrimonio reservado), el art. 1749 (administración del marido en SC)
          y los satélites 166-167 son institutos sexualmente diferenciados en sociedad conyugal. Ley 21.400 amplió el matrimonio
          a parejas del mismo sexo; esta versión didáctica utiliza la dicotomía marido/mujer del Código Civil para enseñar SC.
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(["femenino", "masculino"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSexo(s)}
              className={`p-4 border ${sexo === s ? "border-neon-blue bg-neon-blue/10 text-neon-blue" : "border-ink-400"} uppercase tracking-widest text-sm`}
            >
              {s === "femenino" ? "Mujer (acceso art. 150, 166, 167)" : "Hombre (administración art. 1749)"}
            </button>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="terminal p-5">
          <h2 className="label-art text-neon-violet mb-3">Origen social</h2>
          <div className="space-y-2">
            {ORIGEN.map((o) => (
              <button
                key={o.id}
                onClick={() => setOrigen(o.id)}
                className={`w-full text-left p-3 border ${origen === o.id ? "border-neon-blue bg-neon-blue/10" : "border-ink-400"}`}
              >
                <div className="text-neon-blue text-sm">{o.nombre}</div>
                <div className="text-parchment/60 text-xs">{o.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="terminal p-5">
          <h2 className="label-art text-neon-violet mb-3">Profesión</h2>
          <div className="grid grid-cols-2 gap-2">
            {PROFESION.map((p) => (
              <button
                key={p.id}
                onClick={() => setProfesion(p.id)}
                className={`p-3 border text-left ${profesion === p.id ? "border-neon-blue bg-neon-blue/10" : "border-ink-400"}`}
              >
                <div className="text-neon-blue text-sm">{p.nombre}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="terminal p-5 mt-6">
        <h2 className="label-art text-neon-cyan mb-3">Atributos resultantes</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.entries(atributos) as [keyof Atributos, number][]).map(([k, v]) => (
            <div key={k} className="border border-ink-400 p-3">
              <div className="text-xs uppercase tracking-widest text-parchment/70">{k.replace(/_/g, " ")}</div>
              <div className="h-2 bg-ink-700 mt-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${v * 10}%` }} transition={{ duration: .8 }} className="h-full barfill" />
              </div>
              <div className="text-neon-blue text-right text-xs mt-1">{v}/10</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex gap-3">
        <button onClick={comenzar} disabled={!nombre.trim()} className="btn disabled:opacity-30">▶ Firmar y comenzar</button>
      </div>
    </main>
  );
}
