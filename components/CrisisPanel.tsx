"use client";
// Crisis matrimonial. Eliges qué crisis enfrentar; cada una se resuelve una vez
// por ciclo (antes, al volver al capítulo, se podían repetir y acumular efectos).
// El cónyuge reacciona y la decisión deja prueba (antecedente) o herida.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad from "@/components/ui/Actividad";
import Consecuencia, { BotonContinuar } from "@/components/ui/Consecuencia";
import { Paginado, useLectura } from "@/components/ui/Ajuste";
import Icono, { type NombreIcono } from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import { animoDe, type Delta } from "@/lib/deltas";

type Accion = { label: string; art?: string; efecto: () => void; log: string };
type Evento = { id: string; titulo: string; desc: string; icono: NombreIcono; acciones: Accion[] };

function Medidor({ label, value }: { label: string; value: number }) {
  const pct = ((value + 100) / 200) * 100;
  return (
    <div className="min-w-0 flex-1" role="img" aria-label={`${label} del cónyuge: ${value}`}>
      <div className="flex justify-between t-meta"><span className="txt-3">{label}</span><span className="cifra">{value}</span></div>
      <div className="progreso mt-1" aria-hidden><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function CrisisPanel() {
  const game = useGame();
  const { conyuge, hechos } = game;
  const [abierto, setAbierto] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ evento: Evento; accion: Accion; deltas: Delta[] } | null>(null);
  const lectura = useLectura();
  const cap = capitulo("crisis")!;
  const progreso = progresoCapitulo("crisis", game);

  if (!conyuge) {
    return (
      <Actividad titulo="Crisis matrimonial" objetivo={cap.objetivo} lugar="hotel" retrato="instinto">
        <div className="cuerpo"><p className="tarjeta t-lectura txt-2">Necesitas estar casado para experimentar crisis. Vuelve al matrimonio.</p></div>
        <div className="barra-accion"><Link href="/mundo/matrimonio" className="btn btn-primario">Ir al matrimonio</Link></div>
      </Actividad>
    );
  }

  const cy = () => useGame.getState().conyuge!;
  const eventos: Evento[] = [
    {
      id: "infidelidad", icono: "ojo",
      titulo: "Mensajes en el teléfono",
      desc: "Hay mensajes con horario nocturno y emojis ambiguos. El art. 132 CC define el adulterio como grave infracción al deber de fidelidad.",
      acciones: [
        { label: "Confrontar honestamente", art: "Art. 132 CC", efecto: () => { const c = cy(); game.setConyuge({ ...c, confianza: c.confianza - 20, infidelidades: c.infidelidades + 1, deberesCumplidos: Math.max(0, c.deberesCumplidos - 15) }); game.ajustarTrauma(6); game.addIncumplimiento({ id: `inc-crisis-infidelidad-c${game.personaje.cicloVital}`, deber: "fidelidad", fecha: Date.now(), detalle: "Confrontación por infidelidad detectada", articulo: "Art. 132 CC", habilitaCulpa: false }); }, log: "Confrontaste. La confianza se quiebra." },
        { label: "Acopiar prueba para divorcio culposo", art: "Art. 54 N°2 LMC", efecto: () => { const c = cy(); game.setFlag("prueba_infidelidad"); game.setConyuge({ ...c, infidelidades: c.infidelidades + 1 }); game.addIncumplimiento({ id: `inc-crisis-prueba-c${game.personaje.cicloVital}`, deber: "fidelidad", fecha: Date.now(), detalle: "Transgresión grave y reiterada", articulo: "Art. 54 N°2 LMC", habilitaCulpa: true }); }, log: "Acopiaste prueba para causal culpable." },
        { label: "Ignorar", efecto: () => { game.ajustarTrauma(3); }, log: "Reprimiste. El trauma crece silencioso." },
      ],
    },
    {
      id: "ocultar_bienes", icono: "cofre",
      titulo: "Tentación: ocultar un bien social",
      desc: "Puedes simular una venta a un tercero para sacarlo del haber. La nulidad por simulación está siempre disponible.",
      acciones: [
        { label: "Simular venta (fraude)", art: "Art. 1723 inc. 2 / nulidad", efecto: () => { game.setFlag("fraude_simulacion"); game.ajustarReputacion(-15); game.addBien({ id: `oc-c${game.personaje.cicloVital}`, nombre: "Bien ocultado simuladamente", valor: 20_000_000, naturaleza: "mueble", clase: "haber_absoluto", fuente: "compra", oculto: true }); }, log: "Simulaste enajenación. Acción de nulidad acecha." },
        { label: "Mantener honestidad patrimonial", efecto: () => game.ajustarReputacion(4), log: "Decidiste no simular. Tu nombre limpio." },
      ],
    },
    {
      id: "vif", icono: "alerta",
      titulo: "Violencia intrafamiliar (Ley 20.066)",
      desc: "Una noche el alcohol y el grito. Los Tribunales de Familia conocen las medidas cautelares (arts. 7-9 Ley 20.066).",
      acciones: [
        { label: "Denunciar VIF", art: "Ley 20.066", efecto: () => { game.setFlag("denuncia_vif"); game.setConyuge({ ...cy(), vif: true }); game.addIncumplimiento({ id: `inc-crisis-vif-c${game.personaje.cicloVital}`, deber: "respeto_proteccion", fecha: Date.now(), detalle: "Denuncia VIF", articulo: "Art. 131 CC / Ley 20.066", habilitaCulpa: true }); }, log: "Denunciaste VIF. Medidas cautelares solicitadas." },
        { label: "Callar", efecto: () => { game.ajustarTrauma(12); game.setConyuge({ ...cy(), vif: true }); }, log: "Callaste. El trauma se enquista." },
      ],
    },
    {
      id: "alcoholismo", icono: "trauma",
      titulo: "Espiral",
      desc: "Dependencia que impide la vida en común. Causal del art. 54 N°5 LMC: alcoholismo o drogadicción.",
      acciones: [
        { label: "Pedir tratamiento", efecto: () => { const c = cy(); game.setConyuge({ ...c, alcoholismo: true, confianza: c.confianza - 10 }); }, log: "Buscaste tratamiento. La esperanza es un activo intangible." },
        { label: "Documentar conducta", art: "Art. 54 N°5 LMC", efecto: () => { game.setFlag("prueba_alcoholismo"); game.addIncumplimiento({ id: `inc-crisis-alcohol-c${game.personaje.cicloVital}`, deber: "vida_en_comun", fecha: Date.now(), detalle: "Alcoholismo grave", articulo: "Art. 54 N°5 LMC", habilitaCulpa: true }); }, log: "Documentaste para causal culpable." },
      ],
    },
    {
      id: "ruptura", icono: "rayo",
      titulo: "El punto sin retorno",
      desc: "Decides que ya no. Marca la ruptura definitiva: habilita el camino del cese y la separación.",
      acciones: [
        { label: "Declarar ruptura interna", efecto: () => { game.setFlag("ruptura_definitiva"); game.ajustarTrauma(15); game.pushLog("Marcaste ruptura definitiva. Avanzar a cese de convivencia.", "RUPTURA"); }, log: "Cruzaste el umbral. Ya no hay vuelta." },
      ],
    },
  ];

  function ejecutar(e: Evento, idx: number) {
    const a = e.acciones[idx];
    let hecho = false;
    const antes = cy();
    const deltas = conCambios(() => {
      hecho = game.registrarHecho(`crisis:${e.id}`, idx);
      if (!hecho) return;
      a.efecto();
      game.pushLog(a.log, a.art);
    });
    if (!hecho) return;
    const despues = cy();
    if (despues.confianza !== antes.confianza) deltas.unshift({ texto: `Confianza del cónyuge ${despues.confianza > antes.confianza ? "+" : "−"}${Math.abs(despues.confianza - antes.confianza)}`, signo: despues.confianza > antes.confianza ? "+" : "−", tono: despues.confianza > antes.confianza ? "verde" : "rojo" });
    setAbierto(null);
    setResultado({ evento: e, accion: a, deltas });
  }

  const ev = eventos.find((x) => x.id === abierto);
  const ruptura = game.flags.includes("ruptura_definitiva");

  if (resultado) {
    return (
      <Actividad titulo={resultado.evento.titulo} progreso={progreso} lugar="hotel" retrato="conyuge" animo={animoDe(resultado.deltas) === "aprueba" ? "neutral" : animoDe(resultado.deltas)}>
        <div className="cuerpo">
          <Consecuencia
            reinicio={resultado.evento.id}
            lectura={lectura}
            tono={resultado.deltas.some((d) => d.tono === "rojo") ? "fallo" : "neutral"}
            titulo={resultado.accion.label}
            narrativa={resultado.accion.log}
            deltas={resultado.deltas}
            regla={resultado.accion.art ? { articulo: resultado.accion.art, texto: resultado.evento.desc, codex: "54" } : undefined}
          />
        </div>
        <div className="barra-accion">
          {resultado.evento.id === "ruptura" && <Link href="/mundo/cese_convivencia" className="btn btn-secundario">Ir al cese de convivencia</Link>}
          <BotonContinuar lectura={lectura} onClick={() => setResultado(null)}>Continuar <Icono nombre="flechaDer" tam={18} /></BotonContinuar>
        </div>
      </Actividad>
    );
  }

  if (ev) {
    return (
      <Actividad titulo={ev.titulo} objetivo={cap.objetivo} lugar="hotel" retrato="conyuge" animo="duda">
        <div className="flex gap-3"><Medidor label="Afecto" value={conyuge.afecto} /><Medidor label="Confianza" value={conyuge.confianza} /></div>
        <p className="t-lectura txt-1">{ev.desc}</p>
        <div className="cuerpo">
          <Paginado
            items={ev.acciones}
            clave={(a) => a.label}
            etiqueta="Opciones"
            render={(a, i) => (
              <button type="button" className="opcion" onClick={() => ejecutar(ev, i)}>
                <span className="tecla" aria-hidden>{i + 1}</span>
                <span className="flex-1 min-w-0">
                  <span className="block">{a.label}</span>
                  {a.art && <span className="articulo mt-1">{a.art}</span>}
                </span>
              </button>
            )}
          />
        </div>
        <div className="barra-accion">
          <button type="button" className="btn btn-secundario" onClick={() => setAbierto(null)}><Icono nombre="flechaIzq" tam={18} /> Elegir otra crisis</button>
        </div>
      </Actividad>
    );
  }

  return (
    <Actividad
      titulo="Crisis matrimonial"
      objetivo={cap.objetivo}
      progreso={progreso}
      lugar="hotel"
      retrato="conyuge"
      regla={{ titulo: "Crisis y causales", parrafos: ["Cada elección altera la causal de divorcio (art. 54 LMC), la procedencia de compensación económica (art. 62 inc. 2°) y tu reputación."], articulo: "Arts. 54 y 62 inc. 2° LMC" }}
      introClave="intro:crisis"
    >
      <div className="flex gap-3"><Medidor label="Afecto" value={conyuge.afecto} /><Medidor label="Confianza" value={conyuge.confianza} /></div>
      <div className="cuerpo">
        <Paginado
          items={eventos}
          clave={(e) => e.id}
          etiqueta="Crisis"
          columnas={(w) => (w > 760 ? 2 : 1)}
          render={(e) => {
            const hecho = `crisis:${e.id}` in hechos;
            const elegida = hecho ? e.acciones[Number(hechos[`crisis:${e.id}`])] : undefined;
            return (
              <button type="button" className="eleccion h-full" disabled={hecho} onClick={() => setAbierto(e.id)}>
                <span className="flex items-center gap-2 w-full">
                  <Icono nombre={e.icono} tam={22} className={hecho ? "txt-3" : "txt-oro"} />
                  <span className="font-display font-bold flex-1">{e.titulo}</span>
                  {hecho && <Icono nombre="check" tam={18} className="txt-verde" />}
                </span>
                <span className="t-meta txt-2">{hecho ? `Resuelto: ${elegida?.label ?? ""}` : "Pendiente"}</span>
              </button>
            );
          }}
        />
      </div>
      {ruptura && (
        <div className="barra-accion">
          <Link href="/mundo/cese_convivencia" className="btn btn-primario">Avanzar al cese de convivencia <Icono nombre="flechaDer" tam={18} /></Link>
        </div>
      )}
    </Actividad>
  );
}
