"use client";
import { useGame } from "@/store/useGame";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Epilogo() {
  const { epilogo, personaje, reset, iniciarSegundaVida } = useGame();
  const router = useRouter();

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
        <div className="tag mb-4">FOLIO FINAL — EPÍLOGO PATRIMONIAL · CICLO {personaje.cicloVital}</div>
        <h1 className="label-art text-4xl text-neon-blue glitch-text mb-8">{personaje.nombre || "Compareciente"}</h1>

        <div className="doc p-8 font-serif whitespace-pre-line text-base leading-relaxed">
          {epilogo || "No hay epílogo aún. Completá la liquidación para conocer tu destino."}
        </div>

        <div className="mt-10 flex gap-3 flex-wrap">
          <button className="btn" onClick={() => { iniciarSegundaVida(); router.push("/juego"); }}>
            ↻ Comenzar segunda vida (ciclo {personaje.cicloVital + 1})
          </button>
          <Link href="/examen" className="btn">📝 Modo Examen</Link>
          <Link href="/codex" className="btn">📜 Codex</Link>
          <button className="btn btn-danger" onClick={() => { reset(); router.push("/"); }}>↺ Nueva partida desde cero</button>
        </div>
      </motion.div>
    </main>
  );
}
