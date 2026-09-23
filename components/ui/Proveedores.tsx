"use client";
import { MotionConfig } from "framer-motion";

/** Las animaciones respetan prefers-reduced-motion en todo el juego. */
export default function Proveedores({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="fondo-noche" aria-hidden />
      {children}
    </MotionConfig>
  );
}
