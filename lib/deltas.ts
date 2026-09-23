// Cambios de estado legibles: qué cambió tras una decisión y cómo mostrarlo.
import type { Atributos, SaveState } from "@/types/game";
import type { Opcion } from "@/data/dialogos";
import { ANTECEDENTES, NOMBRE_ATRIBUTO } from "@/data/escenario";

export type Delta = { texto: string; signo: "+" | "−" | "•"; tono: "verde" | "rojo" | "oro" | "cian" };

/** Para la reputación y los atributos, subir es bueno; para el trauma, no. */
function tonoDe(clave: string, valor: number): Delta["tono"] {
  if (clave === "trauma") return valor > 0 ? "rojo" : "verde";
  if (clave === "impulsividad") return "oro";
  return valor > 0 ? "verde" : "rojo";
}

export function deltasDeEfectos(ef: Opcion["efectos"] | undefined, flagsPrevios: string[] = []): Delta[] {
  if (!ef) return [];
  const res: Delta[] = [];
  if (ef.reputacion) res.push({ texto: `Reputación ${ef.reputacion > 0 ? "+" : "−"}${Math.abs(ef.reputacion)}`, signo: ef.reputacion > 0 ? "+" : "−", tono: tonoDe("reputacion", ef.reputacion) });
  if (ef.trauma) res.push({ texto: `Trauma ${ef.trauma > 0 ? "+" : "−"}${Math.abs(ef.trauma)}`, signo: ef.trauma > 0 ? "+" : "−", tono: tonoDe("trauma", ef.trauma) });
  if (ef.atributos) {
    (Object.entries(ef.atributos) as [keyof Atributos, number][]).forEach(([k, v]) => {
      if (v) res.push({ texto: `${NOMBRE_ATRIBUTO[k]} ${v > 0 ? "+" : "−"}${Math.abs(v)}`, signo: v > 0 ? "+" : "−", tono: tonoDe(k, v) });
    });
  }
  for (const f of ef.flags ?? []) {
    if (flagsPrevios.includes(f)) continue;
    const a = ANTECEDENTES[f];
    if (a) res.push({ texto: `Antecedente: ${a.nombre}`, signo: "•", tono: "cian" });
  }
  return res;
}

type Foto = Pick<SaveState, "personaje" | "flags" | "logros" | "bienes" | "recompensas" | "incumplimientos">;

export function foto(s: Foto): Foto {
  return { personaje: s.personaje, flags: s.flags, logros: s.logros, bienes: s.bienes, recompensas: s.recompensas, incumplimientos: s.incumplimientos };
}

/** Diferencias entre dos fotos del estado (para acciones de los paneles). */
export function diferencias(a: Foto, b: Foto): Delta[] {
  const res: Delta[] = [];
  const num = (clave: string, nombre: string, x: number, y: number) => {
    const d = y - x;
    if (d) res.push({ texto: `${nombre} ${d > 0 ? "+" : "−"}${Math.abs(d)}`, signo: d > 0 ? "+" : "−", tono: tonoDe(clave, d) });
  };
  num("reputacion", "Reputación", a.personaje.reputacion, b.personaje.reputacion);
  num("trauma", "Trauma", a.personaje.trauma, b.personaje.trauma);
  num("economia", "Nivel económico", a.personaje.nivelEconomico, b.personaje.nivelEconomico);
  (Object.keys(b.personaje.atributos) as (keyof Atributos)[]).forEach((k) =>
    num(k, NOMBRE_ATRIBUTO[k], a.personaje.atributos[k], b.personaje.atributos[k])
  );
  for (const f of b.flags) {
    if (!a.flags.includes(f) && ANTECEDENTES[f]) res.push({ texto: `Antecedente: ${ANTECEDENTES[f].nombre}`, signo: "•", tono: "cian" });
  }
  for (const l of b.logros) {
    if (!a.logros.some((x) => x.id === l.id)) res.push({ texto: `Logro: ${l.titulo}`, signo: "•", tono: "oro" });
  }
  const nuevosBienes = b.bienes.filter((x) => !a.bienes.some((y) => y.id === x.id));
  for (const nb of nuevosBienes) res.push({ texto: `Bien inscrito: ${nb.nombre}`, signo: "+", tono: "oro" });
  const nuevasRec = b.recompensas.length - a.recompensas.length;
  if (nuevasRec > 0) res.push({ texto: `Recompensa anotada en el libro (${nuevasRec})`, signo: "+", tono: "cian" });
  const nuevosInc = b.incumplimientos.length - a.incumplimientos.length;
  if (nuevosInc > 0) res.push({ texto: `Incumplimiento registrado (${nuevosInc})`, signo: "−", tono: "rojo" });
  return res;
}

/** Ánimo del personaje que reacciona, según lo que cambió. */
export function animoDe(deltas: Delta[]): "neutral" | "aprueba" | "molesto" | "triste" {
  const rep = deltas.find((d) => d.texto.startsWith("Reputación"));
  const trauma = deltas.find((d) => d.texto.startsWith("Trauma"));
  if (rep?.signo === "−") return "molesto";
  if (trauma?.signo === "+") return "triste";
  if (rep?.signo === "+" || deltas.some((d) => d.tono === "verde")) return "aprueba";
  return "neutral";
}
