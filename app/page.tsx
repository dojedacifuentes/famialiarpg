"use client";
// PORTADA — cabe entera en la pantalla. La descripción larga, las leyes y las
// novedades se consultan en la hoja "Acerca del juego" (no se recortan).
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame, useMontado } from "@/store/useGame";
import MarcaEva from "@/components/eva/MarcaEva";
import GuiaEva from "@/components/eva/GuiaEva";
import Hoja from "@/components/ui/Hoja";
import Icono from "@/components/ui/Icono";

export default function Home() {
  const montado = useMontado();
  const personaje = useGame((s) => s.personaje);
  const finalizado = useGame((s) => s.finalizado);
  const [acerca, setAcerca] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("bloqueo");
    return () => document.documentElement.classList.remove("bloqueo");
  }, []);

  const hayPartida = montado && !!personaje.nombre;

  return (
    <main className="portada eva-home">
      <div className="portada-fondo" aria-hidden>
      </div>
      <motion.div className="portada-contenido" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <MarcaEva />
        <div className="eva-kicker">Un universo de decisiones</div>
        <h1 className="t-display text-center txt-1">
          Expediente 1725
        </h1>
        <p className="eva-subtitle">
          El amor cambia. El expediente queda.<br/>Decide, descubre las consecuencias y aprende Derecho de Familia.
        </p>
        <nav className="grid gap-2 w-full max-w-sm mx-auto" aria-label="Menú principal">
          {!montado ? (
            <span className="btn btn-secundario" aria-busy="true">Cargando expediente…</span>
          ) : (
            <>
              <Link href="/rapida" className={`btn ${hayPartida ? "btn-secundario" : "btn-primario"}`}>Partida rápida · ~3 min <Icono nombre="flechaDer" tam={18}/></Link>
              {hayPartida && !finalizado && (
                <Link href="/juego" className="btn btn-primario">
                  <Icono nombre="mapa" tam={18} /> Continuar · {personaje.nombre} · ciclo {personaje.cicloVital}
                </Link>
              )}
              {hayPartida && finalizado && (
                <Link href="/epilogo" className="btn btn-primario"><Icono nombre="pergamino" tam={18} /> Leer epílogo</Link>
              )}
              <Link href="/creacion" className="btn btn-secundario">
                <Icono nombre="pluma" tam={18} /> Nueva campaña
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/codex" className="btn btn-secundario"><Icono nombre="codex" tam={18} /> Códex</Link>
                <Link href="/examen" className="btn btn-secundario"><Icono nombre="examen" tam={18} /> Modo Examen</Link>
              </div>
              <button type="button" className="btn btn-fantasma" onClick={() => setAcerca(true)}>
                <Icono nombre="info" tam={18} /> Acerca del juego
              </button>
            </>
          )}
        </nav>
        <div className="flex justify-center"><GuiaEva /></div>
        <footer className="eva-footer"><a href="https://evaproyecto01.vercel.app/" target="_blank" rel="noopener noreferrer">Universo EVA ↗</a><a href="https://www.instagram.com/eva.proyecto01/" target="_blank" rel="noopener noreferrer">Instagram ↗</a></footer>
      </motion.div>

      <Hoja abierta={acerca} onCerrar={() => setAcerca(false)} titulo="Acerca del juego">
        <div className="space-y-3 t-base txt-1">
          <p>
            Creá un personaje (hombre o mujer — define tu acceso al art. 150 CC). Casate. Clasificá tu haber. Cumplí (o incumplí) los deberes del art. 131. Acreditá la fecha cierta del cese (art. 22 LMC). Pedí compensación económica (art. 62). Liquidá. Rehacé tu vida. Aprobá la cédula.
          </p>
          <p className="txt-violeta">
            Basado en el Código Civil, la Ley 19.947 (LMC), 19.968 (LTF), 19.585 (filiación), 14.908 (alimentos), 21.389 (RNDPA), 20.066 (VIF), 21.400 (matrimonio igualitario).
          </p>
          <ul className="space-y-2">
            <li className="tarjeta"><b className="flex items-center gap-2 txt-oro"><Icono nombre="balanza" tam={18} /> 15 mundos jugables</b>Desde noviazgo hasta segunda vida post-divorcio. Cada uno con escenas + paneles + artículos.</li>
            <li className="tarjeta"><b className="flex items-center gap-2 txt-oro"><Icono nombre="inmueble" tam={18} /> Clasificación rigurosa</b>23 casos en el haber, 4 en patrimonios satélite. Cada error tiene su justificación normativa.</li>
            <li className="tarjeta"><b className="flex items-center gap-2 txt-oro"><Icono nombre="recuerdo" tam={18} /> Loop existencial</b>El divorcio no termina la partida. Conservás bienes propios, podés rehacer tu vida y casarte de nuevo (con inventario solemne, art. 124).</li>
          </ul>
          <p className="t-meta txt-3">
            v2.0 — build pedagógico para examen de grado · arts. 102, 131, 135, 150, 1725, 1749, 22 LMC, 54 LMC, 55 LMC, 61 LMC.
          </p>
          <p className="t-meta txt-3">
            El juego es una simplificación didáctica. No reemplaza el estudio del Código Civil, la LMC, la jurisprudencia y la doctrina.
          </p>
        </div>
      </Hoja>
    </main>
  );
}
