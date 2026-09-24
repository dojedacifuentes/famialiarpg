"use client";
// ============================================================================
// ESCENA DE DIÁLOGO — situación → diálogo → decisión → consecuencia.
// ----------------------------------------------------------------------------
// · Cabe siempre en la pantalla: cada intervención se pagina por medición.
// · Avance manual; el efecto de escritura se completa al instante con un toque,
//   Intro, Espacio o →, y no existe con prefers-reduced-motion.
// · Los efectos de la decisión se aplican UNA vez (store.resolverEscena): volver,
//   recargar o pulsar dos veces no duplica recompensas.
// · "Modo recuerdo": rejugar una escena ya decidida para explorar otras
//   opciones, sin cambiar la partida.
// ============================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useGame } from "@/store/useGame";
import type { Escena, Opcion } from "@/data/dialogos";
import { ESCENARIO, NOMBRE_ATRIBUTO } from "@/data/escenario";
import Escenario from "@/components/arte/Escenario";
import Retrato, { type Animo } from "@/components/arte/Retrato";
import { Paginado, TextoAjustado, useLectura } from "@/components/ui/Ajuste";
import Consecuencia, { BotonContinuar } from "@/components/ui/Consecuencia";
import Icono from "@/components/ui/Icono";
import { animoDe, deltasDeEfectos } from "@/lib/deltas";
import { usePreferencias } from "@/store/usePreferencias";

type Paso = "lineas" | "decidir" | "consecuencia";

function useEscritura(texto: string, activo: boolean, velocidad = 110) {
  const [n, setN] = useState(activo ? 0 : texto.length);
  const fin = useRef(false);
  useEffect(() => {
    fin.current = false;
    if (!activo) { setN(texto.length); return; }
    setN(0);
    let raf = 0;
    let inicio = 0;
    const paso = (t: number) => {
      if (fin.current) return;
      if (!inicio) inicio = t;
      const k = Math.floor((t - inicio) * velocidad / 1000);
      if (k >= texto.length) { setN(texto.length); return; }
      setN(k);
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [texto, activo, velocidad]);
  const completar = useCallback(() => { fin.current = true; setN(texto.length); }, [texto]);
  return { n, completo: n >= texto.length, completar };
}

export function requisitoDe(op: Opcion, s: { atributos: Record<string, number>; flags: string[]; sexo: string }) {
  if (!op.requiere) return { ok: true, etiqueta: undefined as string | undefined, razon: undefined as string | undefined };
  const { atributo, minimo, flag, sexo } = op.requiere;
  const partes: string[] = [];
  let ok = true;
  let razon: string | undefined;
  if (atributo) {
    const tiene = s.atributos[atributo] ?? 0;
    partes.push(`${NOMBRE_ATRIBUTO[atributo]} ${minimo ?? 0} · tienes ${tiene}`);
    if (tiene < (minimo ?? 0)) { ok = false; razon = `Tu ${NOMBRE_ATRIBUTO[atributo].toLowerCase()} es ${tiene}; se necesita ${minimo}.`; }
  }
  if (flag) {
    partes.push("Requiere antecedente previo");
    if (!s.flags.includes(flag)) { ok = false; razon = razon ?? "Te falta un antecedente de una escena anterior."; }
  }
  if (sexo) {
    partes.push(sexo === "femenino" ? "Sólo personaje mujer" : "Sólo personaje hombre");
    if (s.sexo !== sexo) { ok = false; razon = razon ?? `Opción reservada al personaje ${sexo === "femenino" ? "mujer" : "hombre"}.`; }
  }
  return { ok, etiqueta: partes.join(" · "), razon };
}

export default function DialogoEscena({
  escena,
  onFin,
  recuerdo = false,
  textoContinuar = "Continuar",
}: {
  escena: Escena;
  onFin?: () => void;
  /** Rejuega la escena sin aplicar efectos. */
  recuerdo?: boolean;
  textoContinuar?: string;
}) {
  const game = useGame();
  const reducir = useReducedMotion();
  const prefs = usePreferencias();
  const lectura = useLectura();
  const decidida = !recuerdo && escena.id in game.escenas ? game.escenas[escena.id] : undefined;
  const lugar = ESCENARIO[escena.id] ?? { lugar: "notaria" as const, retrato: "notario" as const };

  // Intervenciones: la ambientación abre la escena como narración.
  const intervenciones = useMemo(
    () => [
      { quien: "Ambiente", texto: escena.ambientacion, narrador: true },
      { quien: escena.speaker ?? "", texto: escena.lineas.join("\n\n"), narrador: false },
    ],
    [escena]
  );

  const [paso, setPaso] = useState<Paso>(decidida !== undefined ? "consecuencia" : "lineas");
  const [linea, setLinea] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [paginas, setPaginas] = useState<{ linea: number; lista: string[] }>({ linea: 0, lista: [intervenciones[0].texto] });
  const [elegida, setElegida] = useState<number | null>(decidida ?? null);
  const [aviso, setAviso] = useState<string | null>(null);
  // Al revisitar una escena ya decidida se muestran todos sus antecedentes.
  const [flagsAntes, setFlagsAntes] = useState<string[]>(decidida !== undefined ? [] : game.flags);

  useEffect(() => {
    setPaso(decidida !== undefined ? "consecuencia" : "lineas");
    setLinea(0);
    setPagina(0);
    setElegida(decidida ?? null);
    setAviso(null);
    // Sólo al cambiar de escena o de modo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escena.id, recuerdo]);

  const actual = intervenciones[Math.min(linea, intervenciones.length - 1)];
  const lista = paginas.linea === linea ? paginas.lista : [actual.texto];
  const textoPagina = lista[Math.min(pagina, lista.length - 1)] ?? "";
  const { n, completo, completar } = useEscritura(textoPagina, paso === "lineas" && !reducir && prefs.movimiento && prefs.lectura !== "instantanea", prefs.lectura === "rapida" ? 180 : 70);
  const opciones = Array.isArray(escena.opciones) ? escena.opciones : [];
  const ultima = linea >= intervenciones.length - 1 && pagina >= lista.length - 1;

  const onPaginas = useCallback((l: string[]) => setPaginas({ linea, lista: l }), [linea]);

  function siguiente() {
    if (paso !== "lineas") return;
    if (!completo) { completar(); return; }
    if (pagina < lista.length - 1) { setPagina(pagina + 1); return; }
    if (linea < intervenciones.length - 1) { setLinea(linea + 1); setPagina(0); return; }
    if (opciones.length === 0) {
      if (!recuerdo) game.resolverEscena(escena, -1);
      onFin?.();
      return;
    }
    // Una única acción de continuidad no necesita una pantalla de falsa elección.
    if (opciones.length === 1 && !opciones[0].requiere && !opciones[0].efectos?.atributos && !opciones[0].efectos?.flags && !opciones[0].efectos?.trauma && !opciones[0].efectos?.reputacion) {
      if (!recuerdo) game.resolverEscena(escena, 0);
      onFin?.();
      return;
    }
    setPaso("decidir");
  }

  function anterior() {
    if (paso === "decidir") { setPaso("lineas"); return; }
    if (pagina > 0) { setPagina(pagina - 1); return; }
    if (linea > 0) { setLinea(linea - 1); setPagina(0); }
  }

  function elegir(i: number) {
    const op = opciones[i];
    if (!op || paso !== "decidir") return;
    const req = requisitoDe(op, { atributos: game.personaje.atributos, flags: game.flags, sexo: game.personaje.sexo });
    if (!req.ok) {
      setAviso(req.razon ?? "No cumples el requisito.");
      return;
    }
    setFlagsAntes(game.flags);
    if (!recuerdo) game.resolverEscena(escena, i);
    setElegida(i);
    setAviso(null);
    setPaso("consecuencia");
  }

  // Teclado: Intro / Espacio / → avanzan; ← retrocede; 1-9 eligen opción.
  const estado = useRef({ siguiente, anterior, elegir, paso });
  estado.current = { siguiente, anterior, elegir, paso };
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [role='dialog']")) return;
      const sobreBoton = !!t.closest("button, a");
      const st = estado.current;
      if ((e.key === "Enter" || e.key === " ") && !sobreBoton && st.paso === "lineas") { e.preventDefault(); st.siguiente(); }
      else if (e.key === "ArrowRight" && st.paso === "lineas") { e.preventDefault(); st.siguiente(); }
      else if (e.key === "ArrowLeft" && st.paso !== "consecuencia") { e.preventDefault(); st.anterior(); }
      else if (/^[1-9]$/.test(e.key) && st.paso === "decidir") { e.preventDefault(); st.elegir(Number(e.key) - 1); }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  const opElegida = elegida !== null && elegida >= 0 ? opciones[elegida] : undefined;
  const deltas = useMemo(() => deltasDeEfectos(opElegida?.efectos, flagsAntes), [opElegida, flagsAntes]);
  const animo: Animo = paso === "consecuencia" ? animoDe(deltas) : paso === "decidir" ? "duda" : "neutral";
  const hablaNarrador = paso === "lineas" && actual.narrador;

  return (
    <div className="escena" data-paso={paso}>
      {/* ── Visual: lugar + personaje ─────────────────────────────── */}
      <div className="visual" aria-hidden>
        <Escenario lugar={lugar.lugar} />
        <AnimatePresence mode="wait">
          <motion.div
            key={animo}
            className="retrato-escena"
            initial={{ opacity: 0.4, y: 6 }}
            animate={{ opacity: 1, y: 0, filter: hablaNarrador ? "brightness(0.55) saturate(0.7)" : "brightness(1) saturate(1)" }}
            transition={{ duration: 0.25 }}
          >
            <Retrato tipo={lugar.retrato} animo={animo} sexo={game.personaje.sexo} className="w-full h-full respirar" />
          </motion.div>
        </AnimatePresence>
        <div className="rotulo-lugar">{escena.titulo}</div>
      </div>

      {/* ── Diálogo y decisiones ──────────────────────────────────── */}
      <section className="dialogo panel marco" aria-label={`Escena: ${escena.titulo}`}>
        {recuerdo && (
          <div className="insignia mb-2 self-start" data-tono="cian">
            <Icono nombre="recuerdo" tam={14} /> Modo recuerdo: no cambia tu partida
          </div>
        )}

        {paso === "lineas" && (
          <>
            <div className={`placa ${actual.narrador ? "italic" : ""}`}>{actual.narrador ? "Ambiente" : actual.quien || "—"}</div>
            <div className="flex flex-col flex-1 min-h-0 pt-3" onClick={() => !completo && completar()}>
              <TextoAjustado
                key={`${escena.id}-${linea}`}
                texto={actual.texto}
                pagina={pagina}
                onPaginas={onPaginas}
                visibles={n}
                className={`texto-dialogo ${actual.narrador ? "italic txt-2" : ""}`}
              />
            </div>
            <div className="barra-accion">
              <button type="button" className="btn btn-secundario btn-icono fijo" onClick={anterior} disabled={linea === 0 && pagina === 0} aria-label="Intervención anterior">
                <Icono nombre="flechaIzq" tam={20} />
              </button>
              <span className="t-meta txt-3 cifra fijo" aria-label={`Intervención ${linea + 1} de ${intervenciones.length}`}>
                {linea + 1}/{intervenciones.length}
                {lista.length > 1 ? ` · pág. ${pagina + 1}/${lista.length}` : ""}
              </span>
              <button type="button" className="btn btn-primario" onClick={siguiente}>
                {!completo ? "Mostrar todo" : ultima ? (opciones.length ? "Decidir" : textoContinuar) : "Siguiente"}
                <Icono nombre="flechaDer" tam={18} />
              </button>
            </div>
          </>
        )}

        {paso === "decidir" && (
          <>
            <div className="placa">¿Qué haces?</div>
            <div className="flex flex-col flex-1 min-h-0 pt-3">
              <Paginado
                items={opciones}
                clave={(_, i) => `op-${i}`}
                etiqueta="Opciones"
                reinicio={escena.id}
                render={(op, i) => {
                  const req = requisitoDe(op, { atributos: game.personaje.atributos, flags: game.flags, sexo: game.personaje.sexo });
                  return (
                    <button type="button" className="opcion" aria-disabled={!req.ok} onClick={() => elegir(i)}>
                      <span className="tecla" aria-hidden>{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block">{op.texto}</span>
                        {req.etiqueta && (
                          <span className={`mt-1 inline-flex items-center gap-1 t-meta ${req.ok ? "txt-verde" : "txt-3"}`}>
                            <Icono nombre={req.ok ? "abierto" : "candado"} tam={14} />
                            {req.ok ? "Cumples: " : "Bloqueada: "}
                            {req.etiqueta}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                }}
              />
            </div>
            <p className="t-meta txt-rojo min-h-[1.3em]" role="alert">{aviso ?? ""}</p>
            <div className="barra-accion">
              <button type="button" className="btn btn-secundario" onClick={anterior}>
                <Icono nombre="flechaIzq" tam={18} /> Releer
              </button>
            </div>
          </>
        )}

        {paso === "consecuencia" && (
          <>
            <div className="placa">Consecuencia</div>
            <div className="flex flex-col flex-1 min-h-0 pt-3">
              <Consecuencia
                reinicio={`${escena.id}-${elegida}`}
                lectura={lectura}
                titulo={opElegida ? opElegida.texto : "Escena concluida"}
                narrativa={opElegida?.efectos?.log ?? "Decisión registrada."}
                deltas={deltas}
                regla={escena.articulo ? { articulo: `Art. ${escena.articulo.n}`, texto: escena.articulo.t, codex: ESCENARIO[escena.id]?.codex } : undefined}
              />
            </div>
            <div className="barra-accion">
              <BotonContinuar lectura={lectura} onClick={() => onFin?.()}>
                {textoContinuar} <Icono nombre="flechaDer" tam={18} />
              </BotonContinuar>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
