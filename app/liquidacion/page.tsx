"use client";
// ============================================================================
// LIQUIDACIÓN — jefe final patrimonial en nueve fases, una por diapositiva.
// La fase actual se guarda (recargar no reinicia). Cálculos originales de
// lib/reglas.ts; cada fase muestra su justificación normativa.
// ============================================================================
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useGame, useMontado } from "@/store/useGame";
import { liquidar } from "@/lib/reglas";
import { generarEpilogo } from "@/lib/epilogo";
import type { Bien, Recompensa } from "@/types/game";
import GameShell from "@/components/ui/GameShell";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";
import Escenario from "@/components/arte/Escenario";
import { pesos } from "@/data/escenario";
import CierreRegimen from "@/components/CierreRegimen";
import { esBienDelCiclo } from "@/lib/regimenes";

type Fase =
  | "facción_inventario"   // Art. 1765 CC
  | "tasacion"             // Art. 1335 CC supletoriamente
  | "deducciones"          // Bajas generales: art. 959 CC
  | "recompensas"          // Arts. 1769-1779 CC
  | "computar_gananciales" // Arts. 1773-1774 CC
  | "particion_concreta"   // Art. 1337 CC reglas
  | "adjudicacion"         // Adjudicación de hijuelas
  | "inscripcion"          // Conservador de Bienes Raíces
  | "cierre";

const FASES: { id: Fase; titulo: string; desc: string; art: string }[] = [
  { id: "facción_inventario", titulo: "1. Facción de inventario", desc: "Confección formal del inventario de bienes sociales, propios y reservados. Distingue qué es de la sociedad, qué del marido, qué de la mujer, qué del reservado art. 150 y qué de los satélites 166-167.", art: "Art. 1765 CC" },
  { id: "tasacion", titulo: "2. Tasación", desc: "Determinación del valor comercial actual de cada bien por peritos o de común acuerdo. Aplica supletoriamente el art. 1335 sobre partición.", art: "Art. 1335 CC" },
  { id: "deducciones", titulo: "3. Deducción de bajas generales", desc: "Del acervo bruto se deducen: (1) costas de la facción; (2) deudas de la sociedad; (3) alimentos forzosos; (4) gananciales del cónyuge fallecido si procede.", art: "Art. 959 CC (aplicable a SC vía art. 1765)" },
  { id: "recompensas", titulo: "4. Liquidación de recompensas", desc: "Compensación de los créditos recíprocos: la sociedad debe a los cónyuges (haber relativo, mejoras en propios), los cónyuges deben a la sociedad (pagos de deudas propias con fondos sociales).", art: "Arts. 1769-1779 CC" },
  { id: "computar_gananciales", titulo: "5. Cómputo de gananciales", desc: "Una vez deducidas las bajas y compensadas las recompensas, el remanente del acervo social constituye los GANANCIALES.", art: "Art. 1773 CC" },
  { id: "particion_concreta", titulo: "6. División por mitades", desc: "Los gananciales se dividen por mitades entre los cónyuges, salvo renuncia o aceptación-renuncia de la mujer respecto del art. 150.", art: "Art. 1774 CC" },
  { id: "adjudicacion", titulo: "7. Adjudicación a hijuelas", desc: "Asignación concreta de bienes a cada cónyuge. Si la división recae sobre bienes específicos, debe procurarse equidad y comodidad (art. 1337 CC).", art: "Art. 1337 CC" },
  { id: "inscripcion", titulo: "8. Inscripción conservatoria", desc: "Adjudicaciones de inmuebles requieren inscripción en el CBR competente para producir tradición y oponibilidad frente a terceros.", art: "Reglamento CBR y arts. 686, 687 CC" },
  { id: "cierre", titulo: "9. Cierre del expediente", desc: "Acta final firmada por los cónyuges o por el partidor. Notificaciones.", art: "Arts. 1788, 1825 CC supletoriamente" },
];

function Cifra({ etiqueta, valor, tono = "txt-oro" }: { etiqueta: string; valor: number; tono?: string }) {
  return (
    <div className="tarjeta text-center">
      <div className="t-meta txt-3">{etiqueta}</div>
      <motion.div key={valor} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`t-titulo cifra ${tono}`}>{pesos(valor)}</motion.div>
    </div>
  );
}

export default function LiquidacionPage() {
  const router = useRouter();
  const montado = useMontado();
  const game = useGame();
  const [confirmarLoop, setConfirmarLoop] = useState(false);

  useEffect(() => {
    if (montado && !game.personaje.nombre) router.replace("/creacion");
  }, [montado, game.personaje.nombre, router]);

  const calc = useMemo(() => liquidar(game.bienes.filter((b) => esBienDelCiclo(b, game.personaje.cicloVital))), [game.bienes, game.personaje.cicloVital]);
  const idx = Math.min(FASES.length - 1, Number(game.hechos["liq:fase"] ?? 0));
  const f = FASES[idx];

  if (!montado || !game.personaje.nombre) return <GameShell titulo="Liquidación" stats={false}><div /></GameShell>;
  if (game.personaje.regimen && game.personaje.regimen !== "sociedad_conyugal") return <CierreRegimen />;

  function irA(i: number) {
    game.fijarAvance("liq:fase", Math.max(0, Math.min(FASES.length - 1, i)));
  }

  function cerrar() {
    const st = useGame.getState();
    st.finalizar(generarEpilogo(st, calc));
    router.push("/epilogo");
  }

  const sociales = game.bienes.filter((b) => b.clase === "haber_absoluto" || b.clase === "haber_relativo");
  const propios = game.bienes.filter((b) => b.clase.startsWith("propio"));
  const reservados = game.bienes.filter((b) => b.clase === "reservado_art150" || b.clase === "satelite_art166" || b.clase === "satelite_art167");
  const familiares = game.bienes.filter((b) => b.declaradoBienFamiliar || b.clase === "familiar");
  const opcion150 = game.hechos["opcion150"] as string | undefined;

  const grupos = [
    { t: "Bienes sociales", items: sociales },
    { t: "Bienes propios", items: propios },
    { t: "Patrimonio reservado y satélite", items: reservados },
    { t: "Bienes familiares", items: familiares },
  ];

  // Cada fase se aplana en filas que se paginan juntas: la explicación
  // normativa, las cifras y los bienes nunca se empujan fuera de la pantalla.
  type Fila = { k: string; nodo: ReactNode };
  const filaBien = (b: Bien, pref: string): Fila => ({
    k: `${pref}-${b.id}`,
    nodo: (
      <div className="flex justify-between gap-2 t-meta border-b border-tinta-600 pb-1">
        <span className="txt-1">{b.nombre}</span><span className="txt-oro cifra shrink-0">{pesos(b.valor)}</span>
      </div>
    ),
  });
  const titulo = (k: string, t: string, tono = "txt-cian"): Fila => ({ k, nodo: <div className={`rotulo ${tono} pt-1`}>{t}</div> });
  const vacio = (k: string, t = "—"): Fila => ({ k, nodo: <p className="t-meta txt-3">{t}</p> });

  const filas: Fila[] = [
    { k: "desc", nodo: <div className="space-y-1.5"><p className="t-base txt-2">{f.desc}</p><span className="articulo">{f.art}</span></div> },
  ];
  switch (f.id) {
    case "facción_inventario":
      grupos.forEach((g, gi) => {
        filas.push(titulo(`g${gi}`, `${g.t} (${g.items.length})`));
        if (g.items.length === 0) filas.push(vacio(`g${gi}-v`));
        g.items.forEach((b) => filas.push(filaBien(b, `g${gi}`)));
      });
      break;
    case "tasacion":
      filas.push({ k: "c", nodo: <Cifra etiqueta="Avalúo del haber social" valor={calc.acervoBruto} /> });
      filas.push({ k: "n", nodo: <p className="t-meta txt-2">Suma actualizada de bienes sociales (haber absoluto + relativo).</p> });
      break;
    case "deducciones":
      filas.push({
        k: "c",
        nodo: (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Cifra etiqueta="Bruto" valor={calc.acervoBruto} tono="txt-cian" />
            <Cifra etiqueta="– Bajas (art. 959)" valor={calc.bajasGenerales} tono="txt-rojo" />
            <Cifra etiqueta="= Líquido" valor={calc.acervoLiquido} />
          </div>
        ),
      });
      break;
    case "recompensas":
      filas.push(titulo("t", "Libro de recompensas (arts. 1769-1779)", "txt-violeta"));
      if (game.recompensas.length === 0) filas.push(vacio("v", "Sin recompensas pendientes."));
      game.recompensas.forEach((r: Recompensa) =>
        filas.push({
          k: r.id,
          nodo: (
            <div className="tarjeta t-meta">
              <div className="flex justify-between gap-2"><span className="txt-1">{r.deudor} → {r.acreedor}</span><span className="txt-violeta cifra">{pesos(r.monto)}</span></div>
              <div className="txt-2">{r.motivo} {r.articulo && <span className="articulo ml-1">{r.articulo}</span>}</div>
            </div>
          ),
        })
      );
      break;
    case "computar_gananciales":
      filas.push({ k: "c", nodo: <Cifra etiqueta="Gananciales (art. 1773 CC)" valor={calc.gananciales} /> });
      break;
    case "particion_concreta":
      filas.push({
        k: "c",
        nodo: (
          <div className="grid grid-cols-2 gap-2">
            <Cifra etiqueta="Gananciales" valor={calc.gananciales} tono="txt-cian" />
            <Cifra etiqueta="Cuota por cónyuge" valor={calc.cuotaPorConyuge} tono="txt-violeta" />
          </div>
        ),
      });
      if (opcion150) {
        filas.push({ k: "o", nodo: <p className="tarjeta t-meta txt-2 flex gap-2"><Icono nombre="llave" tam={16} className="txt-oro mt-0.5" /> Ejerciste la opción del art. 150 inc. final: {opcion150 === "aceptar" ? "aceptaste los gananciales." : "renunciaste a los gananciales y conservas tu reservado."}</p> });
      }
      break;
    case "adjudicacion": {
      const a = game.bienes.filter((_, i) => i % 2 === 0);
      const b = game.bienes.filter((_, i) => i % 2 === 1);
      filas.push(titulo("ha", `Hijuela A (${a.length})`));
      if (a.length === 0) filas.push(vacio("hav"));
      a.forEach((x) => filas.push(filaBien(x, "a")));
      filas.push(titulo("hb", `Hijuela B (${b.length})`));
      if (b.length === 0) filas.push(vacio("hbv"));
      b.forEach((x) => filas.push(filaBien(x, "b")));
      break;
    }
    case "inscripcion":
      filas.push({
        k: "t",
        nodo: (
          <p className="t-lectura txt-1">
            Las adjudicaciones de inmuebles deben inscribirse en el CBR competente para que produzcan tradición y sean
            oponibles a terceros (arts. 686, 687 CC y Reglamento del CBR). Sin inscripción, el adjudicatario es solo
            un titular obligacional, no dueño frente a terceros.
          </p>
        ),
      });
      break;
    case "cierre":
      filas.push({
        k: "t",
        nodo: (
          <p className="t-lectura txt-1">
            {confirmarLoop
              ? `Se cerrará el ciclo ${game.personaje.cicloVital} sin leer el epílogo: conservas bienes propios, reservados y satélites, hijos, logros y atributos.`
              : "La liquidación ha terminado. Tus bienes propios y reservados subsisten para tu segunda vida. ¿Cerrás el expediente o intentás rehacer tu vida?"}
          </p>
        ),
      });
      break;
  }

  return (
    <GameShell eyebrow="Jefe final · arts. 1765-1788 CC" titulo="Liquidación de la sociedad" volver={{ href: "/juego", etiqueta: "Volver al mapa" }}>
      <div className="actividad">
        <div className="visual actividad-visual" aria-hidden><Escenario lugar="archivo" /></div>
        <section className="panel marco actividad-cuerpo" aria-label={f.titulo}>
          <header className="actividad-cabecera">
            <ol className="flex gap-1" aria-label={`Fase ${idx + 1} de ${FASES.length}`}>
              {FASES.map((x, i) => (
                <li
                  key={x.id}
                  className="flex-1 h-7 grid place-items-center rounded t-micro font-bold cifra"
                  style={{ background: i === idx ? "var(--oro)" : i < idx ? "#2a3b2f" : "#1a1f2c", color: i === idx ? "#1b1408" : i < idx ? "var(--verde)" : "var(--texto-3)" }}
                  aria-current={i === idx ? "step" : undefined}
                  aria-label={`${x.titulo}${i < idx ? " (hecha)" : ""}`}
                >
                  {i < idx ? <Icono nombre="check" tam={12} grosor={3} /> : i + 1}
                </li>
              ))}
            </ol>
            <h2 className="t-titulo txt-oro">{f.titulo}</h2>
          </header>
          <div className="cuerpo">
            <Paginado items={filas} clave={(x) => x.k} render={(x) => x.nodo} gap={6} etiqueta="Página" reinicio={f.id} />
          </div>
          <div className="barra-accion">
            {idx > 0 && <button type="button" className="btn btn-secundario" onClick={() => irA(idx - 1)}><Icono nombre="flechaIzq" tam={18} /> Fase anterior</button>}
            {f.id !== "cierre" ? (
              <button type="button" className="btn btn-primario" onClick={() => irA(idx + 1)}>Avanzar a la siguiente fase <Icono nombre="flechaDer" tam={18} /></button>
            ) : (
              <>
                <button
                  type="button"
                  className={`btn ${confirmarLoop ? "btn-peligro" : "btn-secundario"}`}
                  onClick={() => { if (!confirmarLoop) { setConfirmarLoop(true); return; } game.iniciarSegundaVida(); router.push("/juego"); }}
                >
                  <Icono nombre="recuerdo" tam={18} /> {confirmarLoop ? "Confirmar segunda vida" : "Comenzar segunda vida (loop)"}
                </button>
                <button type="button" className="btn btn-primario" onClick={cerrar}>Cerrar y leer epílogo <Icono nombre="pergamino" tam={18} /></button>
              </>
            )}
          </div>
          {game.finalizado && f.id !== "cierre" && <Link href="/epilogo" className="t-meta txt-cian underline min-h-[44px] inline-flex items-center">Ya tienes un epílogo escrito: leerlo</Link>}
        </section>
      </div>
    </GameShell>
  );
}
