"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Bien, CompensacionEconomica, Conyuge, FechaCiertaCese, Flag, Hijo, IncumplimientoDeber,
  Logro, Mundo, Personaje, Recompensa, SaveState,
} from "@/types/game";

type Store = SaveState & {
  setPersonaje: (p: Personaje) => void;
  setConyuge: (c: Conyuge | undefined) => void;
  setMundo: (m: Mundo) => void;
  addBien: (b: Bien) => void;
  updateBien: (id: string, patch: Partial<Bien>) => void;
  addHijo: (h: Hijo) => void;
  updateHijo: (id: string, patch: Partial<Hijo>) => void;
  addRecompensa: (r: Recompensa) => void;
  addIncumplimiento: (i: IncumplimientoDeber) => void;
  setFechaCierta: (f: FechaCiertaCese) => void;
  setCE: (ce: CompensacionEconomica) => void;
  desbloquearLogro: (l: Logro) => void;
  setFlag: (f: Flag) => void;
  hasFlag: (f: Flag) => boolean;
  pushLog: (texto: string, tag?: string) => void;
  ajustarAtributo: (k: keyof Personaje["atributos"], delta: number) => void;
  ajustarReputacion: (delta: number) => void;
  ajustarTrauma: (delta: number) => void;
  reset: () => void;
  finalizar: (texto: string) => void;
  iniciarSegundaVida: () => void; // post-divorcio loop: limpia cónyuge y deberes pero conserva personaje, bienes propios, hijos, logros
};

const INIT: SaveState = {
  version: 3,
  creado: Date.now(),
  ultimoGuardado: Date.now(),
  personaje: {
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
  },
  hijos: [],
  bienes: [],
  recompensas: [],
  incumplimientos: [],
  flags: [],
  mundoActual: "noviazgo",
  log: [],
  logros: [],
};

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      ...INIT,
      setPersonaje: (p) => set({ personaje: p, ultimoGuardado: Date.now() }),
      setConyuge: (c) => set({ conyuge: c }),
      setMundo: (m) => set({ mundoActual: m, ultimoGuardado: Date.now() }),
      addBien: (b) =>
        set((s) => ({ bienes: [...s.bienes, { ...b, cicloVital: s.personaje.cicloVital }] })),
      updateBien: (id, patch) =>
        set((s) => ({ bienes: s.bienes.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      addHijo: (h) => set((s) => ({ hijos: [...s.hijos, h] })),
      updateHijo: (id, patch) =>
        set((s) => ({ hijos: s.hijos.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
      addRecompensa: (r) => set((s) => ({ recompensas: [...s.recompensas, r] })),
      addIncumplimiento: (i) => set((s) => ({ incumplimientos: [...s.incumplimientos, i] })),
      setFechaCierta: (f) => set({ fechaCierta: f }),
      setCE: (ce) => set({ ce }),
      desbloquearLogro: (l) =>
        set((s) =>
          s.logros.find((x) => x.id === l.id) ? s : { logros: [...s.logros, { ...l, desbloqueado: true, fecha: Date.now() }] }
        ),
      setFlag: (f) => set((s) => (s.flags.includes(f) ? s : { flags: [...s.flags, f] })),
      hasFlag: (f) => get().flags.includes(f),
      pushLog: (texto, tag) =>
        set((s) => ({ log: [{ t: Date.now(), texto, tag }, ...s.log].slice(0, 300) })),
      ajustarAtributo: (k, delta) =>
        set((s) => ({
          personaje: {
            ...s.personaje,
            atributos: {
              ...s.personaje.atributos,
              [k]: Math.max(0, Math.min(10, s.personaje.atributos[k] + delta)),
            },
          },
        })),
      ajustarReputacion: (delta) =>
        set((s) => ({ personaje: { ...s.personaje, reputacion: Math.max(-100, Math.min(100, s.personaje.reputacion + delta)) } })),
      ajustarTrauma: (delta) =>
        set((s) => ({ personaje: { ...s.personaje, trauma: Math.max(0, Math.min(100, s.personaje.trauma + delta)) } })),
      finalizar: (texto) => set({ finalizado: true, epilogo: texto }),
      reset: () =>
        set({
          ...INIT,
          creado: Date.now(),
          finalizado: false,
          epilogo: undefined,
        }),
      iniciarSegundaVida: () =>
        set((s) => ({
          // Conserva: personaje (atributos, trauma), bienes PROPIOS y reservados, hijos, logros, log.
          // Limpia: cónyuge, recompensas, incumplimientos, fecha cierta, ce, flags transientes, mundoActual.
          personaje: {
            ...s.personaje,
            estadoCivil: "soltero",
            regimen: undefined,
            fechaMatrimonio: undefined,
            cicloVital: s.personaje.cicloVital + 1,
          },
          conyuge: undefined,
          bienes: s.bienes.filter((b) =>
            b.clase === "propio_marido" ||
            b.clase === "propio_mujer" ||
            b.clase === "reservado_art150" ||
            b.clase === "satelite_art166" ||
            b.clase === "satelite_art167"
          ),
          recompensas: [],
          incumplimientos: [],
          fechaCierta: undefined,
          ce: undefined,
          // Conservamos flags estructurales (e.g. logros), pero limpiamos los del matrimonio:
          flags: s.flags.filter((f) =>
            f.startsWith("logro_") || f.startsWith("hijo_") || f === "examen_aprobado"
          ),
          mundoActual: "noviazgo",
          finalizado: false,
          epilogo: undefined,
        })),
    }),
    {
      name: "derecho-familia-rpg-save",
      version: 3,
      migrate: () => ({ ...INIT, creado: Date.now() }) as any,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as any)
      ),
    }
  )
);
