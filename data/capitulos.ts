// ============================================================================
// CAPÍTULOS — mapa de la campaña, objetivos y progreso.
// Títulos, subtítulos y requisitos trasladados sin cambios desde app/juego.
// Añadidos de juego (no jurídicos): acto, lugar, icono, objetivo y el cálculo
// del progreso a partir del estado guardado.
// ============================================================================
import type { Mundo, SaveState, Regimen } from "@/types/game";
import { REGIMENES } from "@/lib/regimenes";
import type { NombreIcono } from "@/components/ui/Icono";
import type { Lugar } from "@/data/escenario";
import { CASOS_HABER, CASOS_SATELITE } from "@/data/casos";

export type Requisito = "consentimiento" | "casado" | "casada_mujer_sc" | "ruptura" | "post_ruptura";

export type Capitulo = {
  id: Mundo;
  numeral: string;
  titulo: string;
  subt: string;
  req?: Requisito;
  acto: number;
  lugar: Lugar;
  icono: NombreIcono;
  objetivo: string;
  escenas: string[];
};

export const ACTOS = [
  { n: 1, titulo: "Acto I · La promesa", lema: "Antes del sí: esponsales, impedimentos y régimen." },
  { n: 2, titulo: "Acto II · La vida en común", lema: "Bienes, deberes e hijos bajo un mismo techo." },
  { n: 3, titulo: "Acto III · La ruptura", lema: "Crisis, cese, acuerdo y sentencia." },
  { n: 4, titulo: "Acto IV · El después", lema: "Liquidar, rehacer la vida y rendir la cédula." },
] as const;

export const CAPITULOS: Capitulo[] = [
  { id: "noviazgo", numeral: "I", titulo: "El Noviazgo Precontractual", subt: "Esponsales, impedimentos, vicios del consentimiento (arts. 98, 5-8 LMC).", acto: 1, lugar: "notaria", icono: "anillo", objetivo: "Llega al acto constitutivo: esponsales, impedimentos y consentimiento.", escenas: ["inicio_noviazgo", "impedimentos", "consentimiento"] },
  { id: "matrimonio", numeral: "II", titulo: "El Matrimonio", subt: "Capitulaciones y régimen (arts. 135, 1715-1721 CC).", req: "consentimiento", acto: 1, lugar: "archivo", icono: "anillos", objetivo: "Decide si pactas capitulaciones y elige tu régimen patrimonial.", escenas: ["capitulaciones_previas", "eleccion_regimen"] },
  { id: "haber", numeral: "III", titulo: "El Haber social", subt: "Clasificación: art. 1725. Recompensas y subrogación.", req: "casado", acto: 2, lugar: "despacho", icono: "cofre", objetivo: "Clasifica los bienes del matrimonio: cada acierto entra a tu inventario.", escenas: ["haber_intro"] },
  { id: "patrimonios_satelite", numeral: "III bis", titulo: "Patrimonios satélite", subt: "Arts. 150, 166, 167 — mujer casada en SC.", req: "casada_mujer_sc", acto: 2, lugar: "banco", icono: "llave", objetivo: "Distingue los patrimonios satélite y ejerce la opción del art. 150.", escenas: ["art150_explica"] },
  { id: "deberes", numeral: "IV", titulo: "Deberes recíprocos", subt: "Fidelidad, socorro, ayuda, respeto (arts. 131-134 CC).", req: "casado", acto: 2, lugar: "cocina", icono: "manos", objetivo: "Decide cómo vives cada uno de los seis deberes.", escenas: ["deberes_intro"] },
  { id: "hijos", numeral: "V", titulo: "Filiación y cuidado", subt: "Filiación, alimentos, cuidado personal, RDR (Leyes 19.585, 14.908).", req: "casado", acto: 2, lugar: "hogar", icono: "cuna", objetivo: "Inscribe un nacimiento y decide sobre alimentos y cuidado.", escenas: [] },
  { id: "filiacion_acciones", numeral: "V bis", titulo: "Acciones de filiación", subt: "Reclamación, impugnación, prueba biológica (arts. 195-221).", req: "casado", acto: 2, lugar: "laboratorio", icono: "probeta", objetivo: "Enfrenta el resultado biológico y ejerce la acción que corresponda.", escenas: ["filiacion_intro"] },
  { id: "bienes_familiares", numeral: "VI", titulo: "Bienes familiares", subt: "Arts. 141-149 CC. Declaración, efectos, desafectación.", req: "casado", acto: 2, lugar: "hogar", icono: "casaEscudo", objetivo: "Decide si proteges la vivienda familiar.", escenas: [] },
  { id: "crisis", numeral: "VII", titulo: "Crisis matrimonial", subt: "Infidelidad, VIF, simulación. Causales del art. 54 LMC.", req: "casado", acto: 3, lugar: "hotel", icono: "rayo", objetivo: "Atraviesa la crisis: cada reacción deja prueba o herida.", escenas: ["crisis_fidelidad"] },
  { id: "cese_convivencia", numeral: "VIII", titulo: "Fecha cierta del cese", subt: "Arts. 22 y 25 LMC: medios taxativos.", req: "ruptura", acto: 3, lugar: "notaria", icono: "calendario", objetivo: "Fija la fecha cierta del cese de convivencia.", escenas: ["cese_intro"] },
  { id: "acuerdo_regulador", numeral: "IX", titulo: "Acuerdo regulador", subt: "Arts. 21 y 27 LMC: completo y suficiente.", req: "ruptura", acto: 3, lugar: "despacho", icono: "pergamino", objetivo: "Redacta un acuerdo completo y suficiente.", escenas: [] },
  { id: "separacion", numeral: "X", titulo: "Separación y divorcio", subt: "Vías del art. 54-55 LMC; separación judicial 26-29.", acto: 3, lugar: "tribunal", icono: "mazo", objetivo: "Elige tu vía ante el tribunal con los antecedentes que reuniste.", escenas: [] },
  { id: "compensacion_economica", numeral: "XI", titulo: "Compensación económica", subt: "Arts. 61-66 LMC. Cálculo y modalidades.", req: "ruptura", acto: 3, lugar: "tribunal", icono: "balanza", objetivo: "Calcula y acuerda la compensación económica.", escenas: ["divorcio_compensacion"] },
  { id: "nulidad", numeral: "XII", titulo: "Nulidad y matrimonio putativo", subt: "Arts. 5-8, 17, 51 LMC.", req: "casado", acto: 3, lugar: "registro", icono: "selloRoto", objetivo: "Explora si el vínculo pudo ser nulo.", escenas: [] },
  { id: "liquidacion", numeral: "XIII", titulo: "Liquidación", subt: "Boss final patrimonial (arts. 1765-1788 CC).", req: "ruptura", acto: 4, lugar: "archivo", icono: "division", objetivo: "Liquida la sociedad fase por fase y lee tu epílogo.", escenas: [] },
  { id: "segunda_vida", numeral: "XIV", titulo: "Segunda vida", subt: "Post-divorcio. Rehacer patrimonio, segundas nupcias (arts. 124-127).", req: "post_ruptura", acto: 4, lugar: "departamento", icono: "brote", objetivo: "Decide cómo empezar de nuevo.", escenas: ["segunda_vida_intro"] },
  { id: "examen", numeral: "XV", titulo: "Modo Examen", subt: "Cédula de 20 preguntas con explicación normativa.", acto: 4, lugar: "aula", icono: "examen", objetivo: "Rinde la cédula: se aprueba con 70 % de aciertos.", escenas: [] },
];

export function contextualizarCapitulo(c: Capitulo, regimen?: Regimen): Capitulo {
  if (!regimen || regimen === "sociedad_conyugal") return c;
  const r = REGIMENES[regimen];
  if (c.id === "haber") return { ...c, titulo: r.taller, subt: r.articulo, objetivo: "Acredita la titularidad de cada bien según tu régimen." };
  if (c.id === "liquidacion") return { ...c, titulo: regimen === "separacion_total" ? "Cierre patrimonial" : "Crédito de participación", subt: r.articulo, objetivo: "Resuelve el cierre sin repartir automáticamente bienes individuales." };
  return c;
}

export function capitulo(id: string, regimen?: Regimen): Capitulo | undefined {
  const c = CAPITULOS.find((c) => c.id === id);
  return c ? contextualizarCapitulo(c, regimen) : undefined;
}

type Estado = Pick<SaveState, "personaje" | "flags" | "escenas" | "hechos" | "hijos" | "bienes" | "conyuge" | "fechaCierta" | "ce" | "finalizado">;

// ── Requisitos (lógica original de app/juego/page.tsx, sin cambios) ─────────
export function estaCasado(s: Pick<SaveState, "personaje">) {
  return s.personaje.estadoCivil === "casado" || s.personaje.estadoCivil === "casado_segundo";
}
export function hayRuptura(s: Pick<SaveState, "personaje" | "flags">) {
  return s.flags.includes("ruptura_definitiva") || ["separado_judicial", "divorciado", "nulidad"].includes(s.personaje.estadoCivil);
}
export function cumpleRequisito(req: Requisito | undefined, s: Pick<SaveState, "personaje" | "flags">): boolean {
  if (!req) return true;
  const casado = estaCasado(s);
  const ruptura = hayRuptura(s);
  // También con un vínculo anterior ocultado: el acto se celebró (con nulidad
  // latente). Sin esto, esa opción de la escena dejaba la partida sin salida.
  if (req === "consentimiento") return s.flags.includes("consentimiento_valido") || s.flags.includes("bigamia_oculta") || casado;
  if (req === "casado") return casado;
  if (req === "casada_mujer_sc") return s.personaje.sexo === "femenino" && s.personaje.regimen === "sociedad_conyugal" && casado;
  if (req === "ruptura") return ruptura || casado; // se exploran al avanzar la crisis
  if (req === "post_ruptura") return ruptura;
  return true;
}
export const TEXTO_REQUISITO: Record<Requisito, string> = {
  consentimiento: "Requiere un consentimiento válido (capítulo I).",
  casado: "Requiere estar casado (capítulo II).",
  casada_mujer_sc: "Requiere ser mujer casada en sociedad conyugal.",
  ruptura: "Requiere matrimonio vigente o ruptura.",
  post_ruptura: "Requiere ruptura definitiva, separación, divorcio o nulidad.",
};

// ── Progreso ────────────────────────────────────────────────────────────────
export type EstadoCapitulo = "bloqueado" | "disponible" | "en_curso" | "completado";
export type Progreso = { hecho: number; total: number; completo: boolean };

const contar = (hechos: SaveState["hechos"], prefijo: string) => Object.keys(hechos).filter((k) => k.startsWith(prefijo)).length;

export function progresoCapitulo(id: Mundo, s: Estado): Progreso {
  const cap = capitulo(id);
  const escenasHechas = (cap?.escenas ?? []).filter((e) => e in s.escenas).length;
  const nEsc = cap?.escenas.length ?? 0;
  const h = s.hechos;
  const p = (hecho: number, total: number, completo = hecho >= total): Progreso => ({ hecho: Math.min(hecho, total), total, completo });

  switch (id) {
    case "noviazgo": return p(escenasHechas, nEsc);
    case "matrimonio": return p(escenasHechas + (estaCasado(s) || s.personaje.regimen ? 1 : 0), nEsc + 1);
    case "haber": {
      const casos = CASOS_HABER.filter((_, i) => `haber:${i}` in h).length;
      return p(escenasHechas + casos, nEsc + CASOS_HABER.length, "haber:fin" in h);
    }
    case "patrimonios_satelite": {
      if (s.personaje.sexo !== "femenino" || s.personaje.regimen !== "sociedad_conyugal") return p(escenasHechas, nEsc);
      const casos = CASOS_SATELITE.filter((_, i) => `sat:${i}` in h).length;
      return p(escenasHechas + casos + ("opcion150" in h ? 1 : 0), nEsc + CASOS_SATELITE.length + 1);
    }
    case "deberes": return p(escenasHechas + contar(h, "deber:"), nEsc + 6);
    case "hijos": return p((s.hijos.length > 0 ? 1 : 0) + ("hijos:decision" in h ? 1 : 0), 2);
    case "filiacion_acciones": {
      const accion = contar(h, "filiacion:") > 0 || s.hijos.length === 0;
      return p(escenasHechas + (accion && escenasHechas ? 1 : 0), nEsc + 1);
    }
    case "bienes_familiares": return p("bf:decidido" in h || s.flags.includes("bien_familiar_declarado") ? 1 : 0, 1);
    case "crisis": {
      const eventos = contar(h, "crisis:");
      return p(escenasHechas + eventos, nEsc + 5, (escenasHechas >= nEsc && s.flags.includes("ruptura_definitiva")) || eventos >= 5);
    }
    case "cese_convivencia": return p(escenasHechas + (s.fechaCierta ? 1 : 0), nEsc + 1);
    case "acuerdo_regulador": return p(s.conyuge?.acuerdoRegulador?.completo ? 1 : 0, 1);
    case "separacion": return p(["divorciado", "separado_judicial", "nulidad"].includes(s.personaje.estadoCivil) ? 1 : 0, 1);
    case "compensacion_economica": return p(escenasHechas + (s.ce ? 1 : 0), nEsc + 1);
    case "nulidad": {
      const intentos = contar(h, "nulidad:");
      return p(intentos, 4, s.personaje.estadoCivil === "nulidad" || intentos >= 4);
    }
    case "liquidacion": return s.personaje.regimen && s.personaje.regimen !== "sociedad_conyugal" ? p(s.finalizado ? 3 : Number(h["cierre:fase"] ?? 0), 3, !!s.finalizado) : p(s.finalizado ? 9 : Number(h["liq:fase"] ?? 0), 9, !!s.finalizado);
    case "segunda_vida": return p(escenasHechas, nEsc);
    case "examen": {
      const avance = Array.isArray(h["examen:respuestas"]) ? (h["examen:respuestas"] as number[]).length : 0;
      return p(s.flags.includes("examen_aprobado") ? 20 : avance, 20, s.flags.includes("examen_aprobado"));
    }
    default: return p(0, 1);
  }
}

export function estadoCapitulo(c: Capitulo, s: Estado): EstadoCapitulo {
  if (!cumpleRequisito(c.req, s)) return "bloqueado";
  const pr = progresoCapitulo(c.id, s);
  if (pr.completo) return "completado";
  return pr.hecho > 0 ? "en_curso" : "disponible";
}

/** Primer capítulo disponible y no completado: el "siguiente objetivo" del mapa. */
export function siguienteCapitulo(s: Estado): Capitulo | undefined {
  return CAPITULOS.find((c) => {
    const e = estadoCapitulo(c, s);
    return e === "disponible" || e === "en_curso";
  });
}
