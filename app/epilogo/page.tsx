"use client";
// EPÍLOGO — el acta final en papel, paginada en folios. Las acciones que
// borran o cierran el ciclo piden confirmación.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGame, useMontado } from "@/store/useGame";
import GameShell from "@/components/ui/GameShell";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";

export default function Epilogo() {
  const montado = useMontado();
  const { epilogo, personaje, reset, iniciarSegundaVida } = useGame();
  const router = useRouter();
  const [confirmar, setConfirmar] = useState<"loop" | "reset" | null>(null);

  const parrafos = (montado && epilogo ? epilogo : "No hay epílogo aún. Completá la liquidación para conocer tu destino.").split(/\n\n+/);

  return (
    <GameShell eyebrow={`Folio final — Epílogo patrimonial · Ciclo ${montado ? personaje.cicloVital : 1}`} titulo={montado ? personaje.nombre || "Compareciente" : "Epílogo"} volver={{ href: "/juego", etiqueta: "Volver al mapa" }} stats={false}>
      <div className="flex flex-col gap-2 h-full min-h-0 w-full max-w-3xl mx-auto">
        <article className="documento flex flex-col flex-1 min-h-0 p-4 sm:p-6" aria-label="Epílogo">
          <div className="flex items-center gap-2 mb-2" style={{ color: "#6b4a1c" }}>
            <Icono nombre="sello" tam={22} />
            <span className="font-display font-bold tracking-wide">Acta de cierre</span>
          </div>
          <Paginado
            items={parrafos}
            clave={(_, i) => `p${i}`}
            etiqueta="Folio"
            gap={12}
            render={(t) => <p className="t-lectura" style={{ color: "var(--papel-tinta)" }}>{t}</p>}
          />
        </article>
        {confirmar && (
          <p className="t-meta txt-rojo" role="alert">
            {confirmar === "loop"
              ? `Comenzarás el ciclo ${personaje.cicloVital + 1}: conservas bienes propios, reservados, hijos, logros y atributos. Pulsa de nuevo para confirmar.`
              : "Se borrará la partida completa. Pulsa de nuevo para confirmar."}
          </p>
        )}
        <div className="barra-accion !mt-0">
          <button
            type="button"
            className={`btn ${confirmar === "loop" ? "btn-peligro" : "btn-primario"}`}
            onClick={() => { if (confirmar !== "loop") { setConfirmar("loop"); return; } iniciarSegundaVida(); router.push("/juego"); }}
          >
            <Icono nombre="recuerdo" tam={18} /> Comenzar segunda vida (ciclo {montado ? personaje.cicloVital + 1 : 2})
          </button>
          <Link href="/examen" className="btn btn-secundario"><Icono nombre="examen" tam={18} /> Modo Examen</Link>
          <Link href="/codex" className="btn btn-secundario"><Icono nombre="codex" tam={18} /> Codex</Link>
          <button
            type="button"
            className="btn btn-peligro"
            onClick={() => { if (confirmar !== "reset") { setConfirmar("reset"); return; } reset(); router.push("/"); }}
          >
            ↺ {confirmar === "reset" ? "Confirmar: borrar partida" : "Nueva partida desde cero"}
          </button>
        </div>
      </div>
    </GameShell>
  );
}
