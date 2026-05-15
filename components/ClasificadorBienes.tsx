"use client";
import { useMemo, useState } from "react";
import { useGame } from "@/store/useGame";
import { clasificarBien } from "@/lib/reglas";
import type { Bien, ClaseBien, NaturalezaBien } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";

type Caso = {
  nombre: string;
  valor: number;
  naturaleza: NaturalezaBien;
  fuente: Bien["fuente"];
  tituloOnerosoOGratuito?: "oneroso" | "gratuito";
  adquiridoAntesDelMatrimonio?: boolean;
  subroga?: { delConyuge: "marido" | "mujer"; eraInmueble: boolean };
  pista: string;
};

// 22 casos rigurosos cubriendo todas las hipótesis del art. 1725 + 150 + 1726 + 1736 + 1727 + 1733 + 1739 + 1746.
const CASOS: Caso[] = [
  // -- HABER ABSOLUTO (art. 1725 N°1) --
  { nombre: "Sueldo del marido devengado en marzo", valor: 1_500_000, naturaleza: "dinero", fuente: "trabajo", tituloOnerosoOGratuito: "oneroso", pista: "Salario devengado durante la sociedad. Art. 1725 N°1." },
  { nombre: "Bono de fin de año del marido", valor: 2_500_000, naturaleza: "dinero", fuente: "trabajo", tituloOnerosoOGratuito: "oneroso", pista: "Emolumento del empleo." },
  { nombre: "Honorarios profesionales del marido", valor: 4_000_000, naturaleza: "dinero", fuente: "trabajo", tituloOnerosoOGratuito: "oneroso", pista: "Producto del trabajo durante la vigencia." },

  // -- PATRIMONIO RESERVADO ART. 150 --
  { nombre: "Sueldo de la mujer en empresa propia (trabajo separado del marido)", valor: 1_800_000, naturaleza: "dinero", fuente: "trabajo_separado_mujer", pista: "Trabajo separado de la mujer en SC: patrimonio reservado." },
  { nombre: "Inmueble adquirido por la mujer con su sueldo separado", valor: 50_000_000, naturaleza: "inmueble", fuente: "trabajo_separado_mujer", pista: "Adquirido con producto del trabajo separado." },
  { nombre: "Honorarios docentes de la mujer (cátedra particular)", valor: 600_000, naturaleza: "dinero", fuente: "trabajo_separado_mujer", pista: "Trabajo separado de la mujer." },

  // -- HABER ABSOLUTO (art. 1725 N°2) — Frutos --
  { nombre: "Cosecha del fundo propio del marido", valor: 4_000_000, naturaleza: "fungible", fuente: "frutos", pista: "Frutos naturales de bien propio: haber absoluto." },
  { nombre: "Intereses bancarios devengados durante la sociedad", valor: 800_000, naturaleza: "dinero", fuente: "frutos", pista: "Frutos civiles." },
  { nombre: "Renta de arrendamiento del inmueble propio de la mujer", valor: 1_200_000, naturaleza: "dinero", fuente: "frutos", pista: "Frutos civiles de bien propio durante la sociedad." },

  // -- HABER ABSOLUTO (art. 1725 N°5) — Adquisiciones a título oneroso durante --
  { nombre: "Auto comprado durante el matrimonio con dineros sociales", valor: 12_000_000, naturaleza: "mueble", fuente: "compra", tituloOnerosoOGratuito: "oneroso", pista: "Mueble adquirido a título oneroso durante vigencia." },
  { nombre: "Departamento comprado durante el matrimonio", valor: 90_000_000, naturaleza: "inmueble", fuente: "compra", tituloOnerosoOGratuito: "oneroso", pista: "Inmueble adquirido a título oneroso durante vigencia." },
  { nombre: "Acciones bursátiles compradas con utilidades sociales", valor: 20_000_000, naturaleza: "valor_mobiliario", fuente: "compra", tituloOnerosoOGratuito: "oneroso", pista: "Valor mobiliario adquirido a título oneroso." },

  // -- BIEN PROPIO (art. 1726) — Inmueble a título gratuito durante --
  { nombre: "Casa heredada del abuelo del marido durante el matrimonio", valor: 80_000_000, naturaleza: "inmueble", fuente: "herencia", tituloOnerosoOGratuito: "gratuito", pista: "Inmueble adquirido a título gratuito durante: propio del heredero." },
  { nombre: "Parcela donada a la mujer por su madre durante el matrimonio", valor: 60_000_000, naturaleza: "inmueble", fuente: "donacion", tituloOnerosoOGratuito: "gratuito", pista: "Inmueble a título gratuito durante vigencia: propio." },

  // -- HABER RELATIVO (art. 1725 N°4) — Mueble a título gratuito durante --
  { nombre: "Joyas donadas por una tía al marido durante el matrimonio", valor: 2_000_000, naturaleza: "mueble", fuente: "donacion", tituloOnerosoOGratuito: "gratuito", pista: "Mueble a título gratuito durante vigencia: haber relativo con recompensa." },
  { nombre: "Auto recibido como legado por la mujer durante el matrimonio", valor: 15_000_000, naturaleza: "mueble", fuente: "herencia", tituloOnerosoOGratuito: "gratuito", pista: "Mueble a título gratuito durante vigencia." },

  // -- HABER RELATIVO (art. 1725 N°3) — Dinero --
  { nombre: "Premio en efectivo recibido por la mujer durante el matrimonio", valor: 5_000_000, naturaleza: "dinero", fuente: "donacion", tituloOnerosoOGratuito: "gratuito", pista: "Dinero a título gratuito durante vigencia: art. 1725 N°3." },

  // -- BIENES APORTADOS ANTES DEL MATRIMONIO --
  { nombre: "Inmueble adquirido por el marido antes del matrimonio", valor: 100_000_000, naturaleza: "inmueble", fuente: "compra", adquiridoAntesDelMatrimonio: true, tituloOnerosoOGratuito: "oneroso", pista: "Inmueble anterior al matrimonio: propio (art. 1736)." },
  { nombre: "Mil libros aportados al casarse", valor: 3_000_000, naturaleza: "mueble", fuente: "compra", adquiridoAntesDelMatrimonio: true, tituloOnerosoOGratuito: "oneroso", pista: "Muebles aportados al matrimonio: haber relativo." },
  { nombre: "$10.000.000 en cuenta de ahorro aportados al casarse", valor: 10_000_000, naturaleza: "dinero", fuente: "compra", adquiridoAntesDelMatrimonio: true, pista: "Dinero aportado al matrimonio: haber relativo art. 1725 N°3." },

  // -- SUBROGACIÓN REAL --
  { nombre: "Inmueble adquirido en subrogación del inmueble propio anterior del marido", valor: 70_000_000, naturaleza: "inmueble", fuente: "subrogacion", subroga: { delConyuge: "marido", eraInmueble: true }, pista: "Subrogación de inmueble propio: art. 1727 N°1 y 1733." },

  // -- MEJORAS A BIEN PROPIO CON DINEROS SOCIALES (art. 1746) --
  { nombre: "Ampliación del inmueble propio del marido pagada con dineros sociales", valor: 8_000_000, naturaleza: "inmueble", fuente: "mejora_propio", pista: "Mejora a bien propio con dineros sociales: el bien sigue siendo propio pero la sociedad tiene recompensa (art. 1746)." },

  // -- INDEMNIZACIÓN --
  { nombre: "Indemnización por accidente laboral del marido durante el matrimonio", valor: 6_000_000, naturaleza: "dinero", fuente: "indemnizacion", pista: "Indemnización durante la vigencia: regla general haber absoluto." },
];

const CLASES: { id: ClaseBien; nombre: string; color: string }[] = [
  { id: "haber_absoluto", nombre: "Haber Absoluto", color: "border-neon-blue text-neon-blue" },
  { id: "haber_relativo", nombre: "Haber Relativo (con recompensa)", color: "border-neon-violet text-neon-violet" },
  { id: "propio_marido", nombre: "Propio Marido", color: "border-neon-amber text-neon-amber" },
  { id: "propio_mujer", nombre: "Propio Mujer", color: "border-neon-amber text-neon-amber" },
  { id: "reservado_art150", nombre: "Reservado Art. 150", color: "border-neon-cyan text-neon-cyan" },
];

export default function ClasificadorBienes() {
  const game = useGame();
  const [i, setI] = useState(0);
  const [feedback, setFeedback] = useState<null | { ok: boolean; justif: string; art: string; correcta: ClaseBien }>(null);
  const [aciertos, setAciertos] = useState(0);

  const caso = CASOS[i];
  const correcta = useMemo(
    () => (caso ? clasificarBien({ id: "x", nombre: caso.nombre, valor: caso.valor, naturaleza: caso.naturaleza, fuente: caso.fuente, tituloOnerosoOGratuito: caso.tituloOnerosoOGratuito, adquiridoAntesDelMatrimonio: caso.adquiridoAntesDelMatrimonio, subroga: caso.subroga }, game.personaje.sexo) : null),
    [caso, game.personaje.sexo]
  );

  if (!caso) {
    const porcentaje = Math.round((aciertos / CASOS.length) * 100);
    return (
      <div className="terminal p-6">
        <h2 className="label-art text-neon-blue text-xl mb-3">Clasificación completa</h2>
        <p className="text-parchment/70 text-sm mb-4">
          Resultado: <b className="text-neon-cyan">{aciertos}</b> de <b>{CASOS.length}</b> aciertos ({porcentaje}%).
          {porcentaje >= 80 && " Tu intuición patrimonial es notarial."}
          {porcentaje < 50 && " Vuelve al codex y relee los arts. 1725, 1726, 1727 y 1736."}
        </p>
        <p className="text-parchment/60 text-xs">Los bienes correctamente clasificados se han registrado en tu inventario.</p>
      </div>
    );
  }

  function elegir(c: ClaseBien) {
    if (!correcta) return;
    const ok = correcta.clase === c;
    setFeedback({ ok, justif: correcta.justificacion, art: correcta.articulo, correcta: correcta.clase });
    if (ok) {
      setAciertos((a) => a + 1);
      game.ajustarAtributo("inteligencia_juridica", 1);
      const bien: Bien = {
        id: `b${Date.now()}-${i}`,
        nombre: caso.nombre,
        valor: caso.valor,
        naturaleza: caso.naturaleza,
        fuente: caso.fuente,
        tituloOnerosoOGratuito: caso.tituloOnerosoOGratuito,
        adquiridoAntesDelMatrimonio: caso.adquiridoAntesDelMatrimonio,
        subroga: caso.subroga,
        clase: correcta.clase,
        generaRecompensa: correcta.recompensa,
      };
      game.addBien(bien);
      if (correcta.recompensa > 0) {
        game.addRecompensa({
          id: `r${Date.now()}-${i}`,
          acreedor: game.personaje.sexo === "femenino" ? "mujer" : "marido",
          deudor: "sociedad",
          monto: correcta.recompensa,
          motivo: `Por ${caso.nombre}`,
          articulo: correcta.articulo,
        });
      }
      game.pushLog(`Clasificaste correctamente: ${caso.nombre} → ${correcta.clase}`, correcta.articulo);
    } else {
      game.ajustarTrauma(1);
      game.pushLog(`Error en ${caso.nombre}. La doctrina te juzga.`, "GLITCH");
    }
  }

  const tituloLabel = caso.tituloOnerosoOGratuito ? ` · título ${caso.tituloOnerosoOGratuito}` : "";

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Clasificación del Haber (arts. 1725, 1726, 1727, 1736, 150 CC)</h2>
      <p className="text-parchment/60 text-xs">
        Distingue tres ejes: <b>naturaleza</b> (mueble/inmueble/dinero) — <b>título</b> (oneroso/gratuito) — <b>momento</b> (antes/durante). Si tu personaje es mujer en SC, recuerda el patrimonio reservado del art. 150.
      </p>

      <div className="terminal p-5">
        <div className="text-xs tag mb-2">CASO {i + 1} / {CASOS.length}</div>
        <div className="text-parchment text-lg label-art">{caso.nombre}</div>
        <div className="text-parchment/60 text-xs mt-1">
          Valor: ${caso.valor.toLocaleString("es-CL")} · Naturaleza: <b>{caso.naturaleza}</b> · Fuente: {caso.fuente.replace(/_/g, " ")}
          {tituloLabel} · {caso.adquiridoAntesDelMatrimonio ? "antes del matrimonio" : "durante el matrimonio"}
        </div>
        <div className="text-neon-violet text-xs italic mt-3">Pista: {caso.pista}</div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        {CLASES.map((c) => (
          <button
            key={c.id}
            disabled={!!feedback}
            onClick={() => elegir(c.id)}
            className={`p-3 border ${c.color} text-xs uppercase tracking-widest disabled:opacity-40`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`terminal p-4 ${feedback.ok ? "border-neon-blue" : "border-neon-red"}`}
          >
            <div className={`label-art ${feedback.ok ? "text-neon-blue" : "text-neon-red"}`}>
              {feedback.ok ? "✓ Clasificación correcta" : `✗ Incorrecto — la respuesta era: ${feedback.correcta}`}
            </div>
            <div className="text-parchment/80 text-xs mt-2">{feedback.justif}</div>
            <div className="tag tag-violet mt-2">{feedback.art}</div>
            <button className="btn mt-3" onClick={() => { setFeedback(null); setI((x) => x + 1); }}>
              ▸ Siguiente caso
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
