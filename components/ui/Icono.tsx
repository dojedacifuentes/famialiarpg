// ============================================================================
// ICONOGRAFÍA — trazo único de 24 px, color heredado (currentColor).
// Sustituye a los emoji como sistema de ilustración: un solo lenguaje gráfico
// para navegación, capítulos, objetos del expediente y estados.
// ============================================================================
import type { SVGProps } from "react";

const TRAZOS = {
  // ── Interfaz ──
  mapa: "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14",
  expediente: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18",
  codex: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7M8 10h5",
  examen: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6",
  inicio: "M4 21V10l8-6 8 6v11h-5v-6H9v6z",
  flechaIzq: "M15 5l-7 7 7 7",
  flechaDer: "M9 5l7 7-7 7",
  volver: "M10 6l-6 6 6 6M4 12h16",
  cerrar: "M6 6l12 12M18 6L6 18",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5",
  check: "M4 12.5l5 5L20 6.5",
  cruz: "M6 6l12 12M18 6L6 18",
  candado: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2.5",
  abierto: "M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 6.8-1.2M12 15v2.5",
  estrella: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  lupa: "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM16 16l5 5",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  pluma: "M20 4c-6 1-11 6-13 13l-3 3M7 17c3 0 6-1 8-3M13 9l2 2",
  sello: "M12 3a4 4 0 0 1 2.5 7.1V13h4.5l1 4H4l1-4h4.5v-2.9A4 4 0 0 1 12 3zM5 20h14",
  bandera: "M5 21V4M5 4h11l-2 4 2 4H5",
  lampara: "M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9V16h-7v-2.1A6 6 0 0 1 12 3z",
  recuerdo: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4M12 8v4l3 2",
  ojo: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  persona: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  mas: "M12 5v14M5 12h14",
  menos: "M5 12h14",
  alerta: "M12 3l10 18H2zM12 10v5M12 18v.5",
  // ── Estadísticas ──
  reputacion: "M12 21v-6M7 21h10M5 5c0 5 3 8 7 10 4-2 7-5 7-10M5 5h14M3 5h2M19 5h2",
  trauma: "M12 20S3 14.5 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 14.5 12 20 12 20zM12 6l-1.5 4 3 2-2 4",
  economia: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 8.5c-.8-.9-2-1.5-3.3-1.5-1.7 0-3 .9-3 2.3 0 3.2 6.6 1.8 6.6 5 0 1.4-1.4 2.4-3.3 2.4-1.4 0-2.7-.6-3.5-1.6M12 5v2M12 17v2",
  // ── Capítulos ──
  anillo: "M12 21a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM9.5 8L8 4.5h8L14.5 8M10 4.5L12 2l2 2.5",
  anillos: "M8.5 19a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM15.5 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z",
  cofre: "M3 10a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v10H3zM3 12h18M10.5 12v3h3v-3",
  llave: "M8 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 11h9M18 11v3M15 11v2",
  manos: "M3 12l4-4 4 1 3-2 7 5M3 12l5 5 2-1 2 2 2-1 2 1 5-6M10 16l-2-2M12 14l-2-2",
  cuna: "M4 11h16v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM4 11a8 8 0 0 1 8-8v8M7 20l-1 2M17 20l1 2",
  probeta: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3M7.5 14h9",
  casaEscudo: "M3 11l9-7 9 7M5 10v10h14V10M12 11c1.7 1 3.3 1.3 4 1.3 0 3.6-1.6 5.3-4 6.4-2.4-1.1-4-2.8-4-6.4.7 0 2.3-.3 4-1.3z",
  rayo: "M13 2L4 14h7l-1 8 9-12h-7z",
  calendario: "M4 6h16v15H4zM4 10h16M8 3v5M16 3v5M8 14h3v3H8z",
  pergamino: "M7 3h11a2 2 0 0 1 2 2v2h-4M7 3a2 2 0 0 0-2 2v12M7 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2h4M11 8h6M11 12h6M11 16h4",
  mazo: "M14 4l6 6M11 7l6 6M12.5 5.5l5 5M8.5 12.5L3 18l3 3 5.5-5.5M4 21h9",
  balanza: "M12 3v18M7 21h10M4 7h16M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z",
  selloRoto: "M12 3a4 4 0 0 1 2.5 7.1V13h4.5l1 4H4l1-4h4.5v-2.9A4 4 0 0 1 12 3zM14 6l-3 4 2 1-3 5",
  division: "M4 5h16v14H4zM12 5v14M7 9h2M15 9h2M7 13h2M15 13h2",
  brote: "M12 21v-9M12 12c0-4 3-7 8-7 0 5-3 7-8 7zM12 15c0-3-2-5-7-5 0 4 2 5 7 5M7 21h10",
  // ── Objetos del expediente ──
  inmueble: "M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6M8 11h2M14 11h2",
  dinero: "M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 10v4M18 10v4",
  mueble: "M5 11V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M3 11h18v6H3zM5 17v3M19 17v3",
  fungible: "M8 6c-3 3-4 7-4 10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4c0-3-1-7-4-10M8 6h8M9 3h6l-1 3h-4z",
  valores: "M4 20V4M4 20h16M7 15l4-4 3 3 5-6",
  credito: "M4 4h16v16H4zM8 9h8M8 13h8M8 17h5",
  documento: "M6 3h9l4 4v14H6zM15 3v4h4M9 11h7M9 15h7M9 19h4",
  joya: "M6 4h12l3 5-9 12L3 9zM3 9h18M9 4l3 5 3-5",
  hijo: "M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 21v-4a5 5 0 0 1 10 0v4",
  corazon: "M12 20S3 14.5 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 14.5 12 20 12 20z",
  apreton: "M3 13l5-5 4 2 4-2 5 5-7 6z",
} as const;

export type NombreIcono = keyof typeof TRAZOS;

export default function Icono({
  nombre,
  tam = 20,
  className = "",
  titulo,
  grosor = 1.8,
  ...resto
}: { nombre: NombreIcono; tam?: number; titulo?: string; grosor?: number } & Omit<SVGProps<SVGSVGElement>, "ref">) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      role={titulo ? "img" : undefined}
      aria-hidden={titulo ? undefined : true}
      aria-label={titulo}
      focusable="false"
      {...resto}
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  );
}
