"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { almacenamientoSeguro } from "@/lib/almacenamiento";

type Preferencias = { lectura: "instantanea" | "rapida" | "animada"; movimiento: boolean; setLectura: (v: Preferencias["lectura"]) => void; setMovimiento: (v: boolean) => void };
export const usePreferencias = create<Preferencias>()(persist((set) => ({ lectura: "rapida", movimiento: true, setLectura: (lectura) => set({ lectura }), setMovimiento: (movimiento) => set({ movimiento }) }), { name: "eva-arcade-preferencias", storage: createJSONStorage(() => almacenamientoSeguro) }));
