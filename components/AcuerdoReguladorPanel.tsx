"use client";
// Acuerdo regulador completo y suficiente (arts. 21 y 27 LMC).
// Redactar → presentar → sentencia sobre el acuerdo → corregir si falta algo.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { evaluarAcuerdoRegulador } from "@/lib/reglas";
import type { AcuerdoRegulador } from "@/types/game";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad from "@/components/ui/Actividad";
import Consecuencia from "@/components/ui/Consecuencia";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";

const ITEMS: { k: keyof AcuerdoRegulador; label: string; art: string }[] = [
  { k: "alimentosHijos", label: "Alimentos para hijos comunes", art: "Ley 14.908 / Art. 21 LMC" },
  { k: "cuidadoPersonal", label: "Cuidado personal de los hijos", art: "Arts. 225, 27 LMC" },
  { k: "relacionDirectaRegular", label: "Relación directa y regular", art: "Art. 229 CC" },
  { k: "alimentosConyuge", label: "Alimentos entre cónyuges (si procede)", art: "Arts. 321, 134 CC" },
  { k: "bienesFamiliares", label: "Destino de bienes familiares", art: "Arts. 141-149 CC" },
  { k: "liquidacionRegimen", label: "Liquidación o renuncia del régimen", art: "Arts. 1765 ss. / 1792-3 ss. CC" },
  { k: "compensacionEconomica", label: "Compensación económica", art: "Arts. 61-66 LMC" },
];

const REGLA = {
  titulo: "Acuerdo regulador (arts. 21 y 27 LMC)",
  parrafos: [
    "Para el divorcio de común acuerdo (art. 55 inc. 1° LMC), los cónyuges deben acompañar un acuerdo que regule sus relaciones mutuas y respecto de los hijos comunes.",
    "El acuerdo será COMPLETO si cubre todas las materias del art. 21 y SUFICIENTE si resguarda el interés superior de los hijos, procura aminorar el menoscabo económico y establece relaciones equitativas entre los cónyuges.",
  ],
  articulo: "Arts. 21 y 27 LMC",
};

const VACIO: AcuerdoRegulador = {
  alimentosHijos: false, cuidadoPersonal: false, relacionDirectaRegular: false,
  alimentosConyuge: false, bienesFamiliares: false, liquidacionRegimen: false,
  compensacionEconomica: false, completo: false, suficiente: false,
};

export default function AcuerdoReguladorPanel() {
  const game = useGame();
  const { hijos, conyuge } = game;
  const [a, setA] = useState<AcuerdoRegulador>(conyuge?.acuerdoRegulador ?? VACIO);
  const [evaluacion, setEvaluacion] = useState<ReturnType<typeof evaluarAcuerdoRegulador> | null>(null);
  const cap = capitulo("acuerdo_regulador")!;
  const progreso = progresoCapitulo("acuerdo_regulador", game);
  const aprobado = !!(conyuge?.acuerdoRegulador?.completo && conyuge.acuerdoRegulador.suficiente);

  function toggle(k: keyof AcuerdoRegulador) {
    setA((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  function evaluar() {
    const r = evaluarAcuerdoRegulador(a, hijos.length > 0);
    setEvaluacion(r);
    const st = useGame.getState();
    if (r.completo && r.suficiente && st.conyuge) {
      const yaEstaba = st.conyuge.acuerdoRegulador?.completo && st.conyuge.acuerdoRegulador.suficiente;
      st.setConyuge({ ...st.conyuge, acuerdoRegulador: { ...a, completo: true, suficiente: true } });
      if (!yaEstaba) {
        st.pushLog("Acuerdo regulador completo y suficiente. Habilita art. 55 inc. 1 LMC.", r.articulo);
        st.desbloquearLogro({ id: "acuerdo_regulador", titulo: "Acuerdo completo y suficiente", descripcion: "Redactaste un acuerdo regulador aprobado.", articulo: "Arts. 21 y 27 LMC", desbloqueado: true });
      }
    }
  }

  if (!conyuge) {
    return (
      <Actividad titulo="Acuerdo regulador" objetivo={cap.objetivo} regla={REGLA} lugar="despacho">
        <div className="cuerpo"><p className="tarjeta t-lectura txt-2">No hay cónyuge registrado en este ciclo: el acuerdo presupone un matrimonio.</p></div>
      </Actividad>
    );
  }

  if (evaluacion) {
    const ok = evaluacion.completo && evaluacion.suficiente;
    return (
      <Actividad titulo="Sentencia sobre el acuerdo" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} lugar="tribunal" retrato="jueza" animo={ok ? "aprueba" : "molesto"}>
        <div className="cuerpo">
          <Consecuencia
            tono={ok ? "exito" : "fallo"}
            titulo={ok ? "✓ Acuerdo completo y suficiente" : "✗ Acuerdo insuficiente"}
            narrativa={
              evaluacion.observaciones.length > 0 ? (
                <ul className="space-y-1">{evaluacion.observaciones.map((o, i) => <li key={i}>• {o}</li>)}</ul>
              ) : "Sin observaciones."
            }
            deltas={ok ? [{ texto: "Antecedente: acuerdo regulador aprobado", signo: "•", tono: "cian" }] : [{ texto: "Corrige las cláusulas y vuelve a presentarlo", signo: "•", tono: "oro" }]}
            regla={{ articulo: evaluacion.articulo, texto: "COMPLETO si cubre todas las materias del art. 21; SUFICIENTE si resguarda el interés superior de los hijos, procura aminorar el menoscabo económico y establece relaciones equitativas entre los cónyuges.", codex: "27" }}
          />
        </div>
        <div className="barra-accion">
          <button type="button" className="btn btn-secundario" onClick={() => setEvaluacion(null)}><Icono nombre="pluma" tam={18} /> {ok ? "Revisar cláusulas" : "Corregir el acuerdo"}</button>
          {ok && <Link href="/mundo/separacion" className="btn btn-primario">Ir al tribunal <Icono nombre="mazo" tam={18} /></Link>}
        </div>
      </Actividad>
    );
  }

  const marcadas = ITEMS.filter((it) => a[it.k]).length;

  return (
    <Actividad titulo="Redacta las cláusulas" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} introClave="intro:acuerdo" lugar="despacho">
      {aprobado && <p className="insignia self-start" data-tono="verde"><Icono nombre="check" tam={14} /> Ya tienes un acuerdo aprobado</p>}
      <div className="cuerpo">
        <Paginado
          items={ITEMS}
          clave={(it) => it.k}
          etiqueta="Cláusulas"
          gap={6}
          columnas={(w) => (w > 760 ? 2 : 1)}
          render={(it) => (
            <button type="button" role="checkbox" aria-checked={!!a[it.k]} className="fila-check" onClick={() => toggle(it.k)}>
              <span className="caja" aria-hidden>{a[it.k] && <Icono nombre="check" tam={16} grosor={3} />}</span>
              <span className="min-w-0">
                <span className="block t-base txt-1">{it.label}</span>
                <span className="block t-meta txt-3">{it.art}</span>
              </span>
            </button>
          )}
        />
      </div>
      <div className="barra-accion">
        <span className="t-meta txt-2 fijo">{marcadas} de {ITEMS.length} cláusulas</span>
        <button type="button" className="btn btn-primario" onClick={evaluar}>Presentar al tribunal <Icono nombre="flechaDer" tam={18} /></button>
      </div>
    </Actividad>
  );
}
