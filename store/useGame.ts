"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Atributos, Bien, CompensacionEconomica, Conyuge, FechaCiertaCese, Flag, HechoValor, Hijo, IncumplimientoDeber,
  Logro, Mundo, Personaje, Recompensa, SaveState,
} from "@/types/game";
import type { Escena } from "@/data/dialogos";
import { estadoInicial, migrarPartida, VERSION_PARTIDA } from "@/lib/partida";

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
  /**
   * Resuelve una escena aplicando los efectos de la opción UNA sola vez.
   * Devuelve false si la escena ya estaba resuelta (recarga, doble toque, volver).
   */
  resolverEscena: (escena: Escena, opcion: number) => boolean;
  /** Registra un hecho único. Devuelve false (y no hace nada) si ya existía. */
  registrarHecho: (clave: string, valor?: HechoValor) => boolean;
  /** Guarda un avance que sí puede cambiar (fase de liquidación, pregunta actual…). */
  fijarAvance: (clave: string, valor: HechoValor | undefined) => void;
};

export const useGame = create<Store>()(
  persist(
    (set, get) => ({
      ...estadoInicial(),
      setPersonaje: (p) => set({ personaje: p, ultimoGuardado: Date.now() }),
      setConyuge: (c) => set({ conyuge: c }),
      setMundo: (m) => set({ mundoActual: m, ultimoGuardado: Date.now() }),
      // Idempotentes por id: repetir la acción (recarga, doble toque) no duplica.
      addBien: (b) =>
        set((s) => (s.bienes.some((x) => x.id === b.id) ? s : { bienes: [...s.bienes, { ...b, cicloVital: s.personaje.cicloVital }] })),
      updateBien: (id, patch) =>
        set((s) => ({ bienes: s.bienes.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      addHijo: (h) => set((s) => (s.hijos.some((x) => x.id === h.id) ? s : { hijos: [...s.hijos, h] })),
      updateHijo: (id, patch) =>
        set((s) => ({ hijos: s.hijos.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
      addRecompensa: (r) => set((s) => (s.recompensas.some((x) => x.id === r.id) ? s : { recompensas: [...s.recompensas, r] })),
      addIncumplimiento: (i) =>
        set((s) => (s.incumplimientos.some((x) => x.id === i.id) ? s : { incumplimientos: [...s.incumplimientos, i] })),
      setFechaCierta: (f) => set({ fechaCierta: f }),
      setCE: (ce) => set({ ce }),
      desbloquearLogro: (l) =>
        set((s) =>
          s.logros.find((x) => x.id === l.id) ? s : { logros: [...s.logros, { ...l, desbloqueado: true, fecha: Date.now() }] }
        ),
      setFlag: (f) => set((s) => (s.flags.includes(f) ? s : { flags: [...s.flags, f] })),
      hasFlag: (f) => get().flags.includes(f),
      pushLog: (texto, tag) =>
        set((s) => ({ log: [{ t: Date.now(), texto, tag }, ...s.log].slice(0, 300), ultimoGuardado: Date.now() })),
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
          ...estadoInicial(),
          finalizado: false,
          epilogo: undefined,
          conyuge: undefined,
          fechaCierta: undefined,
          ce: undefined,
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
          // Conservamos flags estructurales (e.g. logros), pero limpiamos los del matrimonio.
          // El inventario solemne del art. 124 se decide en la escena de segunda vida
          // y debe llegar al nuevo matrimonio: antes se borraba al empezar el ciclo.
          flags: s.flags.filter((f) =>
            f.startsWith("logro_") || f.startsWith("hijo_") || f === "examen_aprobado" ||
            f === "inventario_124_hecho" || f === "sancion_124"
          ),
          // Escenas y hechos son por ciclo vital: la nueva vida se vuelve a jugar.
          escenas: {},
          hechos: {},
          mundoActual: "noviazgo",
          finalizado: false,
          epilogo: undefined,
        })),
      resolverEscena: (escena, opcion) => {
        const s = get();
        if (escena.id in s.escenas) return false;
        const op = escena.opciones?.[opcion];
        const ef = op?.efectos;
        set((st) => {
          const flags = ef?.flags ? Array.from(new Set([...st.flags, ...ef.flags])) : st.flags;
          const atributos = { ...st.personaje.atributos };
          if (ef?.atributos) {
            (Object.entries(ef.atributos) as [keyof Atributos, number][]).forEach(([k, v]) => {
              atributos[k] = Math.max(0, Math.min(10, atributos[k] + v));
            });
          }
          const personaje = {
            ...st.personaje,
            atributos,
            reputacion: Math.max(-100, Math.min(100, st.personaje.reputacion + (ef?.reputacion ?? 0))),
            trauma: Math.max(0, Math.min(100, st.personaje.trauma + (ef?.trauma ?? 0))),
          };
          const log = ef?.log ? [{ t: Date.now(), texto: ef.log, tag: escena.id.toUpperCase() }, ...st.log].slice(0, 300) : st.log;
          return { flags, personaje, log, escenas: { ...st.escenas, [escena.id]: op ? opcion : -1 }, ultimoGuardado: Date.now() };
        });
        return true;
      },
      registrarHecho: (clave, valor = true) => {
        if (clave in get().hechos) return false;
        set((s) => ({ hechos: { ...s.hechos, [clave]: valor }, ultimoGuardado: Date.now() }));
        return true;
      },
      fijarAvance: (clave, valor) =>
        set((s) => {
          const hechos = { ...s.hechos };
          if (valor === undefined) delete hechos[clave];
          else hechos[clave] = valor;
          return { hechos, ultimoGuardado: Date.now() };
        }),
    }),
    {
      name: "derecho-familia-rpg-save",
      version: VERSION_PARTIDA,
      // Antes: cualquier cambio de versión descartaba la partida. Ahora se migra.
      migrate: (persistido, version) => migrarPartida(persistido, version) as unknown as Store,
      // Garantiza la forma v4 incluso si el guardado tiene la versión correcta
      // pero le faltan campos (edición manual, guardado a medias).
      merge: (persistido, actual) => ({ ...actual, ...migrarPartida(persistido) }),
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as unknown as Storage)
      ),
    }
  )
);

/**
 * true tras el primer montaje en el cliente. El guardado local se carga de forma
 * síncrona al crear el store, pero el HTML del servidor se genera sin él: hasta
 * montar, las pantallas muestran un estado neutro para no romper la hidratación
 * ni redirigir antes de tiempo.
 */
export function useMontado(): boolean {
  const [listo, setListo] = useState(false);
  useEffect(() => setListo(true), []);
  return listo;
}
