"use client";
// ============================================================================
// TRIBUNAL — separación y divorcio. Los antecedentes que reuniste en capítulos
// anteriores (fecha cierta, acuerdo regulador, pruebas de la causal) son los
// objetos que presentas. La lógica de cada vía es la original; si la demanda
// se rechaza, la sentencia dice qué faltó y dónde conseguirlo.
// ============================================================================
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import { ANTECEDENTES } from "@/data/escenario";
import Actividad from "@/components/ui/Actividad";
import Consecuencia from "@/components/ui/Consecuencia";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";

type Via = "unilateral" | "comun_acuerdo" | "culposo" | "separacion_judicial";

const VIAS: { id: Via; nombre: string; req: string; plazo: string; art: string }[] = [
  { id: "unilateral", nombre: "Divorcio unilateral", req: "Cese efectivo de convivencia (fecha cierta) y voluntad unilateral.", plazo: "≥ 3 años de cese", art: "Art. 55 inc. 3° LMC" },
  { id: "comun_acuerdo", nombre: "Divorcio de común acuerdo", req: "Acuerdo regulador completo y suficiente acompañado a la demanda.", plazo: "≥ 1 año de cese", art: "Art. 55 inc. 1° LMC + Arts. 21, 27 LMC" },
  { id: "culposo", nombre: "Divorcio culposo (sin plazo)", req: "Falta imputable grave del otro cónyuge (siete causales del art. 54).", plazo: "No requiere cese", art: "Art. 54 LMC" },
  { id: "separacion_judicial", nombre: "Separación judicial", req: "Cese o falta imputable. No disuelve el vínculo.", plazo: "—", art: "Arts. 26-29 LMC" },
];

type Sentencia = { via: Via; exito: boolean; texto: string; deltas: Delta[]; faltan: { texto: string; href: string }[] };

export default function SeparacionPanel() {
  const game = useGame();
  const [sel, setSel] = useState<Via | undefined>();
  const [sentencia, setSentencia] = useState<Sentencia | null>(null);
  const cap = capitulo("separacion")!;
  const progreso = progresoCapitulo("separacion", game);

  const ceseAcred = !!game.fechaCierta || game.flags.includes("cese_acreditado");
  const ceseFalso = game.flags.includes("cese_falso");
  const acuerdoOk = !!(game.conyuge?.acuerdoRegulador?.completo && game.conyuge?.acuerdoRegulador?.suficiente);
  const pruebas = ["prueba_infidelidad", "prueba_alcoholismo", "denuncia_vif"].filter((f) => game.flags.includes(f));
  const pruebaCulpa = pruebas.length > 0;
  const terminado = game.personaje.estadoCivil === "divorciado" || game.personaje.estadoCivil === "nulidad";

  function intentar(v: Via) {
    let exito = false;
    let texto = "";
    const faltan: Sentencia["faltan"] = [];
    if (v === "unilateral") {
      exito = ceseAcred && !ceseFalso;
      texto = exito
        ? "Acreditado el cese por 3 años con fecha cierta, se acoge el divorcio unilateral (art. 55 inc. 3° LMC)."
        : "Falta acreditación calificada del cese. Demanda rechazada.";
      if (!ceseAcred) faltan.push({ texto: "Fecha cierta del cese (cap. VIII)", href: "/mundo/cese_convivencia" });
    }
    if (v === "comun_acuerdo") {
      exito = acuerdoOk && ceseAcred;
      texto = exito
        ? "Acuerdo regulador completo y suficiente acompañado y cese de 1 año: se concede el divorcio (art. 55 inc. 1° LMC)."
        : !acuerdoOk
          ? "Falta acuerdo regulador completo y suficiente (arts. 21 y 27 LMC). Rechazado."
          : "Falta acreditación del cese de convivencia. Rechazado.";
      if (!acuerdoOk) faltan.push({ texto: "Acuerdo regulador completo y suficiente (cap. IX)", href: "/mundo/acuerdo_regulador" });
      if (!ceseAcred) faltan.push({ texto: "Fecha cierta del cese (cap. VIII)", href: "/mundo/cese_convivencia" });
    }
    if (v === "culposo") {
      exito = pruebaCulpa;
      texto = exito
        ? "Acreditada falta imputable grave (art. 54 LMC). Se concede divorcio por culpa. La compensación económica al culpable puede ser denegada o rebajada (art. 62 inc. 2°)."
        : "Sin prueba calificada de la causal culpable. Rechazado.";
      if (!pruebaCulpa) faltan.push({ texto: "Prueba de una causal culposa (cap. VII)", href: "/mundo/crisis" });
    }
    if (v === "separacion_judicial") {
      exito = true;
      texto = "Separación judicial decretada. Subsiste el vínculo, cesa la convivencia y el deber de fidelidad (art. 33 LMC). No habilita nuevo matrimonio.";
    }

    const deltas = conCambios(() => {
      if (exito) {
        const ec = v === "separacion_judicial" ? "separado_judicial" : "divorciado";
        game.setPersonaje({ ...useGame.getState().personaje, estadoCivil: ec });
        game.setFlag("ruptura_definitiva");
        game.pushLog(texto, v.toUpperCase());
      } else {
        game.ajustarTrauma(6);
        game.pushLog(texto, "RECHAZO");
      }
    });
    if (exito) deltas.unshift({ texto: v === "separacion_judicial" ? "Estado civil: separación judicial" : "Estado civil: divorciado/a", signo: "•", tono: "oro" });
    setSentencia({ via: v, exito, texto, deltas, faltan });
  }

  const antecedentes: { nombre: string; tiene: boolean }[] = [
    { nombre: "Fecha cierta del cese", tiene: ceseAcred },
    { nombre: "Acuerdo regulador aprobado", tiene: acuerdoOk },
    ...(pruebas.length ? pruebas.map((p) => ({ nombre: ANTECEDENTES[p]?.nombre ?? p, tiene: true })) : [{ nombre: "Prueba de causal culposa", tiene: false }]),
  ];

  if (sentencia || terminado) {
    const s = sentencia;
    return (
      <Actividad titulo="Sentencia" objetivo={cap.objetivo} progreso={progreso} lugar="tribunal" retrato="jueza" animo={s && !s.exito ? "molesto" : "neutral"}>
        <div className="cuerpo">
          <Consecuencia
            tono={s ? (s.exito ? "exito" : "fallo") : "neutral"}
            titulo={s ? VIAS.find((v) => v.id === s.via)!.nombre : "Sentencia ejecutoriada"}
            narrativa={s ? s.texto : "El tribunal ya resolvió tu causa en este ciclo."}
            deltas={s?.deltas ?? []}
            regla={s ? { articulo: VIAS.find((v) => v.id === s.via)!.art, codex: s.via === "culposo" ? "54" : "55" } : undefined}
            extra={
              s && s.faltan.length > 0 ? (
                <div>
                  <div className="rotulo mb-1">Para reconsiderar tu estrategia</div>
                  <ul className="space-y-1">
                    {s.faltan.map((f) => (
                      <li key={f.href}><Link href={f.href} className="inline-flex items-center gap-1 min-h-[44px] txt-cian underline underline-offset-4"><Icono nombre="flechaDer" tam={16} /> {f.texto}</Link></li>
                    ))}
                  </ul>
                </div>
              ) : undefined
            }
          />
        </div>
        <div className="barra-accion">
          {(!s || s.exito) && game.flags.includes("ruptura_definitiva") ? (
            <>
              <Link href="/mundo/compensacion_economica" className="btn btn-secundario">Compensación económica</Link>
              <Link href="/liquidacion" className="btn btn-primario">Ir a liquidación <Icono nombre="division" tam={18} /></Link>
            </>
          ) : (
            <button type="button" className="btn btn-primario" onClick={() => setSentencia(null)}>Elegir otra vía</button>
          )}
        </div>
      </Actividad>
    );
  }

  return (
    <Actividad
      titulo="Vía de terminación o suspensión del vínculo"
      objetivo={cap.objetivo}
      progreso={progreso}
      lugar="tribunal"
      retrato="jueza"
      introClave="intro:separacion"
      regla={{
        titulo: "Lo que el juez evaluará",
        parrafos: ["El juez evaluará tus flags procesales: fecha cierta del cese (arts. 22 y 25 LMC), acuerdo regulador (arts. 21 y 27) y, en su caso, prueba de la causal culposa (art. 54)."],
        articulo: "Arts. 21, 22, 25, 27, 54, 55 LMC",
      }}
    >
      <div>
        <div className="rotulo mb-1">Tus antecedentes</div>
        <ul className="flex flex-wrap gap-1.5">
          {antecedentes.map((a) => (
            <li key={a.nombre} className="insignia" data-tono={a.tiene ? "verde" : undefined}>
              <Icono nombre={a.tiene ? "check" : "cruz"} tam={14} /> {a.nombre}{a.tiene ? "" : " (no la tienes)"}
            </li>
          ))}
        </ul>
      </div>
      <div className="cuerpo">
        <Paginado
          items={VIAS}
          clave={(v) => v.id}
          etiqueta="Vías"
          columnas={(w) => (w > 760 ? 2 : 1)}
          render={(v) => (
            <button type="button" className="eleccion h-full" aria-pressed={sel === v.id} onClick={() => setSel(v.id)}>
              <span className="flex items-center gap-2 w-full">
                <span className="caja" aria-hidden>{sel === v.id && <Icono nombre="check" tam={16} grosor={3} />}</span>
                <span className="font-bold txt-1">{v.nombre}</span>
              </span>
              <span className="t-base txt-2">{v.req}</span>
              <span className="flex flex-wrap gap-1.5"><span className="insignia">{v.plazo}</span><span className="articulo">{v.art}</span></span>
            </button>
          )}
        />
      </div>
      <div className="barra-accion">
        <button type="button" className="btn btn-primario" disabled={!sel} onClick={() => sel && intentar(sel)}>
          {sel ? "Presentar la demanda" : "Elige una vía"} <Icono nombre="mazo" tam={18} />
        </button>
      </div>
    </Actividad>
  );
}
