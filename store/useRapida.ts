"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Regimen } from "@/types/game";
import { almacenamientoSeguro } from "@/lib/almacenamiento";
type Rapida = { regimen: Regimen | null; respuestas: number[]; paso: number; iniciar: (regimen: Regimen) => void; responder: (opcion: number) => void; continuar: () => void; menu: () => void };
export const useRapida = create<Rapida>()(persist((set, get) => ({
  regimen: null, respuestas: [], paso: 0,
  iniciar: (regimen) => set({ regimen, respuestas: [], paso: 0 }),
  responder: (opcion) => { const s = get(); if (!s.regimen || s.paso >= 3 || s.respuestas.length !== s.paso || !Number.isInteger(opcion) || opcion < 0 || opcion > 2) return; set({ respuestas: [...s.respuestas, opcion] }); },
  continuar: () => { const s = get(); if (s.respuestas.length > s.paso) set({ paso: Math.min(3, s.paso + 1) }); },
  menu: () => set({ regimen: null, respuestas: [], paso: 0 }),
}), { name: "eva-arcade-rapida-v1", storage: createJSONStorage(() => almacenamientoSeguro) }));
