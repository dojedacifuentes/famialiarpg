"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/useGame";
import type { Escena } from "@/data/dialogos";
import type { Atributos } from "@/types/game";

export default function DialogoEscena({ escena, onFin }: { escena: Escena; onFin?: () => void }) {
  const [idx, setIdx] = useState(0);
  const [eligio, setEligio] = useState<number | null>(null);
  const game = useGame();

  // Reset interno cuando cambia la escena (cinturón + tirantes con el key del padre)
  useEffect(() => {
    setIdx(0);
    setEligio(null);
  }, [escena.id]);

  // Guardas defensivas
  if (!escena || !Array.isArray(escena.lineas) || escena.lineas.length === 0) {
    return (
      <div className="terminal p-6">
        <p className="text-parchment/60 italic text-sm">Escena no disponible.</p>
        <button className="btn mt-3" onClick={onFin}>▸ Continuar</button>
      </div>
    );
  }

  const safeIdx = Math.min(idx, escena.lineas.length - 1);
  const lineaActual = escena.lineas[safeIdx];
  const finLineas = safeIdx >= escena.lineas.length - 1;
  const opciones = Array.isArray(escena.opciones) ? escena.opciones : [];

  function cumpleRequisitos(op: typeof opciones[number]): { ok: boolean; razon?: string } {
    if (!op.requiere) return { ok: true };
    const { atributo, minimo, flag, sexo } = op.requiere;
    if (atributo && game.personaje.atributos[atributo] < (minimo ?? 0)) {
      return { ok: false, razon: `Atributo ${atributo} insuficiente (necesitas ${minimo}, tienes ${game.personaje.atributos[atributo]}).` };
    }
    if (flag && !game.flags.includes(flag)) {
      return { ok: false, razon: `Requiere flag previo: ${flag}.` };
    }
    if (sexo && game.personaje.sexo !== sexo) {
      return { ok: false, razon: `Opción reservada al sexo ${sexo} (tu personaje es ${game.personaje.sexo}).` };
    }
    return { ok: true };
  }

  function elegir(i: number) {
    const op = opciones[i];
    if (!op) return;
    const chequeo = cumpleRequisitos(op);
    if (!chequeo.ok) {
      game.pushLog(`Intentaste «${op.texto}». ${chequeo.razon}`, "FALLO");
      return;
    }
    if (op.efectos) {
      op.efectos.flags?.forEach((f) => game.setFlag(f));
      if (op.efectos.atributos) {
        (Object.entries(op.efectos.atributos) as [keyof Atributos, number][]).forEach(([k, v]) =>
          game.ajustarAtributo(k, v)
        );
      }
      if (op.efectos.reputacion) game.ajustarReputacion(op.efectos.reputacion);
      if (op.efectos.trauma) game.ajustarTrauma(op.efectos.trauma);
      if (op.efectos.log) game.pushLog(op.efectos.log, escena.id.toUpperCase());
    }
    setEligio(i);
  }

  return (
    <div className="terminal p-6 max-w-3xl mx-auto">
      <div className="tag mb-3">{escena.titulo}</div>
      <p className="text-parchment/60 italic text-sm mb-4">{escena.ambientacion}</p>
      {escena.articulo && (
        <div className="border-l-2 border-neon-violet pl-3 mb-4 text-xs text-neon-violet">
          ART. {escena.articulo.n} — {escena.articulo.t}
        </div>
      )}
      {escena.speaker && <div className="text-neon-cyan label-art mb-2">{escena.speaker}</div>}

      <AnimatePresence mode="wait">
        <motion.p
          key={safeIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-parchment text-base leading-relaxed min-h-[5rem]"
        >
          {lineaActual}
        </motion.p>
      </AnimatePresence>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-parchment/40">{safeIdx + 1} / {escena.lineas.length}</div>
        {!finLineas && (
          <button className="btn" onClick={() => setIdx((i) => i + 1)}>▸ Siguiente</button>
        )}
      </div>

      {finLineas && eligio === null && opciones.length > 0 && (
        <div className="mt-6 space-y-2">
          <div className="divider my-3" />
          {opciones.map((op, i) => {
            const chequeo = cumpleRequisitos(op);
            return (
              <button
                key={i}
                onClick={() => elegir(i)}
                className={`block w-full text-left p-3 border ${chequeo.ok ? "border-neon-blue/40 hover:bg-neon-blue/10" : "border-neon-red/40 text-neon-red/60"}`}
              >
                {op.texto}
                {op.requiere && (
                  <span className="ml-2 text-[10px] uppercase tracking-widest opacity-60">
                    {op.requiere.atributo && `req ${op.requiere.atributo} ${op.requiere.minimo ?? 0}`}
                    {op.requiere.sexo && ` · sexo ${op.requiere.sexo}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {finLineas && eligio === null && opciones.length === 0 && (
        <div className="mt-6">
          <div className="divider mb-3" />
          <button className="btn" onClick={onFin}>▸ Continuar</button>
        </div>
      )}

      {eligio !== null && (
        <div className="mt-6">
          <div className="divider mb-3" />
          <p className="text-neon-cyan text-sm">› {opciones[eligio]?.efectos?.log || "Decisión registrada."}</p>
          <button className="btn mt-4" onClick={onFin}>▸ Continuar</button>
        </div>
      )}
    </div>
  );
}
