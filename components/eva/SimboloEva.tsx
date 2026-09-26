import { useId } from "react";
import { MARCA_EVA } from "@/lib/eva-arcade";

/** Margen del filtro del halo alrededor de la figura, en unidades de la marca. */
const MARGEN_HALO = 3.5;

type Punto = readonly [number, number];

/** Una pose ya colocada: su caja (sin halo) y sus piezas visibles. */
interface PoseColocada {
  caja: { x: number; y: number; ancho: number; alto: number };
  piezas: readonly (readonly Punto[])[];
}

/**
 * El símbolo oficial de EVA: □X, un cuadrado sobre una X. La geometría llega ya
 * colocada en `lib/marca-eva.ts`; aquí sólo se pinta, en dos capas como en la
 * landing de EVA: debajo el halo (azul eléctrico a la izquierda, violeta a la
 * derecha, desenfocado), encima el trazo casi blanco.
 *
 * El alto lo pone quien lo usa (clase `eva-simbolo` y su tamaño en CSS); el
 * ancho sale de la proporción. Es decorativo: el nombre accesible va aparte.
 */
export default function SimboloEva({ className = "" }: { className?: string }) {
  // Un id por instancia, sin los caracteres de `useId` que no sirven en `url(#…)`.
  const id = `eva-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { caja, piezas }: PoseColocada = MARCA_EVA.poses.simbolo;
  const viewBox = `${caja.x} ${caja.y} ${caja.ancho} ${caja.alto}`;
  const figuras = piezas.map((pieza, k) => (
    <polygon key={k} points={pieza.map(([x, y]) => `${x},${y}`).join(" ")} />
  ));
  const degradado = (nombre: string, colores: readonly string[]) => (
    <linearGradient id={`${id}-${nombre}`} gradientUnits="userSpaceOnUse" x1={caja.x} x2={caja.x + caja.ancho} y1="0" y2="0">
      {colores.map((color, k) => (
        <stop key={color} offset={k / (colores.length - 1)} stopColor={color} />
      ))}
    </linearGradient>
  );

  return (
    <span className={`eva-simbolo ${className}`} style={{ aspectRatio: `${caja.ancho} / ${caja.alto}` }} aria-hidden="true">
      <svg viewBox={viewBox} focusable="false" className="eva-simbolo-halo">
        <defs>
          {degradado("halo", MARCA_EVA.colores.halo)}
          <filter
            id={`${id}-difuso`}
            filterUnits="userSpaceOnUse"
            x={caja.x - MARGEN_HALO}
            y={caja.y - MARGEN_HALO}
            width={caja.ancho + MARGEN_HALO * 2}
            height={caja.alto + MARGEN_HALO * 2}
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.1" result="ancho" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.35" result="corto" />
            <feMerge>
              <feMergeNode in="ancho" />
              <feMergeNode in="ancho" />
              <feMergeNode in="corto" />
            </feMerge>
          </filter>
        </defs>
        <g fill={`url(#${id}-halo)`} filter={`url(#${id}-difuso)`}>
          {figuras}
        </g>
      </svg>
      <svg viewBox={viewBox} focusable="false" className="eva-simbolo-trazo">
        <defs>{degradado("trazo", MARCA_EVA.colores.trazo)}</defs>
        {/* El contorno tapa la costura de los vértices, donde dos brazos se tocan. */}
        <g fill={`url(#${id}-trazo)`} stroke={`url(#${id}-trazo)`} strokeWidth={MARCA_EVA.costura}>
          {figuras}
        </g>
      </svg>
    </span>
  );
}
