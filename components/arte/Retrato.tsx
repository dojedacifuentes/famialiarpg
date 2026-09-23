// ============================================================================
// RETRATOS — un mismo lenguaje gráfico para todo el reparto.
// Bustos vectoriales con luz de contorno; cada personaje se distingue por
// silueta, vestuario y un accesorio propio. La expresión (ánimo) cambia con la
// consecuencia de las decisiones: es la reacción visible del personaje.
// ============================================================================
import type { Sexo } from "@/types/game";
import type { TipoRetrato } from "@/data/escenario";

export type Animo = "neutral" | "aprueba" | "duda" | "molesto" | "triste";

type Rasgos = {
  piel: string;
  pelo: string;
  ropa: string;
  luz: string;
  peinado: "calvo" | "corto" | "raya" | "bob" | "largo" | "mono" | "rizado" | "canas";
  extra?: ("gafas" | "corbatin" | "credencial" | "visera" | "chaqueta" | "aretes" | "antiparras" | "toga" | "cadena" | "bata" | "sueter")[];
  barba?: boolean;
};

const RASGOS: Record<Exclude<TipoRetrato, "conciencia" | "instinto" | "jugador" | "reconstruido" | "conyuge">, Rasgos> = {
  notario: { piel: "#d6a57a", pelo: "#9a9aa3", ropa: "#2b3040", luz: "#e0b25c", peinado: "calvo", extra: ["gafas", "corbatin"], barba: true },
  oficial: { piel: "#c28a5c", pelo: "#2a1d17", ropa: "#24324d", luz: "#6fd6e8", peinado: "corto", extra: ["credencial"] },
  archivista: { piel: "#e2b893", pelo: "#e9e4d8", ropa: "#4b3a2b", luz: "#e0b25c", peinado: "mono", extra: ["gafas", "cadena"] },
  contador: { piel: "#b27a4f", pelo: "#15110e", ropa: "#3b3327", luz: "#8fe0a6", peinado: "raya", extra: ["visera"] },
  ejecutiva: { piel: "#e6be97", pelo: "#7a3b24", ropa: "#1f3c47", luz: "#6fd6e8", peinado: "bob", extra: ["chaqueta", "aretes"] },
  perito: { piel: "#8a5a3c", pelo: "#1c130e", ropa: "#d9dee7", luz: "#6fd6e8", peinado: "rizado", extra: ["bata", "antiparras"] },
  jueza: { piel: "#cc986b", pelo: "#3b2b25", ropa: "#15161d", luz: "#bda6ff", peinado: "canas", extra: ["toga"] },
};

function rasgosPersona(sexo: Sexo, ropa: string, luz: string): Rasgos {
  return sexo === "femenino"
    ? { piel: "#d8a47c", pelo: "#2b1b16", ropa, luz, peinado: "largo" }
    : { piel: "#c99470", pelo: "#231a15", ropa, luz, peinado: "corto", barba: false };
}

function Cejas({ animo }: { animo: Animo }) {
  const d =
    animo === "molesto" ? "M78 100l16 5M122 100l-16 5" :
    animo === "triste" ? "M78 104l16-4M122 104l-16-4" :
    animo === "duda" ? "M78 99l16 1M106 104l16-2" :
    animo === "aprueba" ? "M78 99q8-4 16 0M106 99q8-4 16 0" :
    "M78 101h16M106 101h16";
  return <path d={d} stroke="#2a1f1a" strokeWidth={3} strokeLinecap="round" fill="none" />;
}

function Boca({ animo }: { animo: Animo }) {
  const d =
    animo === "aprueba" ? "M90 137q10 8 20 0" :
    animo === "molesto" ? "M90 140q10-6 20 0" :
    animo === "triste" ? "M92 140q8-4 16 0" :
    animo === "duda" ? "M90 138q8 2 20-3" :
    "M91 138h18";
  return <path d={d} stroke="#5a2e28" strokeWidth={3} strokeLinecap="round" fill="none" />;
}

function Pelo({ r }: { r: Rasgos }) {
  switch (r.peinado) {
    case "calvo":
      return <path d="M62 112c-4-10-2-20 4-24M138 112c4-10 2-20-4-24" stroke={r.pelo} strokeWidth={9} strokeLinecap="round" fill="none" />;
    case "corto":
      return <path d="M60 104c-2-34 18-50 40-50s42 16 40 50c-6-14-10-22-18-26-12 6-30 6-44 0-8 4-12 12-18 26z" fill={r.pelo} />;
    case "raya":
      return <path d="M60 106c-3-36 18-52 41-52 22 0 42 15 39 50-10-18-28-30-58-26-10 2-17 12-22 28z" fill={r.pelo} />;
    case "bob":
      return <path d="M56 138c-8-54 10-86 44-86s52 32 44 86c-6-2-10-6-12-12 4-22-2-40-14-46-14 10-40 12-52 6-6 12-8 24-2 40-2 6-4 10-8 12z" fill={r.pelo} />;
    case "largo":
      return <path d="M54 170c-10-70 4-118 46-118s56 48 46 118c-6-10-10-26-10-40 4-24-4-44-14-50-16 10-36 12-50 6-8 12-10 26-6 44 0 14-4 30-12 40z" fill={r.pelo} />;
    case "mono":
      return (
        <g fill={r.pelo}>
          <circle cx="100" cy="46" r="15" />
          <path d="M60 110c-4-34 16-54 40-54s44 20 40 54c-4-12-10-22-20-26-12 4-28 4-40 0-10 4-16 14-20 26z" />
        </g>
      );
    case "rizado":
      return (
        <g fill={r.pelo}>
          {[64, 76, 90, 104, 118, 132].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 70 : 64} r="14" />)}
          <path d="M58 100c0-18 6-28 14-32h56c8 4 14 14 14 32-6-10-12-16-20-18H78c-8 2-14 8-20 18z" />
        </g>
      );
    case "canas":
      return (
        <g>
          <path d="M54 176c-10-72 4-122 46-122s56 50 46 122c-6-12-10-28-10-42 4-24-4-44-14-50-16 10-36 12-50 6-8 12-10 26-6 44 0 14-4 30-12 42z" fill={r.pelo} />
          <path d="M112 60c14 4 24 18 26 40" stroke="#cfcfd6" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

function Busto({ r, animo }: { r: Rasgos; animo: Animo }) {
  const ex = r.extra ?? [];
  return (
    <g>
      {/* luz de contorno */}
      <ellipse cx="100" cy="150" rx="92" ry="86" fill={r.luz} opacity="0.13" />
      {/* torso */}
      <path d="M20 232c4-44 30-66 80-68 50 2 76 24 80 68z" fill={r.ropa} />
      <path d="M20 232c4-44 30-66 80-68 50 2 76 24 80 68" fill="none" stroke={r.luz} strokeOpacity="0.55" strokeWidth={2} />
      {ex.includes("toga") && <path d="M84 166l16 30 16-30-16 8z" fill="#f2efe8" />}
      {ex.includes("bata") && <path d="M60 232l30-66h20l30 66" fill="none" stroke="#b7bfcc" strokeWidth={3} />}
      {ex.includes("chaqueta") && <path d="M76 170l24 40 24-40M100 210v22" stroke="#0f252c" strokeWidth={4} fill="none" />}
      {ex.includes("sueter") && <path d="M60 196q40 16 80 0" stroke="#000" strokeOpacity="0.25" strokeWidth={4} fill="none" />}
      {/* camisa y cuello */}
      {!ex.includes("toga") && !ex.includes("bata") && <path d="M86 166l14 22 14-22z" fill="#e9e4d8" />}
      {ex.includes("corbatin") && <path d="M88 178l12 6 12-6-4 10-8-4-8 4z" fill="#e0b25c" />}
      {ex.includes("credencial") && (
        <g>
          <path d="M84 168l16 44 16-44" stroke="#6fd6e8" strokeWidth={2} fill="none" />
          <rect x="91" y="210" width="18" height="14" rx="2" fill="#dfe9ee" />
        </g>
      )}
      {/* cuello */}
      <path d="M86 150h28v20c-8 6-20 6-28 0z" fill={r.piel} />
      <path d="M86 160c8 4 20 4 28 0" stroke="#000" strokeOpacity="0.18" strokeWidth={3} fill="none" />
      {/* cabeza */}
      {r.peinado === "largo" || r.peinado === "bob" || r.peinado === "canas" ? <Pelo r={r} /> : null}
      <ellipse cx="100" cy="112" rx="38" ry="44" fill={r.piel} />
      <ellipse cx="62" cy="116" rx="6" ry="9" fill={r.piel} />
      <ellipse cx="138" cy="116" rx="6" ry="9" fill={r.piel} />
      {ex.includes("aretes") && (<><circle cx="62" cy="128" r="3" fill="#e0b25c" /><circle cx="138" cy="128" r="3" fill="#e0b25c" /></>)}
      {r.peinado !== "largo" && r.peinado !== "bob" && r.peinado !== "canas" ? <Pelo r={r} /> : null}
      {/* sombra lateral y luz */}
      <path d="M126 80c10 12 14 30 10 50-4 16-14 24-24 26 14-12 20-44 14-76z" fill="#000" opacity="0.16" />
      {r.barba && <path d="M70 128c4 22 16 30 30 30s26-8 30-30c-8 10-18 14-30 14s-22-4-30-14z" fill={r.pelo} opacity="0.85" />}
      {/* rasgos */}
      <Cejas animo={animo} />
      <ellipse cx="86" cy="112" rx="4" ry={animo === "molesto" ? 3 : 4.5} fill="#1d1612" />
      <ellipse cx="114" cy="112" rx="4" ry={animo === "molesto" ? 3 : 4.5} fill="#1d1612" />
      <path d="M100 114q-4 10 0 14" stroke="#000" strokeOpacity="0.25" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Boca animo={animo} />
      {ex.includes("gafas") && (
        <g stroke="#d8c9a3" strokeWidth={2.5} fill="rgba(200,220,255,0.12)">
          <circle cx="86" cy="112" r="11" />
          <circle cx="114" cy="112" r="11" />
          <path d="M97 112h6" />
          {ex.includes("cadena") && <path d="M75 114c-10 30-6 50 4 62M125 114c10 30 6 50-4 62" fill="none" strokeWidth={1.5} />}
        </g>
      )}
      {ex.includes("visera") && <path d="M58 88q42-22 84 0l8 10q-50-16-100 0z" fill="#2f7a4a" opacity="0.92" />}
      {ex.includes("antiparras") && (
        <g>
          <rect x="68" y="72" width="64" height="16" rx="8" fill="rgba(111,214,232,0.35)" stroke="#6fd6e8" strokeWidth={2} />
          <path d="M60 80h8M132 80h8" stroke="#1c130e" strokeWidth={3} />
        </g>
      )}
    </g>
  );
}

function Silueta({ color, ojos, capucha }: { color: string; ojos: string; capucha?: boolean }) {
  return (
    <g>
      <ellipse cx="100" cy="150" rx="92" ry="86" fill={ojos} opacity="0.12" />
      {capucha ? (
        <path d="M22 232c6-40 26-62 50-70-18-18-22-46-10-72 12-26 64-26 76 0 12 26 8 54-10 72 24 8 44 30 50 70z" fill={color} />
      ) : (
        <g fill={color}>
          <path d="M20 232c4-44 30-66 80-68 50 2 76 24 80 68z" />
          <ellipse cx="100" cy="112" rx="38" ry="44" />
          <rect x="86" y="148" width="28" height="22" />
        </g>
      )}
      <ellipse cx="86" cy="114" rx="5" ry="3" fill={ojos} className="titilar" />
      <ellipse cx="114" cy="114" rx="5" ry="3" fill={ojos} className="titilar" />
    </g>
  );
}

export default function Retrato({
  tipo,
  animo = "neutral",
  sexo = "femenino",
  className = "",
  etiqueta,
}: {
  tipo: TipoRetrato;
  animo?: Animo;
  /** Sexo del personaje jugador: define al jugador, a su conciencia y a su cónyuge. */
  sexo?: Sexo;
  className?: string;
  etiqueta?: string;
}) {
  let contenido: JSX.Element;
  if (tipo === "conciencia") {
    contenido = (
      <g>
        <rect x="30" y="30" width="140" height="200" rx="70" fill="none" stroke="#bda6ff" strokeOpacity="0.6" strokeWidth={3} />
        <g opacity="0.75"><Silueta color="#3d3366" ojos="#d9ccff" /></g>
      </g>
    );
  } else if (tipo === "instinto") {
    contenido = <Silueta color="#12131a" ojos="#e0b25c" capucha />;
  } else if (tipo === "jugador" || tipo === "reconstruido") {
    contenido = <Busto r={rasgosPersona(sexo, tipo === "reconstruido" ? "#6b4a2e" : "#2f3a55", tipo === "reconstruido" ? "#f0cd84" : "#6fd6e8")} animo={animo} />;
  } else if (tipo === "conyuge") {
    const otro: Sexo = sexo === "femenino" ? "masculino" : "femenino";
    contenido = <Busto r={{ ...rasgosPersona(otro, "#6b3e4a", "#ff7a8a"), extra: ["sueter"] }} animo={animo} />;
  } else {
    contenido = <Busto r={RASGOS[tipo]} animo={animo} />;
  }
  return (
    <svg
      viewBox="0 0 200 232"
      className={className}
      role={etiqueta ? "img" : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
      preserveAspectRatio="xMidYMax meet"
    >
      {contenido}
    </svg>
  );
}
