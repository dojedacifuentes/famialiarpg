"use client";
// ============================================================================
// CÓDEX — temas y artículos, con búsqueda. Lista paginada + ficha del tema
// (en escritorio, lado a lado). Las escenas enlazan aquí con ?q=… para ampliar
// la regla jurídica que acaban de aplicar.
// ============================================================================
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ARTICULOS_DESTACADOS } from "@/lib/reglas";
import { coincide } from "@/lib/paginar";
import { TEMAS } from "@/data/codex";
import GameShell from "@/components/ui/GameShell";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";
import { useGame, useMontado } from "@/store/useGame";

type Tab = "temas" | "articulos";

function CodexContenido() {
  const params = useSearchParams();
  const router = useRouter();
  const montado = useMontado();
  const hayPartida = useGame((s) => !!s.personaje.nombre);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [tab, setTab] = useState<Tab>("temas");
  const [abierto, setAbierto] = useState<string | null>(null);

  const temas = useMemo(() => TEMAS.filter((t) => coincide(t.titulo, q) || coincide(t.cuerpo, q) || t.tags.some((tag) => coincide(tag, q))), [q]);
  const articulos = useMemo(() => ARTICULOS_DESTACADOS.filter((a) => coincide(a.n, q) || coincide(a.t, q)), [q]);

  // Si la búsqueda deja un solo tema (p. ej. al llegar desde una escena), se abre.
  useEffect(() => {
    if (temas.length === 1) setAbierto(temas[0].titulo);
    else if (abierto && !temas.some((t) => t.titulo === abierto)) setAbierto(null);
    if (temas.length === 0 && articulos.length > 0) setTab("articulos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const tema = TEMAS.find((t) => t.titulo === abierto);
  const volver = montado && hayPartida ? { href: "/juego", etiqueta: "Volver al mapa" } : { href: "/", etiqueta: "Volver a la portada" };

  const detalle = tema && (
    <article className="flex flex-col gap-2 min-h-0 flex-1" aria-label={tema.titulo}>
      <h2 className="t-titulo txt-oro">{tema.titulo}</h2>
      <Paginado
        items={[tema.cuerpo, "tags"]}
        clave={(x, i) => `${tema.titulo}-${i}`}
        reinicio={tema.titulo}
        etiqueta="Página"
        render={(x) =>
          x === "tags" ? (
            <div className="flex gap-1 flex-wrap">{tema.tags.map((tag) => <span key={tag} className="insignia">{tag}</span>)}</div>
          ) : (
            <p className="t-lectura txt-1">{x}</p>
          )
        }
      />
    </article>
  );

  return (
    <GameShell eyebrow="Codex juridicus" titulo="Articulado mínimo y temas clave" volver={volver} stats={false} nav={montado && hayPartida}>
      <div className="codex">
        <section className="panel marco actividad-cuerpo codex-lista" aria-label="Buscar en el códex">
          <label className="block">
            <span className="sr-only">Buscar</span>
            <span className="relative block">
              <Icono nombre="lupa" tam={18} className="absolute left-3 top-1/2 -translate-y-1/2 txt-3" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); router.replace(e.target.value ? `/codex?q=${encodeURIComponent(e.target.value)}` : "/codex", { scroll: false }); }}
                placeholder="Buscar: artículo, deber, concepto..."
                className="campo !pl-10"
                type="search"
                enterKeyHint="search"
              />
            </span>
          </label>
          <div role="tablist" aria-label="Secciones del códex" className="grid grid-cols-2 gap-1">
            <button type="button" role="tab" aria-selected={tab === "temas"} className={`btn ${tab === "temas" ? "btn-primario" : "btn-secundario"}`} onClick={() => setTab("temas")}>Temas ({temas.length})</button>
            <button type="button" role="tab" aria-selected={tab === "articulos"} className={`btn ${tab === "articulos" ? "btn-primario" : "btn-secundario"}`} onClick={() => setTab("articulos")}>Artículos ({articulos.length})</button>
          </div>
          <div className="cuerpo" role="tabpanel">
            {tab === "temas" ? (
              tema && <div className="codex-detalle-movil flex flex-col flex-1 min-h-0 gap-2">
                {detalle}
                <button type="button" className="btn btn-secundario" onClick={() => setAbierto(null)}><Icono nombre="flechaIzq" tam={18} /> Volver a la lista</button>
              </div>
            ) : null}
            {tab === "temas" && (
              <div className={`flex flex-col flex-1 min-h-0 ${tema ? "codex-lista-temas" : ""}`}>
                {temas.length === 0 ? (
                  <p className="t-meta txt-3">Sin resultados para &quot;{q}&quot;.</p>
                ) : (
                  <Paginado
                    items={temas}
                    clave={(t) => t.titulo}
                    etiqueta="Temas"
                    gap={6}
                    reinicio={q}
                    render={(t) => (
                      <button type="button" className="eleccion" aria-current={abierto === t.titulo} onClick={() => setAbierto(t.titulo)}>
                        <span className="font-bold txt-1">{t.titulo}</span>
                      </button>
                    )}
                  />
                )}
              </div>
            )}
            {tab === "articulos" && (
              articulos.length === 0 ? (
                <p className="t-meta txt-3">Sin resultados para &quot;{q}&quot;.</p>
              ) : (
                <Paginado
                  items={articulos}
                  clave={(a) => a.n}
                  etiqueta="Artículos"
                  gap={4}
                  reinicio={q}
                  render={(a) => (
                    <p className="tarjeta t-base"><b className="txt-cian">{a.n}</b> — {a.t}</p>
                  )}
                />
              )
            )}
          </div>
        </section>
        <section className="panel marco actividad-cuerpo codex-detalle" aria-label="Tema seleccionado">
          {detalle ?? <p className="t-lectura txt-3 m-auto text-center">Elige un tema para leerlo aquí.</p>}
        </section>
      </div>
    </GameShell>
  );
}

export default function Codex() {
  return (
    <Suspense fallback={<div className="shell" />}>
      <CodexContenido />
    </Suspense>
  );
}
