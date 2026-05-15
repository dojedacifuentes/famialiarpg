"use client";
import { useParams, useRouter } from "next/navigation";
import { ESCENAS } from "@/data/dialogos";
import DialogoEscena from "@/components/DialogoEscena";
import { useGame } from "@/store/useGame";
import Link from "next/link";
import type { Mundo } from "@/types/game";
import ClasificadorBienes from "@/components/ClasificadorBienes";
import HijosPanel from "@/components/HijosPanel";
import CrisisPanel from "@/components/CrisisPanel";
import SeparacionPanel from "@/components/SeparacionPanel";
import NulidadPanel from "@/components/NulidadPanel";
import MatrimonioPanel from "@/components/MatrimonioPanel";
import PatrimonioSatelitePanel from "@/components/PatrimonioSatelitePanel";
import DeberesPanel from "@/components/DeberesPanel";
import FiliacionAccionesPanel from "@/components/FiliacionAccionesPanel";
import BienesFamiliaresPanel from "@/components/BienesFamiliaresPanel";
import FechaCiertaPanel from "@/components/FechaCiertaPanel";
import AcuerdoReguladorPanel from "@/components/AcuerdoReguladorPanel";
import CompensacionEconomicaPanel from "@/components/CompensacionEconomicaPanel";
import { useState } from "react";

export default function MundoPage() {
  const { id } = useParams<{ id: string }>();
  const mundo = id as Mundo;
  const router = useRouter();
  const game = useGame();
  const [escenaIdx, setEscenaIdx] = useState(0);

  const escenasMundo: Record<Mundo, string[]> = {
    noviazgo: ["inicio_noviazgo", "impedimentos", "consentimiento"],
    matrimonio: ["capitulaciones_previas", "eleccion_regimen"],
    haber: ["haber_intro"],
    patrimonios_satelite: ["art150_explica"],
    deberes: ["deberes_intro"],
    hijos: [],
    filiacion_acciones: ["filiacion_intro"],
    bienes_familiares: [],
    crisis: ["crisis_fidelidad"],
    cese_convivencia: ["cese_intro"],
    acuerdo_regulador: [],
    separacion: [],
    nulidad: [],
    compensacion_economica: ["divorcio_compensacion"],
    liquidacion: [],
    segunda_vida: ["segunda_vida_intro"],
    examen: [],
    sucesion: [],
  };

  const lista = escenasMundo[mundo] || [];
  const todasLasEscenasVistas = escenaIdx >= lista.length;

  return (
    <main className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <Link href="/juego" className="btn">◂ Volver al mapa</Link>
        <div className="tag">{mundo.toUpperCase()}</div>
      </header>

      {!todasLasEscenasVistas && lista[escenaIdx] && ESCENAS[lista[escenaIdx]] && (
        <DialogoEscena
          key={lista[escenaIdx]}
          escena={ESCENAS[lista[escenaIdx]]}
          onFin={() => setEscenaIdx((i) => i + 1)}
        />
      )}

      {todasLasEscenasVistas && (
        <div className="space-y-6">
          {mundo === "noviazgo" && <Resumen titulo="Cruzaste el umbral precontractual." cta="Avanzar al matrimonio" onAdvance={() => router.push("/mundo/matrimonio")} />}
          {mundo === "matrimonio" && <MatrimonioPanel />}
          {mundo === "haber" && <ClasificadorBienes />}
          {mundo === "patrimonios_satelite" && <PatrimonioSatelitePanel />}
          {mundo === "deberes" && <DeberesPanel />}
          {mundo === "hijos" && <HijosPanel />}
          {mundo === "filiacion_acciones" && <FiliacionAccionesPanel />}
          {mundo === "bienes_familiares" && <BienesFamiliaresPanel />}
          {mundo === "crisis" && <CrisisPanel />}
          {mundo === "cese_convivencia" && <FechaCiertaPanel />}
          {mundo === "acuerdo_regulador" && <AcuerdoReguladorPanel />}
          {mundo === "separacion" && <SeparacionPanel />}
          {mundo === "compensacion_economica" && <CompensacionEconomicaPanel />}
          {mundo === "nulidad" && <NulidadPanel />}
          {mundo === "segunda_vida" && (
            <Resumen titulo="Segunda vida iniciada. Tu inventario propio te acompaña." cta="Rehacer tu vida"
              onAdvance={() => { game.iniciarSegundaVida(); router.push("/juego"); }} />
          )}
          {mundo === "liquidacion" && (
            <Resumen titulo="El expediente está listo para liquidación." cta="Iniciar liquidación"
              onAdvance={() => router.push("/liquidacion")} />
          )}
          {mundo === "examen" && (
            <Resumen titulo="Modo examen: cédula final." cta="Comenzar examen"
              onAdvance={() => router.push("/examen")} />
          )}
        </div>
      )}
    </main>
  );
}

function Resumen({ titulo, cta, onAdvance }: { titulo: string; cta: string; onAdvance: () => void }) {
  return (
    <div className="terminal p-6">
      <h2 className="label-art text-neon-blue text-xl mb-3">{titulo}</h2>
      <p className="text-parchment/60 text-sm mb-4">La narrativa continúa. Cada acción se inscribe en el folio interior.</p>
      <button className="btn" onClick={onAdvance}>▸ {cta}</button>
    </div>
  );
}
