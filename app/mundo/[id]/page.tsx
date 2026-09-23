"use client";
// ============================================================================
// CAPÍTULO — escenas pendientes → actividad del capítulo → cierre.
// Las escenas ya resueltas no se repiten (ni sus efectos); se pueden revivir
// en "modo recuerdo" desde la bitácora para explorar otras decisiones.
// ============================================================================
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ESCENAS } from "@/data/dialogos";
import DialogoEscena from "@/components/DialogoEscena";
import { useGame, useMontado } from "@/store/useGame";
import type { Mundo } from "@/types/game";
import { capitulo, cumpleRequisito, progresoCapitulo, siguienteCapitulo, TEXTO_REQUISITO } from "@/data/capitulos";
import { NOMBRE_LUGAR } from "@/data/escenario";
import GameShell from "@/components/ui/GameShell";
import Hoja from "@/components/ui/Hoja";
import Icono from "@/components/ui/Icono";
import Escenario from "@/components/arte/Escenario";
import { Progreso } from "@/components/ui/Actividad";
import { Paginado } from "@/components/ui/Ajuste";
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

type Vista = { tipo: "escena"; id: string } | { tipo: "recuerdo"; id: string; volver: Vista } | { tipo: "actividad" };

const PANELES: Partial<Record<Mundo, () => JSX.Element>> = {
  matrimonio: MatrimonioPanel,
  haber: ClasificadorBienes,
  patrimonios_satelite: PatrimonioSatelitePanel,
  deberes: DeberesPanel,
  hijos: HijosPanel,
  filiacion_acciones: FiliacionAccionesPanel,
  bienes_familiares: BienesFamiliaresPanel,
  crisis: CrisisPanel,
  cese_convivencia: FechaCiertaPanel,
  acuerdo_regulador: AcuerdoReguladorPanel,
  separacion: SeparacionPanel,
  compensacion_economica: CompensacionEconomicaPanel,
  nulidad: NulidadPanel,
};

export default function MundoPage() {
  const montado = useMontado();
  const { id } = useParams<{ id: string }>();
  const cap = capitulo(id);
  const router = useRouter();
  const game = useGame();
  const [bitacora, setBitacora] = useState(false);

  const pendientes = useMemo(() => (cap?.escenas ?? []).filter((e) => ESCENAS[e] && !(e in game.escenas)), [cap, game.escenas]);
  const [vista, setVista] = useState<Vista | null>(null);

  // Primera vista: la primera escena pendiente o, si no hay, la actividad.
  useEffect(() => {
    if (!montado || !cap || vista) return;
    setVista(pendientes[0] ? { tipo: "escena", id: pendientes[0] } : { tipo: "actividad" });
    game.setMundo(cap.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montado, cap?.id]);

  useEffect(() => {
    if (montado && !game.personaje.nombre) router.replace("/creacion");
  }, [montado, game.personaje.nombre, router]);

  if (!cap) {
    return (
      <GameShell titulo="Lugar desconocido" volver={{ href: "/juego", etiqueta: "Volver al mapa" }} stats={false}>
        <div className="flex items-center justify-center">
          <div className="panel p-4 max-w-md">
            <p className="t-lectura">Este folio no existe en el expediente.</p>
            <Link href="/juego" className="btn btn-primario mt-3">Volver al mapa</Link>
          </div>
        </div>
      </GameShell>
    );
  }

  const eyebrow = `Cap. ${cap.numeral} · ${NOMBRE_LUGAR[cap.lugar]}`;
  if (!montado || !game.personaje.nombre || !vista) {
    return <GameShell eyebrow={eyebrow} titulo={cap.titulo} volver={{ href: "/juego", etiqueta: "Volver al mapa" }} stats={false}><div /></GameShell>;
  }

  const desbloqueado = cumpleRequisito(cap.req, game);
  const progreso = progresoCapitulo(cap.id, game);
  const Panel = PANELES[cap.id];

  function trasEscena(idActual: string) {
    const resto = cap!.escenas.filter((e) => ESCENAS[e] && e !== idActual && !(e in useGame.getState().escenas));
    setVista(resto[0] ? { tipo: "escena", id: resto[0] } : { tipo: "actividad" });
  }

  const decididas = cap.escenas.filter((e) => e in game.escenas && ESCENAS[e]);

  let contenido: JSX.Element;
  if (!desbloqueado) {
    contenido = <Bloqueado razon={cap.req ? TEXTO_REQUISITO[cap.req] : ""} />;
  } else if (vista.tipo === "escena" && ESCENAS[vista.id]) {
    const idEsc = vista.id;
    contenido = <DialogoEscena key={idEsc} escena={ESCENAS[idEsc]} onFin={() => trasEscena(idEsc)} />;
  } else if (vista.tipo === "recuerdo" && ESCENAS[vista.id]) {
    const v = vista;
    contenido = <DialogoEscena key={`rec-${v.id}`} escena={ESCENAS[v.id]} recuerdo textoContinuar="Salir del recuerdo" onFin={() => setVista(v.volver)} />;
  } else if (Panel) {
    contenido = <Panel />;
  } else {
    contenido = <Cierre mundo={cap.id} />;
  }

  return (
    <GameShell
      eyebrow={eyebrow}
      titulo={cap.titulo}
      volver={{ href: "/juego", etiqueta: "Volver al mapa" }}
      acciones={
        <button type="button" className="btn btn-secundario btn-icono" onClick={() => setBitacora(true)} aria-label="Bitácora del capítulo: objetivo, progreso y decisiones" title="Bitácora del capítulo">
          <Icono nombre="bandera" tam={20} />
        </button>
      }
    >
      {contenido}
      <Hoja abierta={bitacora} onCerrar={() => setBitacora(false)} titulo={`Bitácora · Cap. ${cap.numeral}`}>
        <div className="space-y-4">
          <div>
            <div className="rotulo mb-1">Objetivo</div>
            <p className="t-lectura flex gap-2"><Icono nombre="bandera" tam={18} className="txt-oro mt-1" />{cap.objetivo}</p>
          </div>
          <div>
            <div className="rotulo mb-1">Progreso</div>
            <Progreso hecho={progreso.hecho} total={progreso.total} />
            {progreso.completo && <p className="t-meta txt-verde mt-1 flex items-center gap-1"><Icono nombre="check" tam={16} /> Capítulo completado</p>}
          </div>
          <div>
            <div className="rotulo mb-1">Tus decisiones</div>
            {decididas.length === 0 && <p className="t-meta txt-3">Aún no hay decisiones en este capítulo.</p>}
            <ul className="space-y-2">
              {decididas.map((e) => {
                const esc = ESCENAS[e];
                const op = esc.opciones[game.escenas[e]];
                return (
                  <li key={e} className="tarjeta">
                    <div className="t-meta txt-3">{esc.titulo}</div>
                    <div className="t-base txt-1">{op?.texto ?? "Escena concluida"}</div>
                    <button
                      type="button"
                      className="btn btn-secundario mt-2"
                      onClick={() => { setBitacora(false); setVista({ tipo: "recuerdo", id: e, volver: vista.tipo === "recuerdo" ? vista.volver : vista }); }}
                    >
                      <Icono nombre="recuerdo" tam={18} /> Revivir y explorar otras opciones
                    </button>
                  </li>
                );
              })}
            </ul>
            {decididas.length > 0 && <p className="t-meta txt-3 mt-2">El recuerdo muestra qué habría pasado con otra decisión, sin cambiar tu partida.</p>}
          </div>
        </div>
      </Hoja>
    </GameShell>
  );
}

function Bloqueado({ razon }: { razon: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="panel marco p-5 max-w-md text-center space-y-3">
        <Icono nombre="candado" tam={36} className="mx-auto txt-oro" />
        <h2 className="t-titulo">Capítulo bloqueado</h2>
        <p className="t-lectura txt-2">{razon}</p>
        <Link href="/juego" className="btn btn-primario w-full">Volver al mapa</Link>
      </div>
    </div>
  );
}

/** Cierre de los capítulos sin panel propio (I, XIII, XIV, XV). */
function Cierre({ mundo }: { mundo: Mundo }) {
  const router = useRouter();
  const game = useGame();
  const [confirmar, setConfirmar] = useState(false);
  const cap = capitulo(mundo)!;
  const decisiones = cap.escenas.filter((e) => e in game.escenas && ESCENAS[e]).map((e) => ({ id: e, esc: ESCENAS[e], op: ESCENAS[e].opciones[game.escenas[e]] }));
  const sig = siguienteCapitulo(game);

  const textos: Partial<Record<Mundo, { titulo: string; cta: string; accion: () => void; cuerpo: string }>> = {
    noviazgo: { titulo: "Cruzaste el umbral precontractual.", cta: "Avanzar al matrimonio", accion: () => router.push("/mundo/matrimonio"), cuerpo: "La narrativa continúa. Cada acción se inscribe en el folio interior." },
    segunda_vida: {
      titulo: "Segunda vida iniciada. Tu inventario propio te acompaña.",
      cta: confirmar ? "Confirmar: cerrar este ciclo" : "Rehacer tu vida",
      accion: () => {
        if (!confirmar) { setConfirmar(true); return; }
        game.iniciarSegundaVida();
        router.push("/juego");
      },
      cuerpo: confirmar
        ? `Se cerrará el ciclo ${game.personaje.cicloVital}: conservas bienes propios, reservados y satélites, hijos, logros y atributos; el cónyuge y el libro de recompensas quedan atrás.`
        : "La narrativa continúa. Cada acción se inscribe en el folio interior.",
    },
    liquidacion: { titulo: "El expediente está listo para liquidación.", cta: "Iniciar liquidación", accion: () => router.push("/liquidacion"), cuerpo: "Nueve fases, cada una con su justificación normativa. Al final, tu epílogo." },
    examen: { titulo: "Modo examen: cédula final.", cta: "Comenzar examen", accion: () => router.push("/examen"), cuerpo: "Veinte preguntas tipo cédula de grado, con explicación normativa tras cada respuesta." },
  };
  const t = textos[mundo] ?? { titulo: "Capítulo concluido.", cta: "Volver al mapa", accion: () => router.push("/juego"), cuerpo: "" };

  const bloques = [
    { k: "cuerpo", nodo: <p className="t-lectura txt-2">{t.cuerpo}</p> },
    ...decisiones.map((d) => ({
      k: d.id,
      nodo: (
        <div className="tarjeta">
          <div className="t-meta txt-3">{d.esc.titulo}</div>
          <div className="t-base txt-1">{d.op?.texto ?? "Escena concluida"}</div>
        </div>
      ),
    })),
  ];

  return (
    <div className="actividad">
      <div className="visual actividad-visual" aria-hidden><Escenario lugar={cap.lugar} /></div>
      <section className="panel marco actividad-cuerpo" aria-label={t.titulo}>
        <header className="actividad-cabecera">
          <div className="rotulo txt-oro">Cierre del capítulo {cap.numeral}</div>
          <h2 className="t-titulo">{t.titulo}</h2>
        </header>
        <div className="cuerpo">
          <Paginado items={bloques} clave={(b) => b.k} render={(b) => b.nodo} etiqueta="Resumen" gap={8} />
        </div>
        <div className="barra-accion">
          {sig && sig.id !== mundo && mundo !== "noviazgo" && mundo !== "segunda_vida" && (
            <Link href={`/mundo/${sig.id}`} className="btn btn-secundario">Siguiente: {sig.numeral} · {sig.titulo}</Link>
          )}
          <button type="button" className={`btn ${confirmar ? "btn-peligro" : "btn-primario"}`} onClick={t.accion}>
            {t.cta} <Icono nombre="flechaDer" tam={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
