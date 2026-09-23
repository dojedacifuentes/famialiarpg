"use client";
// ============================================================================
// COMPENSACIÓN ECONÓMICA (arts. 61-66 LMC) — formulario convertido en pasos:
// factores personales → factores de mercado → cálculo → modalidad → acuerdo.
// La calculadora y el aviso de culpa (art. 62 inc. 2°) son los originales.
// ============================================================================
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { calcularCompensacionEconomica } from "@/lib/reglas";
import type { FactoresCE, ModalidadPagoCE } from "@/types/game";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import { pesos } from "@/data/escenario";
import Actividad from "@/components/ui/Actividad";
import Consecuencia from "@/components/ui/Consecuencia";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";

const MODALIDADES: { id: ModalidadPagoCE; nombre: string; desc: string }[] = [
  { id: "monto_unico", nombre: "Monto único", desc: "Suma fija pagadera de una vez. Requiere capacidad económica del deudor." },
  { id: "cuotas_reajustables", nombre: "Cuotas reajustables", desc: "Pago periódico reajustable conforme a UF o IPC. Garantías reales o personales pueden imponerse (art. 66 LMC)." },
  { id: "transferencia_bienes", nombre: "Transferencia de bienes", desc: "Adjudicación de bienes específicos del deudor al beneficiario." },
  { id: "usufructo_uso_habitacion", nombre: "Usufructo, uso o habitación", desc: "Derecho real temporal sobre un bien del deudor. Útil cuando hay vivienda compartida." },
];

const REGLA = {
  titulo: "Compensación económica (arts. 61-66 LMC)",
  parrafos: [
    "Procede cuando uno de los cónyuges, por dedicarse al cuidado del hogar o de los hijos o realizar trabajo en menor medida, no pudo desarrollar actividad remunerada durante el matrimonio (art. 61).",
    "Los criterios del art. 62 ponderan el \"menoscabo económico\".",
  ],
  articulo: "Arts. 61, 62, 65 LMC",
};

const PASOS = ["Factores personales", "Factores de mercado", "Cálculo", "Modalidad"] as const;

function Contador({ etiqueta, valor, min, max, onCambio, sufijo }: { etiqueta: string; valor: number; min: number; max: number; onCambio: (v: number) => void; sufijo: string }) {
  const fijar = (v: number) => onCambio(Math.max(min, Math.min(max, Number.isFinite(v) ? v : min)));
  const id = `c-${etiqueta.replace(/\W+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="rotulo">{etiqueta}</label>
      <div className="flex items-center gap-2 mt-1">
        <button type="button" className="btn btn-secundario btn-icono" onClick={() => fijar(valor - 1)} aria-label={`Restar a ${etiqueta.toLowerCase()}`}><Icono nombre="menos" tam={18} /></button>
        <input id={id} className="campo text-center cifra max-w-[6rem]" type="number" inputMode="numeric" min={min} max={max} value={valor} onChange={(e) => fijar(Number(e.target.value))} />
        <span className="t-meta txt-2">{sufijo}</span>
        <button type="button" className="btn btn-secundario btn-icono" onClick={() => fijar(valor + 1)} aria-label={`Sumar a ${etiqueta.toLowerCase()}`}><Icono nombre="mas" tam={18} /></button>
      </div>
    </div>
  );
}

function Segmentado<T extends string>({ etiqueta, valor, opciones, onCambio }: { etiqueta: string; valor: T; opciones: { id: T; nombre: string }[]; onCambio: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="rotulo mb-1">{etiqueta}</legend>
      <div className="grid grid-cols-3 gap-1.5">
        {opciones.map((o) => (
          <button key={o.id} type="button" className="fila-check justify-center" aria-pressed={valor === o.id} onClick={() => onCambio(o.id)}>{o.nombre}</button>
        ))}
      </div>
    </fieldset>
  );
}

export default function CompensacionEconomicaPanel() {
  const game = useGame();
  const { personaje, flags, ce } = game;
  const [paso, setPaso] = useState(0);
  const [f, setF] = useState<FactoresCE>({
    duracionMatrimonioAños: 10,
    edadConyugeBeneficiario: 45,
    saludDeficiente: false,
    situacionPrevisional: "deficitaria",
    calificacionProfesional: "baja",
    accesoMercadoLaboral: "dificil",
    dedicacionExclusivaHogar: true,
    colaboracionActividadConyuge: false,
  });
  const [modalidad, setModalidad] = useState<ModalidadPagoCE>("cuotas_reajustables");
  const cap = capitulo("compensacion_economica")!;
  const progreso = progresoCapitulo("compensacion_economica", game);

  const culpable = flags.includes("incumplio_131") || flags.includes("prueba_infidelidad") || flags.includes("denuncia_vif");
  const bloqueoCulpa = culpable; // simplificación: si el demandante incurrió en causal culposa
  const calculo = calcularCompensacionEconomica(f);

  function acordar() {
    if (useGame.getState().ce) return;
    game.setCE({
      beneficiario: personaje.sexo === "femenino" ? "mujer" : "marido",
      factores: f,
      montoEstimado: calculo.monto,
      modalidad,
      bloqueadaPorCulpaGrave: bloqueoCulpa,
      acordada: true,
      ejecutoriada: true,
    });
    game.pushLog(`Compensación económica acordada: ${pesos(calculo.monto)} en modalidad ${modalidad}.`, "Art. 65 LMC");
  }

  if (ce) {
    const m = MODALIDADES.find((x) => x.id === ce.modalidad);
    return (
      <Actividad titulo="Compensación acordada" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} lugar="tribunal" retrato="jueza" animo={ce.bloqueadaPorCulpaGrave ? "duda" : "aprueba"}>
        <div className="cuerpo">
          <Consecuencia
            tono="exito"
            titulo={`${pesos(ce.montoEstimado)} · ${m?.nombre ?? ce.modalidad}`}
            narrativa={ce.bloqueadaPorCulpaGrave ? "Consta causal culposa imputable al demandante: el juez podía denegar o disminuir prudencialmente el monto (art. 62 inc. 2° LMC)." : "Acuerdo aprobado y ejecutoriado. La cifra quedará en tu epílogo."}
            deltas={[{ texto: `Compensación: ${pesos(ce.montoEstimado)}`, signo: "+", tono: "oro" }]}
            regla={{ articulo: "Art. 65 LMC", texto: m?.desc, codex: "62" }}
          />
        </div>
        <div className="barra-accion"><Link href="/liquidacion" className="btn btn-primario">Ir a liquidación <Icono nombre="division" tam={18} /></Link></div>
      </Actividad>
    );
  }

  return (
    <Actividad
      titulo={`${paso + 1}/${PASOS.length} · ${PASOS[paso]}`}
      objetivo={cap.objetivo}
      progreso={progreso}
      regla={REGLA}
      introClave="intro:ce"
      lugar="tribunal"
      retrato="jueza"
    >
      <div className="cuerpo gap-3">
        {paso === 0 && (
          <>
            <Contador etiqueta="Duración del matrimonio" sufijo="años" valor={f.duracionMatrimonioAños} min={0} max={70} onCambio={(v) => setF({ ...f, duracionMatrimonioAños: v })} />
            <Contador etiqueta="Edad del beneficiario" sufijo="años" valor={f.edadConyugeBeneficiario} min={18} max={100} onCambio={(v) => setF({ ...f, edadConyugeBeneficiario: v })} />
            <div className="grid gap-1.5">
              {([
                ["saludDeficiente", "Salud deficiente"],
                ["dedicacionExclusivaHogar", "Dedicación exclusiva al hogar e hijos"],
                ["colaboracionActividadConyuge", "Colaboración en actividad del otro"],
              ] as const).map(([k, label]) => (
                <button key={k} type="button" role="checkbox" aria-checked={f[k]} className="fila-check" onClick={() => setF({ ...f, [k]: !f[k] })}>
                  <span className="caja" aria-hidden>{f[k] && <Icono nombre="check" tam={16} grosor={3} />}</span>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
        {paso === 1 && (
          <>
            <Segmentado etiqueta="Situación previsional" valor={f.situacionPrevisional} onCambio={(v) => setF({ ...f, situacionPrevisional: v })} opciones={[{ id: "deficitaria", nombre: "deficitaria" }, { id: "media", nombre: "media" }, { id: "suficiente", nombre: "suficiente" }]} />
            <Segmentado etiqueta="Calificación profesional" valor={f.calificacionProfesional} onCambio={(v) => setF({ ...f, calificacionProfesional: v })} opciones={[{ id: "baja", nombre: "baja" }, { id: "media", nombre: "media" }, { id: "alta", nombre: "alta" }]} />
            <Segmentado etiqueta="Acceso al mercado laboral" valor={f.accesoMercadoLaboral} onCambio={(v) => setF({ ...f, accesoMercadoLaboral: v })} opciones={[{ id: "imposible", nombre: "imposible" }, { id: "dificil", nombre: "difícil" }, { id: "factible", nombre: "factible" }]} />
          </>
        )}
        {paso === 2 && (
          <>
            <div>
              <div className="rotulo">Monto estimado</div>
              <p className="t-display txt-oro cifra">{pesos(calculo.monto)}</p>
            </div>
            {bloqueoCulpa && (
              <p className="tarjeta border-rojo/60 t-meta txt-rojo flex gap-2" role="alert">
                <Icono nombre="alerta" tam={18} className="mt-0.5" />
                <span>Causal culposa imputable al demandante (flags activos). El art. 62 inc. 2° LMC autoriza al juez a DENEGAR o disminuir prudencialmente el monto.</span>
              </p>
            )}
            <Paginado
              items={calculo.desglose}
              clave={(d) => d.factor}
              etiqueta="Factores"
              gap={4}
              render={(d) => (
                <div className="flex items-start justify-between gap-2 t-meta border-b border-tinta-600 pb-1">
                  <span className="txt-2">{d.factor} <span className="articulo ml-1">{d.articulo}</span></span>
                  <span className="txt-cian cifra shrink-0">+{pesos(d.aporte)}</span>
                </div>
              )}
            />
          </>
        )}
        {paso === 3 && (
          <Paginado
            items={MODALIDADES}
            clave={(m) => m.id}
            etiqueta="Modalidades"
            columnas={(w) => (w > 760 ? 2 : 1)}
            render={(m) => (
              <button type="button" className="eleccion h-full" aria-pressed={modalidad === m.id} onClick={() => setModalidad(m.id)}>
                <span className="flex items-center gap-2 w-full">
                  <span className="caja" aria-hidden>{modalidad === m.id && <Icono nombre="check" tam={16} grosor={3} />}</span>
                  <span className="font-bold txt-1">{m.nombre}</span>
                </span>
                <span className="t-base txt-2">{m.desc}</span>
              </button>
            )}
          />
        )}
      </div>
      <div className="barra-accion">
        {paso > 0 && <button type="button" className="btn btn-secundario" onClick={() => setPaso(paso - 1)}><Icono nombre="flechaIzq" tam={18} /> Atrás</button>}
        {paso < PASOS.length - 1 ? (
          <button type="button" className="btn btn-primario" onClick={() => setPaso(paso + 1)}>
            {paso === 1 ? "Calcular" : "Siguiente"} <Icono nombre="flechaDer" tam={18} />
          </button>
        ) : (
          <button type="button" className="btn btn-primario" onClick={acordar}>Acordar y ejecutoriar <Icono nombre="balanza" tam={18} /></button>
        )}
      </div>
    </Actividad>
  );
}
