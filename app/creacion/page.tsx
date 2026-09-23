"use client";
// ============================================================================
// CREACIÓN DEL PERSONAJE — formulario convertido en cinco pasos que caben en
// la pantalla: nombre → sexo registral → origen → profesión → ficha y firma.
// En pantallas amplias la ficha del compareciente se ve en vivo a la derecha.
// ============================================================================
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame, useMontado } from "@/store/useGame";
import type { Atributos, Origen, Profesion, Sexo } from "@/types/game";
import { motion } from "framer-motion";
import GameShell from "@/components/ui/GameShell";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";
import Retrato from "@/components/arte/Retrato";
import { NOMBRE_ATRIBUTO } from "@/data/escenario";

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

const PASOS = ["Nombre", "Sexo registral", "Origen social", "Profesión", "Ficha y firma"] as const;

function mods(m: Partial<Atributos>) {
  return (Object.entries(m) as [keyof Atributos, number][]).map(([k, v]) => `${NOMBRE_ATRIBUTO[k]} ${v > 0 ? "+" : "−"}${Math.abs(v)}`).join(" · ");
}

function Atributos({ atributos }: { atributos: Atributos }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5" aria-label="Atributos resultantes">
      {(Object.entries(atributos) as [keyof Atributos, number][]).map(([k, v]) => (
        <li key={k}>
          <div className="flex justify-between t-meta"><span className="txt-2">{NOMBRE_ATRIBUTO[k]}</span><span className="cifra txt-1">{v}/10</span></div>
          <div className="progreso mt-0.5" aria-hidden><motion.span initial={{ width: 0 }} animate={{ width: `${v * 10}%` }} transition={{ duration: 0.6 }} /></div>
        </li>
      ))}
    </ul>
  );
}

export default function Creacion() {
  const router = useRouter();
  const montado = useMontado();
  const setPersonaje = useGame((s) => s.setPersonaje);
  const reset = useGame((s) => s.reset);
  const partida = useGame((s) => s.personaje);

  const [paso, setPaso] = useState(0);
  const [nombre, setNombre] = useState("");
  const [sexo, setSexo] = useState<Sexo>("femenino");
  const [origen, setOrigen] = useState<Origen>("clase_media");
  const [profesion, setProfesion] = useState<Profesion>("abogado");
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paso === 0) campo.current?.focus();
  }, [paso]);

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
    if (!nombre.trim()) { setPaso(0); return; }
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
  const puedeSeguir = paso > 0 || !!nombre.trim();
  const siguiente = () => { if (!puedeSeguir) return; if (paso < PASOS.length - 1) setPaso(paso + 1); else comenzar(); };
  const origenSel = ORIGEN.find((o) => o.id === origen)!;
  const profSel = PROFESION.find((p) => p.id === profesion)!;

  const ficha = (
    <div className="flex flex-col gap-3 min-h-0">
      <div className="flex items-center gap-3">
        <div className="w-20 h-24 shrink-0 rounded-lg overflow-hidden border border-oro/40 bg-tinta-850" aria-hidden>
          <Retrato tipo="jugador" sexo={sexo} className="w-full h-full" />
        </div>
        <div className="min-w-0">
          <div className="rotulo txt-oro">Ficha del compareciente</div>
          <div className="font-display font-bold t-titulo txt-1 break-words">{nombre.trim() || "Sin nombre"}</div>
          <div className="t-meta txt-2">{sexo === "femenino" ? "Mujer" : "Hombre"} · {origenSel.nombre} · {profSel.nombre}</div>
        </div>
      </div>
      <Atributos atributos={atributos} />
    </div>
  );

  return (
    <GameShell
      eyebrow="Folio 01 — Constitución del sujeto"
      titulo="Identificación del compareciente"
      volver={paso > 0 ? { onClick: () => setPaso(paso - 1), etiqueta: "Paso anterior" } : { href: "/", etiqueta: "Volver a la portada" }}
      stats={false}
      nav={false}
    >
      <div className="creacion">
        <section className="panel marco actividad-cuerpo" aria-label={`Paso ${paso + 1} de ${PASOS.length}: ${PASOS[paso]}`}>
          <header className="actividad-cabecera">
            <div className="flex justify-between items-baseline gap-2">
              <h2 className="t-titulo txt-oro">{PASOS[paso]}</h2>
              <span className="t-meta txt-2 cifra">Paso {paso + 1} de {PASOS.length}</span>
            </div>
            <div className="progreso" aria-hidden><span style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }} /></div>
          </header>

          <form className="cuerpo gap-3" onSubmit={(e) => { e.preventDefault(); siguiente(); }}>
            {paso === 0 && (
              <label className="block">
                <span className="rotulo">Nombre completo</span>
                <input
                  ref={campo}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Apellido, Nombre"
                  className="campo mt-1"
                  autoComplete="name"
                  enterKeyHint="next"
                  maxLength={60}
                />
                <span className="t-meta txt-3 mt-1 block">Aparecerá en tu expediente y en tu epílogo.</span>
                {montado && partida.nombre && (
                  <span className="t-meta txt-rojo mt-2 flex gap-1.5"><Icono nombre="alerta" tam={16} className="mt-0.5" /> Al firmar reemplazarás la partida de {partida.nombre} (ciclo {partida.cicloVital}).</span>
                )}
              </label>
            )}

            {paso === 1 && (
              <>
                <p className="t-base txt-2">
                  Define el tratamiento patrimonial: el art. 150 (patrimonio reservado), el art. 1749 (administración del marido en SC) y los satélites 166-167 son institutos sexualmente diferenciados en sociedad conyugal. Ley 21.400 amplió el matrimonio a parejas del mismo sexo; esta versión didáctica utiliza la dicotomía marido/mujer del Código Civil para enseñar SC.
                </p>
                <div className="grid sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Sexo registral">
                  {(["femenino", "masculino"] as const).map((s) => (
                    <button key={s} type="button" role="radio" aria-checked={sexo === s} className="fila-check" onClick={() => setSexo(s)}>
                      <span className="caja" aria-hidden>{sexo === s && <Icono nombre="check" tam={16} grosor={3} />}</span>
                      {s === "femenino" ? "Mujer (acceso art. 150, 166, 167)" : "Hombre (administración art. 1749)"}
                    </button>
                  ))}
                </div>
              </>
            )}

            {paso === 2 && (
              <Paginado
                items={ORIGEN}
                clave={(o) => o.id}
                etiqueta="Orígenes"
                gap={6}
                columnas={(w) => (w > 700 ? 2 : 1)}
                render={(o) => (
                  <button type="button" role="radio" aria-checked={origen === o.id} className="eleccion" onClick={() => setOrigen(o.id)}>
                    <span className="font-bold txt-1">{o.nombre}</span>
                    <span className="t-meta txt-2">{o.desc}</span>
                    <span className="t-meta txt-cian">{mods(o.mod)}</span>
                  </button>
                )}
              />
            )}

            {paso === 3 && (
              <Paginado
                items={PROFESION}
                clave={(p) => p.id}
                etiqueta="Profesiones"
                gap={6}
                columnas={(w) => (w > 420 ? 2 : 1)}
                render={(p) => (
                  <button type="button" role="radio" aria-checked={profesion === p.id} className="eleccion h-full" onClick={() => setProfesion(p.id)}>
                    <span className="font-bold txt-1">{p.nombre}</span>
                    <span className="t-meta txt-cian">{mods(p.mod)}</span>
                  </button>
                )}
              />
            )}

            {paso === 4 && (
              <>
                <p className="t-lectura txt-2 solo-amplio">Revisa tu ficha. Al firmar, se abre el expediente y comienza la partida.</p>
                <div className="creacion-ficha-movil">{ficha}</div>
              </>
            )}

            <div className="barra-accion">
              <button type="submit" className="btn btn-primario" disabled={!puedeSeguir}>
                {paso < PASOS.length - 1 ? <>Siguiente <Icono nombre="flechaDer" tam={18} /></> : <>Firmar y comenzar <Icono nombre="pluma" tam={18} /></>}
              </button>
            </div>
          </form>
        </section>
        <aside className="panel p-4 creacion-ficha" aria-label="Ficha en vivo">{ficha}</aside>
      </div>
    </GameShell>
  );
}
