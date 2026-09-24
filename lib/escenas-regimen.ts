import type { Escena } from "@/data/dialogos";
import type { Regimen } from "@/types/game";
import { REGIMENES } from "./regimenes";

export function escenaParaRegimen(escena: Escena, regimen?: Regimen): Escena {
  if (escena.id !== "haber_intro" || !regimen || regimen === "sociedad_conyugal") return escena;
  const r = REGIMENES[regimen];
  return { ...escena, titulo: r.taller, speaker: "EVA · GUÍA", ambientacion: "El escáner despierta. La impresora pide una copia del original de la copia.", lineas: [r.regla, "Lee el titular acreditado de cada caso. El matrimonio no funciona como una aspiradora patrimonial."], articulo: { n: r.articulo, t: r.regla }, opciones: [{ texto: "Abrir el taller", efectos: { log: `Iniciaste el taller: ${r.nombre}.` } }] };
}
