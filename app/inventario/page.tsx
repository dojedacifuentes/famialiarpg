"use client";
// ============================================================================
// EXPEDIENTE — estado completo de la partida en cinco pestañas paginadas.
// Los flags narrativos se presentan como antecedentes con su función.
// ============================================================================
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useGame, useMontado } from "@/store/useGame";
import GameShell from "@/components/ui/GameShell";
import { Paginado } from "@/components/ui/Ajuste";
import Icono, { type NombreIcono } from "@/components/ui/Icono";
import Retrato from "@/components/arte/Retrato";
import { ANTECEDENTES, ICONO_NATURALEZA, NOMBRE_ATRIBUTO, NOMBRE_CLASE, NOMBRE_ESTADO_CIVIL, NOMBRE_REGIMEN, pesos } from "@/data/escenario";
import type { Atributos } from "@/types/game";

type Pestana = "ficha" | "bienes" | "vinculo" | "logros" | "registro";
const PESTANAS: { id: Pestana; label: string; icono: NombreIcono }[] = [
  { id: "ficha", label: "Ficha", icono: "persona" },
  { id: "bienes", label: "Bienes", icono: "cofre" },
  { id: "vinculo", label: "Vínculo", icono: "anillos" },
  { id: "logros", label: "Logros", icono: "estrella" },
  { id: "registro", label: "Registro", icono: "pergamino" },
];

function Fila({ k, v }: { k: string; v: ReactNode }) {
  return <div className="flex justify-between gap-3 t-meta border-b border-tinta-600 py-1"><dt className="txt-3">{k}</dt><dd className="txt-1 text-right">{v}</dd></div>;
}

export default function Inventario() {
  const montado = useMontado();
  const router = useRouter();
  const g = useGame();
  const [tab, setTab] = useState<Pestana>("ficha");

  useEffect(() => {
    if (montado && !g.personaje.nombre) router.replace("/creacion");
  }, [montado, g.personaje.nombre, router]);

  if (!montado || !g.personaje.nombre) return <GameShell titulo="Expediente" stats={false}><div /></GameShell>;

  const { personaje, conyuge, hijos, bienes, recompensas, incumplimientos, fechaCierta, ce, logros, flags, log } = g;

  let bloques: { k: string; nodo: ReactNode }[] = [];
  if (tab === "ficha") {
    bloques = [
      {
        k: "pj",
        nodo: (
          <section className="tarjeta flex gap-3">
            <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden border border-oro/40" aria-hidden><Retrato tipo="jugador" sexo={personaje.sexo} className="w-full h-full" /></div>
            <dl className="flex-1 min-w-0">
              <div className="font-display font-bold txt-oro">{personaje.nombre}</div>
              <Fila k="Perfil" v={`${personaje.sexo === "femenino" ? "Mujer" : "Hombre"} · ${personaje.profesion} · ${personaje.origen.replace(/_/g, " ")}`} />
              <Fila k="Ciclo vital" v={`#${personaje.cicloVital}`} />
              <Fila k="Estado civil" v={NOMBRE_ESTADO_CIVIL[personaje.estadoCivil] ?? personaje.estadoCivil} />
              <Fila k="Régimen" v={personaje.regimen ? NOMBRE_REGIMEN[personaje.regimen] : "—"} />
              <Fila k="Reputación · Trauma" v={`${personaje.reputacion} · ${personaje.trauma}`} />
            </dl>
          </section>
        ),
      },
      {
        k: "attr",
        nodo: (
          <section className="tarjeta">
            <div className="rotulo mb-1">Atributos</div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {(Object.entries(personaje.atributos) as [keyof Atributos, number][]).map(([k, v]) => <Fila key={k} k={NOMBRE_ATRIBUTO[k]} v={`${v}/10`} />)}
            </dl>
          </section>
        ),
      },
      {
        k: "cy",
        nodo: (
          <section className="tarjeta">
            <div className="rotulo mb-1">Cónyuge</div>
            {conyuge ? (
              <dl>
                <Fila k="Nombre" v={`${conyuge.nombre} (${conyuge.sexo})`} />
                <Fila k="Afecto" v={<span className={conyuge.afecto > 0 ? "txt-verde" : "txt-rojo"}>{conyuge.afecto}</span>} />
                <Fila k="Cumplimiento deberes" v={`${conyuge.deberesCumplidos}/100`} />
                <Fila k="Infidelidades" v={conyuge.infidelidades} />
                <Fila k="VIF" v={conyuge.vif ? "sí" : "no"} />
                <Fila k="Acuerdo regulador" v={conyuge.acuerdoRegulador?.completo ? "completo" : "—"} />
              </dl>
            ) : <p className="t-meta txt-3">Sin cónyuge registrado.</p>}
          </section>
        ),
      },
      ...hijos.map((h) => ({
        k: h.id,
        nodo: (
          <section className="tarjeta flex items-center gap-2">
            <Icono nombre="hijo" tam={22} className="txt-oro" />
            <span className="flex-1 t-base"><b>{h.nombre}</b> · {h.edad} años · {h.filiacion.replace(/_/g, " ")}</span>
            <span className={`t-meta ${h.alimentosAlDia ? "txt-verde" : "txt-rojo"}`}>{h.alimentosAlDia ? "alimentos al día" : "en mora"}</span>
          </section>
        ),
      })),
    ];
    if (hijos.length === 0) bloques.push({ k: "sinh", nodo: <p className="t-meta txt-3">Sin hijos registrados.</p> });
  } else if (tab === "bienes") {
    bloques = [
      { k: "tb", nodo: <div className="rotulo">Bienes ({bienes.length}) · valor total {pesos(bienes.reduce((s, b) => s + b.valor, 0))}</div> },
      ...bienes.map((b) => ({
        k: b.id,
        nodo: (
          <article className="tarjeta flex gap-2">
            <Icono nombre={ICONO_NATURALEZA[b.naturaleza] ?? "documento"} tam={22} className="txt-oro mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="t-base txt-1">{b.nombre}</div>
              <div className="t-meta txt-2">{NOMBRE_CLASE[b.clase]} · ciclo #{b.cicloVital ?? 1}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {b.oculto && <span className="insignia" data-tono="rojo">OCULTO</span>}
                {b.declaradoBienFamiliar && <span className="insignia" data-tono="oro">FAMILIAR</span>}
                {!!b.generaRecompensa && <span className="insignia" data-tono="cian">Recompensa {pesos(b.generaRecompensa)}</span>}
              </div>
            </div>
            <span className="t-meta txt-oro cifra">{pesos(b.valor)}</span>
          </article>
        ),
      })),
      { k: "tr", nodo: <div className="rotulo pt-1">Libro de recompensas ({recompensas.length})</div> },
      ...recompensas.map((r) => ({
        k: r.id,
        nodo: (
          <article className="tarjeta t-meta">
            <div className="flex justify-between gap-2"><b className="txt-1">{r.deudor} → {r.acreedor}</b><span className="txt-violeta cifra">{pesos(r.monto)}</span></div>
            <div className="txt-2">{r.motivo} <span className="articulo ml-1">{r.articulo}</span></div>
          </article>
        ),
      })),
    ];
    if (bienes.length === 0) bloques.splice(1, 0, { k: "sinb", nodo: <p className="t-meta txt-3">Aún no hay bienes. Se inscriben al clasificar el haber (cap. III).</p> });
  } else if (tab === "vinculo") {
    bloques = [
      {
        k: "cese",
        nodo: (
          <section className="tarjeta">
            <div className="rotulo mb-1">Cese de convivencia y compensación</div>
            <dl>
              <Fila k="Fecha cierta" v={fechaCierta ? <>{fechaCierta.medio.replace(/_/g, " ")} <span className="articulo ml-1">{fechaCierta.articulo}</span></> : "Sin fecha cierta del cese."} />
              <Fila k="Compensación" v={ce ? `${pesos(ce.montoEstimado)} · ${ce.modalidad.replace(/_/g, " ")}` : "Sin compensación económica acordada."} />
            </dl>
          </section>
        ),
      },
      { k: "ti", nodo: <div className="rotulo">Incumplimientos de deberes ({incumplimientos.length})</div> },
      ...incumplimientos.map((i) => ({
        k: i.id,
        nodo: (
          <article className="tarjeta t-meta">
            <div className="flex flex-wrap items-center gap-1.5"><b className="txt-1">{i.deber.replace(/_/g, " ")}</b><span className="articulo">{i.articulo}</span>{i.habilitaCulpa && <span className="insignia" data-tono="rojo">CULPOSA</span>}</div>
            <div className="txt-2">{i.detalle}</div>
          </article>
        ),
      })),
    ];
  } else if (tab === "logros") {
    const conFuncion = flags.filter((f) => ANTECEDENTES[f]);
    const otros = flags.filter((f) => !ANTECEDENTES[f]);
    bloques = [
      { k: "tl", nodo: <div className="rotulo">Logros ({logros.length})</div> },
      ...logros.map((l) => ({
        k: l.id,
        nodo: (
          <article className="tarjeta flex gap-2">
            <Icono nombre="estrella" tam={22} className="txt-oro" />
            <div><div className="t-base font-bold txt-1">{l.titulo}</div><div className="t-meta txt-2">{l.descripcion}</div>{l.articulo !== "—" && <span className="articulo mt-1">{l.articulo}</span>}</div>
          </article>
        ),
      })),
      ...(logros.length === 0 ? [{ k: "sinl", nodo: <p className="t-meta txt-3">Sin logros aún. Se ganan demostrando comprensión: clasificar con precisión, redactar un acuerdo suficiente, aprobar la cédula.</p> }] : []),
      { k: "ta", nodo: <div className="rotulo pt-1">Antecedentes ({conFuncion.length})</div> },
      ...conFuncion.map((f) => ({
        k: f,
        nodo: (
          <article className="tarjeta flex gap-2">
            <Icono nombre={ANTECEDENTES[f].icono} tam={20} className="txt-cian mt-0.5" />
            <div><div className="t-base txt-1">{ANTECEDENTES[f].nombre}</div><div className="t-meta txt-2">{ANTECEDENTES[f].uso}</div></div>
          </article>
        ),
      })),
      ...(otros.length ? [{ k: "otros", nodo: <div className="tarjeta"><div className="rotulo mb-1">Otros registros</div><div className="flex flex-wrap gap-1">{otros.map((f) => <span key={f} className="insignia">{f}</span>)}</div></div> }] : []),
    ];
  } else {
    bloques = log.length
      ? log.map((l, i) => ({
          k: `${l.t}-${i}`,
          nodo: (
            <p className="t-meta txt-2 border-l-2 border-oro/40 pl-2">
              {l.texto} {l.tag && <span className="insignia ml-1">{l.tag}</span>}
            </p>
          ),
        }))
      : [{ k: "sinlog", nodo: <p className="t-meta txt-3">Sin actuaciones. Pronto la lluvia jurídica caerá.</p> }];
  }

  return (
    <GameShell eyebrow={`Ciclo ${personaje.cicloVital}`} titulo="Expediente" volver={{ href: "/juego", etiqueta: "Volver al mapa" }}>
      <div className="panel marco actividad-cuerpo h-full max-w-4xl w-full mx-auto">
        <div role="tablist" aria-label="Secciones del expediente" className="grid grid-cols-5 gap-1">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={tab === p.id}
              aria-controls="panel-expediente"
              className={`btn !px-1 flex-col !gap-0.5 t-micro ${tab === p.id ? "btn-primario" : "btn-secundario"}`}
              onClick={() => setTab(p.id)}
            >
              <Icono nombre={p.icono} tam={18} />
              <span className="t-micro">{p.label}</span>
            </button>
          ))}
        </div>
        <div id="panel-expediente" role="tabpanel" aria-labelledby={`tab-${tab}`} className="cuerpo">
          <Paginado items={bloques} clave={(b) => b.k} render={(b) => b.nodo} gap={6} etiqueta="Página" reinicio={tab} />
        </div>
        {g.finalizado && (
          <div className="barra-accion"><Link href="/epilogo" className="btn btn-secundario"><Icono nombre="pergamino" tam={18} /> Leer epílogo</Link></div>
        )}
      </div>
    </GameShell>
  );
}
