// ============================================================================
// PARTIDA — estado inicial y migración segura del guardado (lógica pura).
// ----------------------------------------------------------------------------
// v3 → v4 añade `escenas` y `hechos`, que hacen idempotentes las recompensas.
// Antes, cualquier cambio de versión DESCARTABA la partida entera; ahora se
// conserva todo y se deducen, a partir de los flags y bienes existentes, las
// escenas y casos que el jugador ya resolvió, para no volver a premiarlos.
// ============================================================================
import type { Bien, Personaje, SaveState } from "@/types/game";
import { clasificarBien } from "@/lib/reglas";
import { CASOS_HABER, CASOS_SATELITE } from "@/data/casos";

export const VERSION_PARTIDA = 4;

export const PERSONAJE_INICIAL: Personaje = {
  nombre: "",
  sexo: "femenino",
  origen: "clase_media",
  profesion: "abogado",
  nivelEconomico: 50,
  atributos: {
    persuasion: 5, honestidad: 5, impulsividad: 5,
    inteligencia_juridica: 5, empatia: 5, resistencia_emocional: 5,
  },
  reputacion: 0,
  trauma: 0,
  estadoCivil: "soltero",
  cicloVital: 1,
};

export function estadoInicial(ahora = Date.now()): SaveState {
  return {
    version: VERSION_PARTIDA,
    creado: ahora,
    ultimoGuardado: ahora,
    personaje: { ...PERSONAJE_INICIAL, atributos: { ...PERSONAJE_INICIAL.atributos } },
    hijos: [],
    bienes: [],
    recompensas: [],
    incumplimientos: [],
    flags: [],
    mundoActual: "noviazgo",
    log: [],
    logros: [],
    escenas: {},
    hechos: {},
  };
}

/** Flags que dejan las opciones de cada escena: permiten saber qué escenas ya se jugaron. */
const FLAGS_DE_ESCENA: Record<string, string[]> = {
  inicio_noviazgo: ["registro_esponsales", "intento_corromper"],
  impedimentos: ["sin_impedimentos", "pena_pecuniaria_124"],
  consentimiento: ["consentimiento_valido", "bigamia_oculta"],
  capitulaciones_previas: ["pacto_art167"],
  eleccion_regimen: ["regimen_sc", "regimen_st", "regimen_pg"],
  art150_explica: ["consciente_150"],
  filiacion_intro: ["prueba_199_compelida"],
  crisis_fidelidad: ["prueba_infidelidad"],
  cese_intro: ["cese_22a", "cese_22b", "cese_25"],
  divorcio_compensacion: ["ce_acordada", "ce_litigada"],
  segunda_vida_intro: ["inventario_124_hecho", "sancion_124"],
};

export function escenasDesdeFlags(flags: string[]): Record<string, number> {
  const res: Record<string, number> = {};
  for (const [escena, fs] of Object.entries(FLAGS_DE_ESCENA)) {
    // Se registra como resuelta; la opción concreta no se puede deducir con
    // certeza, así que se guarda la del primer flag que coincida.
    const i = fs.findIndex((f) => flags.includes(f));
    if (i >= 0) res[escena] = i;
  }
  return res;
}

function esObjeto(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function arreglo<T>(x: unknown): T[] {
  return Array.isArray(x) ? (x as T[]) : [];
}

/**
 * Convierte cualquier guardado anterior (o corrupto) en un estado v4 válido,
 * conservando todo lo que se pueda.
 */
export function migrarPartida(persistido: unknown, _version?: number): SaveState {
  const base = estadoInicial();
  if (!esObjeto(persistido)) return base;
  const p = persistido as Partial<SaveState> & Record<string, unknown>;

  const pj = esObjeto(p.personaje) ? (p.personaje as Partial<Personaje>) : {};
  const personaje: Personaje = {
    ...base.personaje,
    ...pj,
    atributos: { ...base.personaje.atributos, ...(esObjeto(pj.atributos) ? pj.atributos : {}) },
    cicloVital: typeof pj.cicloVital === "number" && pj.cicloVital > 0 ? pj.cicloVital : 1,
  };

  // v3 marcaba el bien familiar cambiando su clase a "familiar", con lo que
  // salía del haber social. La afectación no muda el dominio (art. 141 ss.):
  // se recupera la clase original y se conserva la declaración.
  const bienes: Bien[] = arreglo<Bien>(p.bienes).map((b) => {
    if (b?.clase !== "familiar") return b;
    const { clase: _c, ...resto } = b;
    const original = clasificarBien(resto, personaje.sexo).clase;
    return { ...b, clase: original, declaradoBienFamiliar: true };
  });

  const flags = arreglo<string>(p.flags).filter((f) => typeof f === "string");
  const escenas = esObjeto(p.escenas) ? (p.escenas as Record<string, number>) : escenasDesdeFlags(flags);

  let hechos = esObjeto(p.hechos) ? (p.hechos as SaveState["hechos"]) : undefined;
  if (!hechos) {
    hechos = {};
    const nombres = new Set(bienes.map((b) => b?.nombre));
    CASOS_HABER.forEach((c, i) => { if (nombres.has(c.nombre)) hechos![`haber:${i}`] = "ok"; });
    CASOS_SATELITE.forEach((c, i) => { if (nombres.has(c.nombre)) hechos![`sat:${i}`] = "ok"; });
  }

  return {
    ...base,
    ...p,
    version: VERSION_PARTIDA,
    creado: typeof p.creado === "number" ? p.creado : base.creado,
    ultimoGuardado: typeof p.ultimoGuardado === "number" ? p.ultimoGuardado : base.ultimoGuardado,
    personaje,
    hijos: arreglo(p.hijos),
    bienes,
    recompensas: arreglo(p.recompensas),
    incumplimientos: arreglo(p.incumplimientos),
    flags,
    log: arreglo(p.log),
    logros: arreglo(p.logros),
    mundoActual: (typeof p.mundoActual === "string" ? p.mundoActual : base.mundoActual) as SaveState["mundoActual"],
    escenas,
    hechos,
  };
}
