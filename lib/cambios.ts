"use client";
import { useGame } from "@/store/useGame";
import { diferencias, foto, type Delta } from "./deltas";

/** Ejecuta una acción sobre el store y devuelve qué cambió, para mostrarlo. */
export function conCambios(accion: () => void): Delta[] {
  const antes = foto(useGame.getState());
  accion();
  return diferencias(antes, foto(useGame.getState()));
}
