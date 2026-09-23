"use client";
// Panel acotado para consultar detalles sin salir de la escena. Se cierra con
// Escape, con el botón o tocando fuera; el foco vuelve a quien lo abrió.
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icono from "./Icono";

export default function Hoja({
  abierta,
  onCerrar,
  titulo,
  children,
  pie,
}: {
  abierta: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
  pie?: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const origen = useRef<Element | null>(null);

  useEffect(() => {
    if (!abierta) return;
    origen.current = document.activeElement;
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("button, [href], input")?.focus(), 30);
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onCerrar(); }
      if (e.key === "Tab" && panel.current) {
        const f = Array.from(panel.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"));
        if (f.length === 0) return;
        const primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    };
    window.addEventListener("keydown", tecla, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", tecla, true);
      (origen.current as HTMLElement | null)?.focus?.();
    };
  }, [abierta, onCerrar]);

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          className="hoja-velo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            className="hoja panel panel-alto marco"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-3 mb-3">
              <h2 className="t-titulo txt-oro flex-1">{titulo}</h2>
              <button type="button" className="btn btn-secundario btn-icono" onClick={onCerrar} aria-label="Cerrar">
                <Icono nombre="cerrar" tam={20} />
              </button>
            </div>
            <div className="hoja-cuerpo" tabIndex={0}>{children}</div>
            {pie && <div className="barra-accion">{pie}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
