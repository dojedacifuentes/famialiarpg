"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame } from "@/store/useGame";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const personaje = useGame((s) => s.personaje);
  const finalizado = useGame((s) => s.finalizado);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <main className="min-h-screen flex items-center justify-center text-neon-blue label-art">CARGANDO EXPEDIENTE…</main>;
  }

  const hayPartida = !!personaje.nombre;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 [background-image:linear-gradient(rgba(0,229,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,.18)_1px,transparent_1px)] [background-size:32px_32px]" />
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="text-center max-w-4xl">
        <div className="tag mb-6">EXPEDIENTE N° 1725-2026 / FORO INTERIOR</div>
        <h1 className="label-art text-5xl md:text-7xl text-neon-blue glitch-text mb-4">DERECHO DE FAMILIA</h1>
        <h2 className="font-serif italic text-parchment/80 text-xl md:text-2xl mb-8">
          Un RPG narrativo sobre matrimonio, patrimonio, deberes y reconstrucción.
        </h2>
        <p className="text-parchment/60 max-w-2xl mx-auto mb-10 text-sm leading-relaxed">
          Creá un personaje (hombre o mujer — define tu acceso al art. 150 CC). Casate. Clasificá tu haber. Cumplí (o incumplí) los deberes del art. 131. Acreditá la fecha cierta del cese (art. 22 LMC). Pedí compensación económica (art. 62). Liquidá. Rehacé tu vida. Aprobá la cédula.
          <br />
          <span className="text-neon-violet">Basado en el Código Civil, la Ley 19.947 (LMC), 19.968 (LTF), 19.585 (filiación), 14.908 (alimentos), 21.389 (RNDPA), 20.066 (VIF), 21.400 (matrimonio igualitario).</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/creacion" className="btn">▶ Nueva partida</Link>
          {hayPartida && !finalizado && <Link href="/juego" className="btn">▶ Continuar expediente · ciclo {personaje.cicloVital}</Link>}
          {hayPartida && finalizado && <Link href="/epilogo" className="btn">📜 Leer epílogo</Link>}
          <Link href="/codex" className="btn">📜 Codex</Link>
          <Link href="/examen" className="btn">📝 Modo Examen</Link>
        </div>
        <div className="divider my-12" />
        <div className="grid md:grid-cols-3 gap-4 text-left text-xs text-parchment/60">
          <Feature icon="⚖️" t="15 mundos jugables" d="Desde noviazgo hasta segunda vida post-divorcio. Cada uno con escenas + paneles + artículos." />
          <Feature icon="🏠" t="Clasificación rigurosa" d="18 casos en el haber, 4 en patrimonios satélite. Cada error tiene su justificación normativa." />
          <Feature icon="🔄" t="Loop existencial" d="El divorcio no termina la partida. Conservás bienes propios, podés rehacer tu vida y casarte de nuevo (con inventario solemne, art. 124)." />
        </div>
      </motion.div>
      <footer className="absolute bottom-3 text-[10px] uppercase tracking-widest text-parchment/30">
        v2.0 — build pedagógico para examen de grado · arts. 102, 131, 135, 150, 1725, 1749, 22 LMC, 54 LMC, 55 LMC, 61 LMC.
      </footer>
    </main>
  );
}

function Feature({ icon, t, d }: { icon: string; t: string; d: string }) {
  return (
    <div className="terminal p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="label-art text-neon-blue text-sm mb-1">{t}</div>
      <div className="text-parchment/60">{d}</div>
    </div>
  );
}
