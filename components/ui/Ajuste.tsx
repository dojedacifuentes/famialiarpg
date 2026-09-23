"use client";
// ============================================================================
// AJUSTE A LA PANTALLA — paginación por medición real.
// ----------------------------------------------------------------------------
// <Paginado> reparte una lista (opciones, casos, entradas del códex, bienes…)
// en páginas que caben en el alto disponible. <TextoAjustado> hace lo mismo
// con un texto largo, cortando entre frases. Ambos vuelven a medir al cambiar
// el tamaño de la ventana, al abrirse el teclado o al ampliar el texto.
// ============================================================================
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { paginaDe, paginarTexto, repartirEnPaginas, type Reparto } from "@/lib/paginar";
import Icono from "./Icono";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useTamano<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [tam, setTam] = useState({ w: 0, h: 0 });
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const actualizar = () =>
      setTam((prev) => (prev.w === el.clientWidth && prev.h === el.clientHeight ? prev : { w: el.clientWidth, h: el.clientHeight }));
    actualizar();
    const ro = new ResizeObserver(actualizar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, tam] as const;
}

// ── Paginador ────────────────────────────────────────────────────────────────
export function Paginador({
  pagina,
  total,
  onCambio,
  etiqueta,
}: {
  pagina: number;
  total: number;
  onCambio: (p: number) => void;
  etiqueta: string;
}) {
  if (total <= 1) return null;
  return (
    <nav className="paginador" aria-label={`Páginas de ${etiqueta}`}>
      <button
        type="button"
        className="btn btn-secundario btn-icono"
        onClick={() => onCambio(pagina - 1)}
        disabled={pagina === 0}
        aria-label={`${etiqueta}: página anterior`}
      >
        <Icono nombre="flechaIzq" tam={20} />
      </button>
      <div className="flex flex-col items-center gap-1 min-w-[5.5rem]">
        <span className="t-meta txt-2 cifra" aria-live="polite">
          {etiqueta} {pagina + 1} de {total}
        </span>
        <span className="puntos" aria-hidden>
          {Array.from({ length: Math.min(total, 9) }).map((_, i) => (
            <span key={i} data-activo={i === Math.min(pagina, 8)} />
          ))}
        </span>
      </div>
      <button
        type="button"
        className="btn btn-secundario btn-icono"
        onClick={() => onCambio(pagina + 1)}
        disabled={pagina >= total - 1}
        aria-label={`${etiqueta}: página siguiente`}
      >
        <Icono nombre="flechaDer" tam={20} />
      </button>
    </nav>
  );
}

// ── Lista paginada ───────────────────────────────────────────────────────────
export function Paginado<T>({
  items,
  render,
  clave,
  gap = 8,
  columnas = 1,
  etiqueta = "Página",
  reinicio,
  className = "",
  alinear = "start",
  lectura,
}: {
  items: T[];
  render: (item: T, index: number) => ReactNode;
  clave: (item: T, index: number) => string;
  gap?: number;
  /** Número fijo de columnas o función del ancho disponible (px). */
  columnas?: number | ((ancho: number) => number);
  etiqueta?: string;
  /** Al cambiar, vuelve a la primera página. */
  reinicio?: string | number;
  className?: string;
  alinear?: "start" | "center";
  /** Conecta la paginación con un botón "Continuar" externo (ver useLectura). */
  lectura?: Lectura;
}) {
  const [region, tam] = useTamano<HTMLDivElement>();
  const medidor = useRef<HTMLDivElement>(null);
  const [reparto, setReparto] = useState<Reparto | null>(null);
  const [pagina, setPagina] = useState(0);
  const primero = useRef(0);

  const cols = Math.max(1, typeof columnas === "function" ? columnas(tam.w) : columnas);
  const anchoItem = cols > 1 ? (tam.w - gap * (cols - 1)) / cols : tam.w;

  useEffect(() => {
    primero.current = 0;
    setPagina(0);
  }, [reinicio]);

  // Se mide tras cada render: el contenido de los elementos puede cambiar sin
  // que cambie la lista. Sólo se llama a setState si el reparto cambió: un
  // setState incondicional en un layout effect sin dependencias provoca un
  // bucle de renders aunque el valor sea el mismo.
  const ultimo = useRef<string>("");
  useIsoLayoutEffect(() => {
    const m = medidor.current;
    if (!m || tam.h === 0) return;
    const alturas = Array.from(m.children).map((n) => (n as HTMLElement).getBoundingClientRect().height);
    const r = repartirEnPaginas(alturas, tam.h, gap, cols);
    const firma = JSON.stringify(r);
    if (firma === ultimo.current) return;
    ultimo.current = firma;
    setReparto(r);
  });

  const paginas = reparto?.paginas ?? [items.map((_, i) => i)];
  const total = paginas.length;
  const actual = Math.min(pagina, total - 1);

  // Al repaginar (p. ej. al girar el teléfono) se conserva el primer elemento visible.
  useEffect(() => {
    if (!reparto) return;
    const p = paginaDe(reparto.paginas, primero.current);
    setPagina(p);
  }, [reparto]);

  function irA(p: number) {
    const destino = Math.max(0, Math.min(total - 1, p));
    primero.current = paginas[destino]?.[0] ?? 0;
    setPagina(destino);
  }

  // Informa al botón externo si quedan páginas por leer y le permite avanzar.
  const avanzar = useRef<() => boolean>(() => false);
  avanzar.current = () => {
    if (actual >= total - 1) return false;
    irA(actual + 1);
    return true;
  };
  useEffect(() => {
    if (!lectura) return;
    lectura.registrar(() => avanzar.current());
    lectura.informar(actual < total - 1);
  }, [lectura, actual, total]);

  const visibles = (paginas[actual] ?? []).filter((i) => i < items.length);

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <div
        ref={medidor}
        className="medidor"
        aria-hidden
        // @ts-expect-error — `inert` es un atributo HTML válido aún no tipado en React 18.
        inert=""
        style={{ width: anchoItem > 0 ? anchoItem : undefined, height: 0, overflow: "hidden" }}
      >
        {items.map((it, i) => (
          <div key={clave(it, i)}>{render(it, i)}</div>
        ))}
      </div>
      <div ref={region} className="region-ajuste" data-desborda={reparto?.desborda ? "true" : undefined}>
        <div
          className={`grid ${alinear === "center" ? "content-center h-full" : ""} ${className}`}
          style={{ gap, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, visibility: reparto ? "visible" : "hidden" }}
        >
          {visibles.map((i) => (
            <div key={clave(items[i], i)} className="min-w-0">
              {render(items[i], i)}
            </div>
          ))}
        </div>
      </div>
      <Paginador pagina={actual} total={total} onCambio={irA} etiqueta={etiqueta} />
    </div>
  );
}

// ── Texto paginado ───────────────────────────────────────────────────────────
/**
 * Mide `texto` dentro del alto disponible y lo divide en páginas entre frases.
 * Informa el número de páginas con `onPaginas`; muestra la página `pagina`.
 * `visibles` permite el efecto de escritura sin mover el diseño: los
 * caracteres aún no escritos ocupan su sitio en transparente.
 */
export function TextoAjustado({
  texto,
  pagina,
  onPaginas,
  visibles,
  className = "texto-dialogo",
}: {
  texto: string;
  pagina: number;
  onPaginas: (paginas: string[]) => void;
  visibles?: number;
  className?: string;
}) {
  const [region, tam] = useTamano<HTMLDivElement>();
  const medidor = useRef<HTMLParagraphElement>(null);
  const [res, setRes] = useState<{ paginas: string[]; desborda: boolean } | null>(null);
  const aviso = useRef(onPaginas);
  aviso.current = onPaginas;
  const ultimaFirma = useRef("");

  useIsoLayoutEffect(() => {
    const m = medidor.current;
    if (!m || tam.h === 0 || tam.w === 0) return;
    const cabe = (fragmento: string) => {
      m.textContent = fragmento;
      return m.scrollHeight <= tam.h + 1;
    };
    const r = paginarTexto(texto, cabe);
    m.textContent = "";
    const firma = JSON.stringify(r);
    if (firma === ultimaFirma.current) return;
    ultimaFirma.current = firma;
    setRes(r);
  }, [texto, tam.w, tam.h]);

  useEffect(() => {
    if (res) aviso.current(res.paginas);
  }, [res]);

  const paginas = res?.paginas ?? [texto];
  const actual = paginas[Math.min(pagina, paginas.length - 1)] ?? "";
  const n = visibles === undefined ? actual.length : Math.min(visibles, actual.length);

  return (
    <div ref={region} className="region-ajuste" data-desborda={res?.desborda ? "true" : undefined}>
      <p ref={medidor} className={`medidor ${className}`} aria-hidden style={{ width: tam.w || undefined }} />
      <p className={className} style={{ visibility: res ? "visible" : "hidden" }} aria-hidden>
        <span>{actual.slice(0, n)}</span>
        <span style={{ color: "transparent" }}>{actual.slice(n)}</span>
      </p>
      <p className="sr-only" aria-live="polite">
        {actual}
      </p>
    </div>
  );
}

// ── Lectura: "Continuar" que primero termina de mostrar lo que queda ─────────
export type Lectura = {
  registrar: (avanzar: () => boolean) => void;
  informar: (quedan: boolean) => void;
  quedan: boolean;
  /** Avanza una página si queda alguna; si no, ejecuta `accion`. */
  continuar: (accion: () => void) => void;
};

/**
 * Evita que la explicación jurídica quede escondida en una segunda página que
 * el jugador salta sin ver: el botón principal dice "Seguir leyendo" hasta la
 * última página del resultado.
 */
export function useLectura(): Lectura {
  const fn = useRef<() => boolean>(() => false);
  const [quedan, setQuedan] = useState(false);
  const registrar = useRef((f: () => boolean) => { fn.current = f; }).current;
  const informar = useRef((q: boolean) => setQuedan(q)).current;
  return useMemo(
    () => ({ registrar, informar, quedan, continuar: (accion: () => void) => { if (!fn.current()) accion(); } }),
    [registrar, informar, quedan]
  );
}
