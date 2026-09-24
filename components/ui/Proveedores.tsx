"use client";
import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { usePreferencias } from "@/store/usePreferencias";

/** Las animaciones respetan prefers-reduced-motion en todo el juego. */
export default function Proveedores({ children }: { children: React.ReactNode }) {
  const movimiento = usePreferencias((s) => s.movimiento);
  const [errorGuardado, setErrorGuardado] = useState(false);
  useEffect(() => { document.documentElement.dataset.movimiento = movimiento ? "si" : "no"; }, [movimiento]);
  useEffect(() => { const avisar = () => setErrorGuardado(true); window.addEventListener("eva-storage-error", avisar); return () => window.removeEventListener("eva-storage-error", avisar); }, []);
  return (
    <MotionConfig reducedMotion={movimiento ? "user" : "always"}>
      <div className="fondo-noche" aria-hidden />
      {errorGuardado && <div className="eva-storage-aviso" role="alert">No se pudo guardar en este dispositivo. No cierres la partida hasta liberar espacio o habilitar almacenamiento.<button className="btn btn-secundario" onClick={() => setErrorGuardado(false)}>Entendido</button></div>}
      {children}
    </MotionConfig>
  );
}
