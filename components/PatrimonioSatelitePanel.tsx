"use client";
// Patrimonios satélite de la mujer casada (arts. 150, 166, 167 CC) y la opción
// irrevocable del art. 150 inc. final. La opción queda guardada y la leen la
// liquidación y el epílogo.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { clasificarSatelite, efectoOpcionGananciales } from "@/lib/reglas";
import type { Bien } from "@/types/game";
import { CASOS_SATELITE, type CasoSatelite } from "@/data/casos";
import { NOMBRE_CLASE, pesos } from "@/data/escenario";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad from "@/components/ui/Actividad";
import Consecuencia, { BotonContinuar } from "@/components/ui/Consecuencia";
import { Paginado, useLectura } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";

const OPCIONES: CasoSatelite["esperado"][] = ["reservado_art150", "satelite_art166", "satelite_art167", "haber_absoluto"];

const REGLA = {
  titulo: "Patrimonios satélite de la mujer casada",
  parrafos: [
    "El patrimonio reservado del art. 150 CC y los satélites de los arts. 166 y 167 son institutos privativos de la mujer casada en sociedad conyugal.",
    "Al disolverse la sociedad conyugal, la mujer debe optar (decisión IRREVOCABLE) entre aceptar o renunciar a los gananciales (art. 150 inc. final CC).",
  ],
  articulo: "Arts. 150, 166, 167 CC",
};

export default function PatrimonioSatelitePanel() {
  const game = useGame();
  const { personaje, hechos } = game;
  const [feedback, setFeedback] = useState<{ ok: boolean; texto: string; art: string; clase: string; deltas: Delta[]; i: number } | null>(null);
  const [preSel, setPreSel] = useState<"aceptar" | "renunciar" | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const lectura = useLectura();
  const cap = capitulo("patrimonios_satelite")!;
  const progreso = progresoCapitulo("patrimonios_satelite", game);

  if (personaje.sexo !== "femenino") {
    return (
      <Actividad titulo="Patrimonios satélite" objetivo={cap.objetivo} lugar="banco" retrato="ejecutiva">
        <div className="cuerpo">
          <Paginado
            items={[
              "El patrimonio reservado del art. 150 CC y los satélites de los arts. 166 y 167 son institutos privativos de la mujer casada en sociedad conyugal. En esta partida tu personaje es de sexo masculino: no procede esta sección.",
              "Reflexión doctrinaria: la asimetría es histórica y ha sido objeto de proyectos de reforma. Para fines didácticos, el código vigente mantiene la dicotomía marido/mujer en SC.",
            ]}
            clave={(_, i) => `m${i}`}
            render={(t, i) => <p className={i === 0 ? "t-lectura txt-1" : "t-base txt-2 italic"}>{t}</p>}
            gap={12}
          />
        </div>
        <div className="barra-accion"><Link href="/juego" className="btn btn-primario">Volver al mapa</Link></div>
      </Actividad>
    );
  }

  const pendiente = CASOS_SATELITE.findIndex((_, i) => !(`sat:${i}` in hechos));
  const opcion = hechos["opcion150"] as "aceptar" | "renunciar" | undefined;

  function elegir(c: CasoSatelite["esperado"]) {
    const i = pendiente;
    const caso = CASOS_SATELITE[i];
    if (!caso) return;
    const res = clasificarSatelite({ sexo: personaje.sexo, origen: caso.origen });
    const ok = res.clase === c;
    let registrado = false;
    const deltas = conCambios(() => {
      registrado = game.registrarHecho(`sat:${i}`, ok ? "ok" : "error");
      if (!registrado) return;
      if (ok) {
        game.ajustarAtributo("inteligencia_juridica", 1);
        const bien: Bien = {
          id: `sat-c${personaje.cicloVital}-${i}`,
          nombre: caso.nombre,
          valor: caso.valor,
          clase: res.clase,
          naturaleza: caso.valor > 30_000_000 ? "inmueble" : "mueble",
          fuente: caso.origen === "trabajo_separado" ? "trabajo_separado_mujer" : caso.origen === "donacion_condicion_no_admin" ? "donacion" : "compra",
        };
        game.addBien(bien);
        game.pushLog(`Clasificado correctamente: ${caso.nombre} → ${res.clase}`, res.articulo);
      } else {
        game.ajustarTrauma(2);
      }
    });
    if (registrado) setFeedback({ ok, texto: res.justificacion, art: res.articulo, clase: res.clase, deltas, i });
  }

  // ── Resultado de un caso ──
  if (feedback) {
    return (
      <Actividad titulo={`Caso ${feedback.i + 1} de ${CASOS_SATELITE.length}`} progreso={progreso} regla={REGLA} lugar="banco" retrato="ejecutiva" animo={feedback.ok ? "aprueba" : "duda"}>
        <div className="cuerpo">
          <Consecuencia
            reinicio={feedback.i}
            lectura={lectura}
            tono={feedback.ok ? "exito" : "fallo"}
            titulo={feedback.ok ? "✓ Correcto" : `✗ Incorrecto — era: ${NOMBRE_CLASE[feedback.clase as keyof typeof NOMBRE_CLASE] ?? feedback.clase}`}
            deltas={feedback.deltas}
            regla={{ articulo: feedback.art, texto: feedback.texto, codex: "150" }}
          />
        </div>
        <div className="barra-accion">
          <BotonContinuar lectura={lectura} onClick={() => setFeedback(null)}>
            {feedback.i + 1 >= CASOS_SATELITE.length ? "Pasar a la opción" : "Siguiente"} <Icono nombre="flechaDer" tam={18} />
          </BotonContinuar>
        </div>
      </Actividad>
    );
  }

  // ── Clasificación ──
  if (pendiente >= 0) {
    const caso = CASOS_SATELITE[pendiente];
    return (
      <Actividad titulo={`Caso ${pendiente + 1} de ${CASOS_SATELITE.length}`} objetivo={cap.objetivo} progreso={progreso} regla={REGLA} introClave="intro:satelite" lugar="banco" retrato="ejecutiva">
        <div className="cuerpo gap-3">
          <article className="tarjeta tarjeta-alta flex gap-3">
            <span className="grid place-items-center w-12 h-12 rounded-lg border border-oro/50 txt-oro shrink-0" aria-hidden><Icono nombre="llave" tam={28} /></span>
            <div>
              <h3 className="t-base font-bold">{caso.nombre}</h3>
              <p className="t-meta txt-oro cifra">Valor: {pesos(caso.valor)}</p>
            </div>
          </article>
          <div className="mt-auto">
            <div className="rotulo mb-1.5" id="clases-sat">¿Qué patrimonio es?</div>
            <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="clases-sat">
              {OPCIONES.map((c) => (
                <button key={c} type="button" className="btn btn-secundario" onClick={() => elegir(c)}>{NOMBRE_CLASE[c]}</button>
              ))}
            </div>
          </div>
        </div>
      </Actividad>
    );
  }

  // ── Opción del art. 150 inc. final ──
  const reservado = 13_200_000; // suma estimada de los aciertos para simulación didáctica
  const cuotaGananciales = 8_000_000;
  const pasivoReservado = 1_000_000;
  const efecto = efectoOpcionGananciales({ reservadoArt150: reservado, cuotaGananciales, pasivoReservado });

  if (opcion) {
    return (
      <Actividad titulo="Opción del art. 150 inc. final CC" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} lugar="banco" retrato="ejecutiva" animo="aprueba">
        <div className="cuerpo">
          <Consecuencia
            titulo={`Optaste por ${opcion.toUpperCase()}.`}
            narrativa="La decisión es irrevocable conforme al art. 150 inc. final CC. La liquidación y tu epílogo la recordarán."
            deltas={[{ texto: `Neto simulado: ${pesos(efecto[opcion].neto)}`, signo: "•", tono: "oro" }]}
            regla={{ articulo: "Art. 150 inc. final CC", texto: efecto[opcion].texto, codex: "150" }}
          />
        </div>
        <div className="barra-accion"><Link href="/juego" className="btn btn-primario">Volver al mapa <Icono nombre="mapa" tam={18} /></Link></div>
      </Actividad>
    );
  }

  function ejercer() {
    if (!preSel) return;
    if (!confirmando) { setConfirmando(true); return; }
    if (game.registrarHecho("opcion150", preSel)) {
      game.pushLog(`Ejerciste la opción del art. 150: ${preSel === "aceptar" ? "aceptaste" : "renunciaste a"} los gananciales.`, "Art. 150 CC");
    }
  }

  return (
    <Actividad titulo="Opción del art. 150 inc. final CC" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} lugar="banco" retrato="ejecutiva" animo="duda">
      <p className="t-meta txt-2">
        Al disolverse la sociedad conyugal, la mujer debe optar (decisión IRREVOCABLE). Cifras simuladas: Reservado {pesos(reservado)} · Cuota gananciales {pesos(cuotaGananciales)} · Pasivo reservado {pesos(pasivoReservado)}.
      </p>
      <div className="cuerpo">
        <Paginado
          items={(["aceptar", "renunciar"] as const).map((k) => ({ k, ...efecto[k] }))}
          clave={(o) => o.k}
          etiqueta="Opciones"
          columnas={(w) => (w > 700 ? 2 : 1)}
          render={(o) => (
            <button type="button" className="eleccion h-full" aria-pressed={preSel === o.k} onClick={() => { setPreSel(o.k); setConfirmando(false); }}>
              <span className="font-display font-bold txt-1">{o.k === "aceptar" ? "ACEPTAR gananciales" : "RENUNCIAR a gananciales"}</span>
              <span className="text-titulo font-bold txt-oro cifra">{pesos(o.neto)}</span>
              <span className="t-base txt-2">{o.texto}</span>
            </button>
          )}
        />
      </div>
      <div className="barra-accion">
        {confirmando && <p className="t-meta txt-rojo w-full" role="alert">Esta decisión es irrevocable. Pulsa de nuevo para confirmar.</p>}
        <button type="button" className={`btn ${confirmando ? "btn-peligro" : "btn-primario"}`} disabled={!preSel} onClick={ejercer}>
          {confirmando ? "Confirmar opción irrevocable" : preSel ? `Ejercer: ${preSel}` : "Elige una opción"}
        </button>
      </div>
    </Actividad>
  );
}
