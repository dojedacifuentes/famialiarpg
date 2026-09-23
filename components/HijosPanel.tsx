"use client";
// Filiación, alimentos y cuidado personal. Inscribir un nacimiento es un paso
// propio (formulario corto); cada hijo es una ficha con sus decisiones.
import { useState } from "react";
import { useGame } from "@/store/useGame";
import type { Hijo } from "@/types/game";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad from "@/components/ui/Actividad";
import { Paginado } from "@/components/ui/Ajuste";
import { ListaDeltas } from "@/components/ui/Consecuencia";
import Icono from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";

const NOMBRES = ["Sofía", "Tomás", "Antonia", "Vicente", "Ignacia", "Joaquín", "Camila", "Diego"];
const FILIACIONES: { id: Hijo["filiacion"]; nombre: string }[] = [
  { id: "matrimonial", nombre: "Matrimonial" },
  { id: "no_matrimonial", nombre: "No matrimonial" },
  { id: "adoptiva", nombre: "Adoptiva" },
];

const REGLA = {
  titulo: "Filiación, alimentos y cuidado personal",
  parrafos: [
    "Filiación con iguales efectos (art. 33 CC, Ley 19.585). Alimentos (Ley 14.908 y 21.389: RNDPA). Cuidado personal (art. 225 CC; preferente la madre salvo acuerdo o resolución judicial). Relación directa y regular (art. 229 CC).",
  ],
  articulo: "Art. 33, 225, 229 CC · Leyes 14.908, 21.389",
};

export default function HijosPanel() {
  const game = useGame();
  const { hijos } = game;
  const [inscribiendo, setInscribiendo] = useState(false);
  const [nombre, setNombre] = useState("");
  const [filiacion, setFiliacion] = useState<Hijo["filiacion"]>("matrimonial");
  const [cambios, setCambios] = useState<Record<string, Delta[]>>({});
  const cap = capitulo("hijos")!;
  const progreso = progresoCapitulo("hijos", game);
  const mostrarFormulario = inscribiendo || hijos.length === 0;

  function crearHijo() {
    const n = nombre.trim() || NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    const h: Hijo = {
      id: `h${Date.now()}`,
      nombre: n,
      edad: 0,
      filiacion,
      reconocido: filiacion !== "no_matrimonial",
      cuidadoPersonal: filiacion === "matrimonial" ? "compartido" : "madre",
      alimentosAlDia: true,
      afecto: 80,
      trauma: 0,
      recuerdos: ["Nací bajo el imperio del art. 33 CC."],
    };
    game.addHijo(h);
    game.pushLog(`Nace ${n} (${filiacion.replace(/_/g, " ")}).`, "FILIACIÓN");
    setNombre("");
    setInscribiendo(false);
  }

  function accion(h: Hijo, fn: () => void, decision = true) {
    const d = conCambios(fn);
    if (decision) game.registrarHecho("hijos:decision");
    setCambios((c) => ({ ...c, [h.id]: d }));
  }

  const reconocer = (h: Hijo) => accion(h, () => {
    game.updateHijo(h.id, { reconocido: true, recuerdos: [...h.recuerdos, "Fui reconocido formalmente."] });
    game.ajustarReputacion(3);
    game.pushLog(`Reconociste a ${h.nombre}. Art. 187 CC.`, "Art. 187 CC");
  });
  const noPagarAlimentos = (h: Hijo) => accion(h, () => {
    game.updateHijo(h.id, { alimentosAlDia: false, afecto: Math.max(-100, h.afecto - 15), trauma: h.trauma + 10, recuerdos: [...h.recuerdos, "Dejaste de pagar mis alimentos."], rndpa: true });
    game.ajustarReputacion(-10);
    game.ajustarTrauma(4);
    game.pushLog(`Incumpliste alimentos respecto de ${h.nombre}. Apremio personal posible (Ley 14.908). Inscripción en RNDPA (Ley 21.389).`, "Leyes 14.908 / 21.389");
  });
  const pagar = (h: Hijo) => accion(h, () => {
    game.updateHijo(h.id, { alimentosAlDia: true, afecto: Math.min(100, h.afecto + 10), recuerdos: [...h.recuerdos, "Pagaste mis alimentos al día."], rndpa: false });
    game.ajustarReputacion(2);
    game.pushLog(`Pagaste alimentos a ${h.nombre}.`);
  });
  const crecer = (h: Hijo) => accion(h, () => {
    game.updateHijo(h.id, { edad: h.edad + 5, recuerdos: [...h.recuerdos, `Cumplí ${h.edad + 5} años.`] });
  }, false);
  const cambiarCuidado = (h: Hijo) => accion(h, () => {
    const next = h.cuidadoPersonal === "compartido" ? "madre" : h.cuidadoPersonal === "madre" ? "padre" : "compartido";
    game.updateHijo(h.id, { cuidadoPersonal: next, recuerdos: [...h.recuerdos, `El cuidado personal pasó a ${next}.`] });
    game.pushLog(`Cambio de cuidado personal de ${h.nombre} a ${next}.`, "Art. 225 CC");
  });

  if (mostrarFormulario) {
    return (
      <Actividad titulo="Inscribir un nacimiento" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} introClave="intro:hijos" lugar="hogar">
        <form className="cuerpo gap-3" onSubmit={(e) => { e.preventDefault(); crearHijo(); }}>
          <label className="block">
            <span className="rotulo">Nombre (opcional)</span>
            <input className="campo mt-1" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" autoComplete="off" enterKeyHint="done" />
          </label>
          <fieldset>
            <legend className="rotulo mb-1">Filiación</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {FILIACIONES.map((f) => (
                <button key={f.id} type="button" className="fila-check" aria-pressed={filiacion === f.id} onClick={() => setFiliacion(f.id)}>
                  <span className="caja" aria-hidden>{filiacion === f.id && <Icono nombre="check" tam={16} grosor={3} />}</span>
                  {f.nombre}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="barra-accion">
            {hijos.length > 0 && <button type="button" className="btn btn-secundario" onClick={() => setInscribiendo(false)}>Cancelar</button>}
            <button type="submit" className="btn btn-primario"><Icono nombre="mas" tam={18} /> Inscribir nacimiento</button>
          </div>
        </form>
      </Actividad>
    );
  }

  return (
    <Actividad
      titulo="Tus hijos"
      objetivo={cap.objetivo}
      progreso={progreso}
      regla={REGLA}
      lugar="hogar"
      accion={
        <button type="button" className="btn btn-secundario" onClick={() => setInscribiendo(true)} aria-label="Inscribir otro nacimiento" title="Inscribir otro nacimiento">
          <Icono nombre="mas" tam={18} /><span className="hidden sm:inline">Inscribir</span>
        </button>
      }
    >
      <div className="cuerpo">
        <Paginado
          items={hijos}
          clave={(h) => h.id}
          etiqueta="Hijos"
          columnas={(w) => (w > 760 ? 2 : 1)}
          render={(h) => (
            <article className="tarjeta h-full flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icono nombre="hijo" tam={26} className="txt-oro" />
                <h3 className="font-display font-bold txt-1 flex-1">{h.nombre}</h3>
                <span className="t-meta txt-2">{h.edad} años · {h.filiacion.replace(/_/g, " ")}</span>
              </div>
              <ul className="flex flex-wrap gap-1" aria-label={`Estado de ${h.nombre}`}>
                <li className="insignia" data-tono={h.afecto > 0 ? "verde" : "rojo"}>Afecto {h.afecto}</li>
                <li className="insignia" data-tono={h.trauma > 0 ? "rojo" : undefined}>Trauma {h.trauma}</li>
                <li className="insignia" data-tono={h.alimentosAlDia ? "verde" : "rojo"}>Alimentos: {h.alimentosAlDia ? "al día" : "en mora · RNDPA"}</li>
                <li className="insignia">Reconocido: {h.reconocido ? "sí" : "no"}</li>
                <li className="insignia">Cuidado: {h.cuidadoPersonal}</li>
              </ul>
              <div className="grid grid-cols-2 gap-1.5">
                {!h.reconocido && <button type="button" className="btn btn-secundario" onClick={() => reconocer(h)}>Reconocer (187)</button>}
                {h.alimentosAlDia
                  ? <button type="button" className="btn btn-peligro" onClick={() => noPagarAlimentos(h)}>No pagar alimentos</button>
                  : <button type="button" className="btn btn-secundario" onClick={() => pagar(h)}>Pagar alimentos</button>}
                <button type="button" className="btn btn-secundario" onClick={() => cambiarCuidado(h)}>Cambiar cuidado (225)</button>
                <button type="button" className="btn btn-secundario" onClick={() => crecer(h)}>+5 años</button>
              </div>
              {cambios[h.id] && <ListaDeltas deltas={cambios[h.id]} />}
              <p className="t-meta txt-3 italic">Memoria: {h.recuerdos.slice(-2).join(" · ")}</p>
            </article>
          )}
        />
      </div>

    </Actividad>
  );
}
