import type { StateStorage } from "zustand/middleware";

/** Conserva el original ANTES de la primera migración; privado y local al dispositivo. */
export const almacenamientoSeguro: StateStorage = {
  getItem(name) {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(name);
      if (raw && name === "derecho-familia-rpg-save") {
        try {
          const save = JSON.parse(raw);
          if ((save.version ?? 0) < 5 && !window.localStorage.getItem(`${name}-backup-v4`)) window.localStorage.setItem(`${name}-backup-v4`, raw);
        } catch { /* Un backup fallido no elimina el guardado existente. */ }
      }
      return raw;
    } catch { return null; }
  },
  setItem(name, value) {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(name, value); }
    catch { window.dispatchEvent(new Event("eva-storage-error")); }
  },
  removeItem(name) { if (typeof window !== "undefined") { try { window.localStorage.removeItem(name); } catch { /* Modo privado. */ } } },
};
