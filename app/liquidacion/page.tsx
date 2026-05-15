"use client";
import { useGame } from "@/store/useGame";
import { liquidar } from "@/lib/reglas";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";

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

export default function LiquidacionPage() {
  const router = useRouter();
  const game = useGame();
  const [fase, setFase] = useState<Fase>("facción_inventario");

  const calc = useMemo(() => liquidar(game.bienes), [game.bienes]);

  function siguiente() {
    const idx = FASES.findIndex((f) => f.id === fase);
    if (idx < FASES.length - 1) setFase(FASES[idx + 1].id);
    else cerrar();
  }

  function cerrar() {
    const epilogo = generarEpilogo(game, calc);
    game.finalizar(epilogo);
    router.push("/epilogo");
  }

  const f = FASES.find((x) => x.id === fase)!;

  return (
    <main className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <Link href="/juego" className="btn">◂ Mapa</Link>
        <div className="tag tag-red">BOSS FINAL · LIQUIDACIÓN (arts. 1765-1788 CC)</div>
      </header>

      <div className="terminal p-6 mb-4">
        <div className="flex gap-1 mb-4 flex-wrap">
          {FASES.map((x) => (
            <span key={x.id} className={`tag ${x.id === fase ? "tag-amber" : ""}`}>
              {x.titulo.split(".")[0]}
            </span>
          ))}
        </div>
        <h1 className="label-art text-2xl text-neon-blue">{f.titulo}</h1>
        <p className="text-parchment/70 text-sm mt-1">{f.desc}</p>
        <div className="tag tag-violet mt-2">{f.art}</div>
      </div>

      {fase === "facción_inventario" && <Inventario bienes={game.bienes} />}
      {fase === "tasacion" && <Tasacion total={calc.acervoBruto} />}
      {fase === "deducciones" && <Deducciones bajas={calc.bajasGenerales} bruto={calc.acervoBruto} liquido={calc.acervoLiquido} />}
      {fase === "recompensas" && <Recompensas recompensas={game.recompensas} />}
      {fase === "computar_gananciales" && <Gananciales valor={calc.gananciales} />}
      {fase === "particion_concreta" && <Particion gananciales={calc.gananciales} cuota={calc.cuotaPorConyuge} />}
      {fase === "adjudicacion" && <Adjudicacion bienes={game.bienes} />}
      {fase === "inscripcion" && <InscripcionConservatoria />}
      {fase === "cierre" && (
        <div className="terminal p-6">
          <h2 className="label-art text-neon-cyan text-xl mb-2">Acta de cierre</h2>
          <p className="text-parchment/70 text-sm mb-4">
            La liquidación ha terminado. Tus bienes propios y reservados subsisten para tu segunda vida.
            ¿Cerrás el expediente o intentás rehacer tu vida?
          </p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-danger" onClick={cerrar}>▸ Cerrar y leer epílogo</button>
            <button className="btn" onClick={() => { game.iniciarSegundaVida(); router.push("/juego"); }}>↻ Comenzar segunda vida (loop)</button>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button className="btn" onClick={siguiente}>▸ Avanzar a la siguiente fase</button>
      </div>
    </main>
  );
}

function Inventario({ bienes }: { bienes: any[] }) {
  const sociales = bienes.filter((b: any) => b.clase === "haber_absoluto" || b.clase === "haber_relativo");
  const propios = bienes.filter((b: any) => b.clase.startsWith("propio"));
  const reservados = bienes.filter((b: any) => b.clase === "reservado_art150" || b.clase === "satelite_art166" || b.clase === "satelite_art167");
  const familiares = bienes.filter((b: any) => b.clase === "familiar");
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Lista titulo="Bienes sociales" color="text-neon-blue" items={sociales} />
      <Lista titulo="Bienes propios" color="text-neon-amber" items={propios} />
      <Lista titulo="Patrimonio reservado y satélite" color="text-neon-cyan" items={reservados} />
      <Lista titulo="Bienes familiares" color="text-neon-red" items={familiares} />
    </div>
  );
}

function Lista({ titulo, color, items }: { titulo: string; color: string; items: any[] }) {
  return (
    <div className="terminal p-4">
      <div className={`label-art mb-2 ${color}`}>{titulo}</div>
      {items.length === 0 && <p className="text-parchment/40 italic text-xs">—</p>}
      {items.map((b: any) => (
        <div key={b.id} className="text-xs border-b border-ink-400 py-1 flex justify-between">
          <span>{b.nombre}</span><span className={color}>${b.valor.toLocaleString("es-CL")}</span>
        </div>
      ))}
    </div>
  );
}

function Tasacion({ total }: { total: number }) {
  return (
    <div className="terminal p-6">
      <div className="label-art text-neon-cyan mb-2">Avalúo del haber social</div>
      <p className="text-5xl text-neon-blue glitch-text">${total.toLocaleString("es-CL")}</p>
      <p className="text-parchment/60 text-xs mt-3">Suma actualizada de bienes sociales (haber absoluto + relativo).</p>
    </div>
  );
}

function Deducciones({ bruto, bajas, liquido }: { bruto: number; bajas: number; liquido: number }) {
  return (
    <div className="terminal p-6">
      <div className="label-art text-neon-cyan mb-2">Acervo líquido</div>
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div><div className="text-parchment/60">Bruto</div><div className="text-2xl text-neon-blue">${bruto.toLocaleString("es-CL")}</div></div>
        <div><div className="text-parchment/60">– Bajas (art. 959)</div><div className="text-2xl text-neon-red">${bajas.toLocaleString("es-CL")}</div></div>
        <div><div className="text-parchment/60">= Líquido</div><div className="text-2xl text-neon-cyan">${liquido.toLocaleString("es-CL")}</div></div>
      </div>
    </div>
  );
}

function Recompensas({ recompensas }: { recompensas: any[] }) {
  return (
    <div className="terminal p-4">
      <div className="label-art text-neon-violet mb-2">Libro de recompensas (arts. 1769-1779)</div>
      {recompensas.length === 0 && <p className="text-parchment/40 italic text-xs">Sin recompensas pendientes.</p>}
      {recompensas.map((r: any) => (
        <div key={r.id} className="text-xs border-b border-ink-400 py-2">
          <div className="flex justify-between"><span>{r.deudor} → {r.acreedor}</span><span className="text-neon-violet">${r.monto.toLocaleString("es-CL")}</span></div>
          <div className="text-parchment/50">{r.motivo} {r.articulo && <span className="tag tag-violet ml-1">{r.articulo}</span>}</div>
        </div>
      ))}
    </div>
  );
}

function Gananciales({ valor }: { valor: number }) {
  return (
    <div className="terminal p-6 text-center">
      <div className="label-art text-neon-cyan mb-2">Gananciales (art. 1773 CC)</div>
      <p className="text-5xl text-neon-blue glitch-text">${valor.toLocaleString("es-CL")}</p>
    </div>
  );
}

function Particion({ gananciales, cuota }: { gananciales: number; cuota: number }) {
  return (
    <div className="terminal p-6">
      <div className="label-art text-neon-cyan mb-2">División por mitades (art. 1774 CC)</div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div><div className="text-xs text-parchment/60">Gananciales</div><div className="text-3xl text-neon-blue">${gananciales.toLocaleString("es-CL")}</div></div>
        <div><div className="text-xs text-parchment/60">Cuota por cónyuge</div><div className="text-3xl text-neon-violet">${cuota.toLocaleString("es-CL")}</div></div>
      </div>
    </div>
  );
}

function Adjudicacion({ bienes }: { bienes: any[] }) {
  return (
    <div className="terminal p-4">
      <div className="label-art text-neon-cyan mb-2">Hijuelas (art. 1337 CC)</div>
      <p className="text-parchment/60 text-xs mb-3">Asignación concreta. Se busca equidad y comodidad de la división.</p>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-neon-blue mb-1">Hijuela A</div>
          {bienes.filter((_: any, i: number) => i % 2 === 0).map((b: any) => <div key={b.id} className="border-b border-ink-400 py-1">{b.nombre}</div>)}
        </div>
        <div>
          <div className="text-neon-blue mb-1">Hijuela B</div>
          {bienes.filter((_: any, i: number) => i % 2 === 1).map((b: any) => <div key={b.id} className="border-b border-ink-400 py-1">{b.nombre}</div>)}
        </div>
      </div>
    </div>
  );
}

function InscripcionConservatoria() {
  return (
    <div className="terminal p-6">
      <div className="label-art text-neon-cyan mb-2">Inscripción en el Conservador de Bienes Raíces</div>
      <p className="text-parchment/70 text-sm">
        Las adjudicaciones de inmuebles deben inscribirse en el CBR competente para que produzcan tradición y sean
        oponibles a terceros (arts. 686, 687 CC y Reglamento del CBR). Sin inscripción, el adjudicatario es solo
        un titular obligacional, no dueño frente a terceros.
      </p>
    </div>
  );
}

function generarEpilogo(game: any, calc: any) {
  const p = game.personaje;
  const cuota = calc.cuotaPorConyuge;
  const hijosTrauma = game.hijos.reduce((s: number, h: any) => s + h.trauma, 0);
  const moroso = game.hijos.some((h: any) => !h.alimentosAlDia);
  const fraude = game.flags.includes("fraude_simulacion");
  const vif = game.flags.includes("denuncia_vif");
  const bigamia = game.flags.includes("bigamia_oculta");
  const ceFalsa = game.flags.includes("cese_falso");
  const incumpl = (game.incumplimientos || []).filter((i: any) => i.habilitaCulpa).length;

  const tono = p.trauma > 70 ? "ruinoso" : p.reputacion > 30 ? "ejemplar" : "gris";

  const lineas: string[] = [];
  lineas.push(`${p.nombre}, ${p.profesion} de origen ${p.origen}, completó el ciclo vital N°${p.cicloVital} el ${new Date().toLocaleDateString("es-CL")}.`);
  lineas.push(`Estado civil definitivo del ciclo: ${p.estadoCivil}. Régimen: ${p.regimen?.replace(/_/g, " ") ?? "ninguno"}.`);
  lineas.push(`Tras la partición, le correspondió una cuota de gananciales de aproximadamente $${cuota.toLocaleString("es-CL")}.`);
  if (incumpl > 0) lineas.push(`Acumuló ${incumpl} incumplimientos graves de deberes recíprocos (art. 131 ss. CC). Esto pudo bloquear su compensación económica (art. 62 inc. 2° LMC).`);
  if (game.recompensas?.length) lineas.push(`Acumuló ${game.recompensas.length} asientos en el libro de recompensas (arts. 1769-1779).`);
  if (moroso) lineas.push(`Murió esperando inscripción conservatoria mientras evadía un apremio personal por alimentos impagos (Ley 14.908 y Ley 21.389).`);
  if (fraude) lineas.push(`Se rumorea que simuló una enajenación: la nulidad relativa pende sobre su tumba (art. 1682 CC).`);
  if (bigamia) lineas.push(`Su primer matrimonio nunca fue disuelto; el segundo fue declarado nulo, pero los hijos conservaron la calidad de matrimoniales por buena fe (art. 51 LMC).`);
  if (vif) lineas.push(`La VIF dejó marcas que la jurisprudencia llamó "daño moral indemnizable" (Ley 20.066).`);
  if (ceFalsa) lineas.push(`Falseó la fecha del cese: la contraparte impugnó. Lo demás fue silencio procesal.`);
  if (hijosTrauma > 40) lineas.push(`Sus hijos crecieron tomando notas de cada incumplimiento. Recordarán todo.`);
  if (game.ce?.acordada) lineas.push(`Su compensación económica final fue de $${game.ce.montoEstimado.toLocaleString("es-CL")} en modalidad ${game.ce.modalidad}.`);
  lineas.push(tono === "ruinoso"
    ? "Su epitafio: «Aquí yace un haber relativo sin recompensar»."
    : tono === "ejemplar"
      ? "Su epitafio: «Cumplió los arts. 131 y 102 hasta el final»."
      : "Su epitafio: «Un patrimonio razonable. Un afecto razonable. Nada del otro mundo civil».");

  return lineas.join("\n\n");
}
