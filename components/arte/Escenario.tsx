// ============================================================================
// ESCENARIOS — un fondo propio por lugar, con la misma gramática visual:
// pared con degradado, suelo, una ventana a la noche lluviosa de Santiago y
// dos o tres objetos que identifican el sitio. SVG estático y liviano; la
// lluvia y la luz titilante se detienen con prefers-reduced-motion.
// ============================================================================
import type { ReactNode } from "react";
import type { Lugar } from "@/data/escenario";

type Paleta = { pared: [string, string]; suelo: string; luz: string; acento: string };

const PALETA: Record<Lugar, Paleta> = {
  notaria: { pared: ["#1f2a28", "#121816"], suelo: "#0d100f", luz: "#e0b25c", acento: "#8fe0a6" },
  registro: { pared: ["#1d2536", "#10151f"], suelo: "#0b0e15", luz: "#6fd6e8", acento: "#e0b25c" },
  archivo: { pared: ["#2a2016", "#16110b"], suelo: "#0f0b07", luz: "#f0cd84", acento: "#e0b25c" },
  despacho: { pared: ["#262130", "#15121c"], suelo: "#0e0c12", luz: "#e0b25c", acento: "#8fe0a6" },
  banco: { pared: ["#14262a", "#0b1517"], suelo: "#081012", luz: "#6fd6e8", acento: "#8fe0a6" },
  cocina: { pared: ["#2a2320", "#161211"], suelo: "#100d0c", luz: "#f0cd84", acento: "#6fd6e8" },
  hogar: { pared: ["#2b2226", "#171215"], suelo: "#110d0f", luz: "#f0cd84", acento: "#ff7a8a" },
  laboratorio: { pared: ["#1b2a33", "#0e171d"], suelo: "#0a1116", luz: "#bfefff", acento: "#6fd6e8" },
  hotel: { pared: ["#2a1626", "#150b14"], suelo: "#0f080e", luz: "#ff7a8a", acento: "#6fd6e8" },
  tribunal: { pared: ["#2b1e14", "#17100a"], suelo: "#100b07", luz: "#e0b25c", acento: "#bda6ff" },
  departamento: { pared: ["#2e2a24", "#1a1712"], suelo: "#12100c", luz: "#f6d9a0", acento: "#8fe0a6" },
  aula: { pared: ["#1e2230", "#11131b"], suelo: "#0c0e14", luz: "#e0b25c", acento: "#bda6ff" },
};

function Ventana({ x, y, w, h, id, amanecer = false }: { x: number; y: number; w: number; h: number; id: string; amanecer?: boolean }) {
  const gotas = Array.from({ length: Math.round(w / 9) }, (_, i) => i);
  return (
    <g>
      <defs>
        <clipPath id={`v-${id}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
        <linearGradient id={`c-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={amanecer ? "#f2a65a" : "#0c1830"} />
          <stop offset="1" stopColor={amanecer ? "#5d4a78" : "#1b2946"} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#c-${id})`} />
      <g clipPath={`url(#v-${id})`}>
        {/* horizonte de la ciudad */}
        <path
          d={`M${x} ${y + h}V${y + h * 0.62}h${w * 0.12}v-${h * 0.18}h${w * 0.1}v${h * 0.1}h${w * 0.14}v-${h * 0.26}h${w * 0.1}v${h * 0.2}h${w * 0.16}v-${h * 0.12}h${w * 0.12}v${h * 0.06}h${w * 0.26}V${y + h}z`}
          fill={amanecer ? "#3a2c3c" : "#0a0f1c"}
        />
        {[0.2, 0.44, 0.5, 0.7, 0.86].map((f, i) => (
          <rect key={i} x={x + w * f} y={y + h * (0.7 + (i % 2) * 0.08)} width="3" height="3" fill="#f0cd84" opacity="0.8" />
        ))}
        {!amanecer && (
          <g className="lluvia" stroke="#9fc3ff" strokeOpacity="0.35" strokeWidth="1">
            {gotas.map((i) => (
              <line key={i} x1={x + i * 9 + 4} y1={y + ((i * 23) % h) - 20} x2={x + i * 9} y2={y + ((i * 23) % h) - 6} />
            ))}
          </g>
        )}
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#000" strokeOpacity="0.55" strokeWidth="6" />
      <path d={`M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}`} stroke="#000" strokeOpacity="0.5" strokeWidth="3" />
    </g>
  );
}

function Lampara({ x, y, luz }: { x: number; y: number; luz: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 40} rx="70" ry="46" fill={luz} opacity="0.12" />
      <path d={`M${x} ${y - 60}v44`} stroke="#000" strokeOpacity="0.6" strokeWidth="2" />
      <path d={`M${x - 16} ${y}l6-16h20l6 16z`} fill="#2a2418" stroke={luz} strokeOpacity="0.6" />
      <ellipse cx={x} cy={y + 1} rx="14" ry="3" fill={luz} className="titilar" />
    </g>
  );
}

function Estante({ x, y, w, filas = 3, color = "#3a2a1a" }: { x: number; y: number; w: number; filas?: number; color?: string }) {
  const lomos = ["#6b3a2a", "#2e4a5c", "#5b5230", "#3e2f4f", "#6a5a3a", "#2f4a3a"];
  return (
    <g>
      {Array.from({ length: filas }).map((_, f) => (
        <g key={f}>
          {Array.from({ length: Math.floor(w / 9) }).map((__, i) => (
            <rect key={i} x={x + i * 9 + 1} y={y + f * 34 + ((i * 7) % 6)} width="7" height={28 - ((i * 7) % 6)} fill={lomos[(i + f) % lomos.length]} />
          ))}
          <rect x={x - 2} y={y + f * 34 + 28} width={w + 4} height="5" fill={color} />
        </g>
      ))}
    </g>
  );
}

function Escritorio({ x, y, w, color = "#2b2118" }: { x: number; y: number; w: number; color?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="10" fill={color} />
      <rect x={x + 6} y={y + 10} width={w - 12} height="46" fill="#000" opacity="0.35" />
    </g>
  );
}

function Papeles({ x, y, n = 3 }: { x: number; y: number; n?: number }) {
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => (
        <g key={i}>
          <rect x={x + i * 22} y={y - 6 - (i % 2) * 8} width="18" height={6 + (i % 2) * 8} fill="#e8dfc6" opacity="0.85" />
          <rect x={x + i * 22} y={y - 8 - (i % 2) * 8} width="18" height="2" fill="#bfb293" />
        </g>
      ))}
    </g>
  );
}

function Props({ lugar, p }: { lugar: Lugar; p: Paleta }): ReactNode {
  switch (lugar) {
    case "notaria":
      return (
        <g>
          <Ventana x={262} y={30} w={100} h={120} id="n" />
          <rect x="60" y="18" width="130" height="5" fill="#dff8ff" opacity="0.85" className="titilar" />
          <ellipse cx="125" cy="30" rx="120" ry="30" fill="#bff3ff" opacity="0.06" />
          <circle cx="210" cy="60" r="16" fill="#0d110f" stroke={p.luz} strokeOpacity="0.7" strokeWidth="2" />
          <path d="M210 60v-10M210 60l6 4" stroke={p.luz} strokeWidth="2" />
          <Escritorio x={30} y={176} w={220} />
          <Papeles x={48} y={176} n={4} />
          <Lampara x={200} y={150} luz={p.luz} />
          <rect x="150" y="164" width="30" height="12" rx="2" fill="#7a2230" />
        </g>
      );
    case "registro":
      return (
        <g>
          <g transform="rotate(-6 90 70)">
            <rect x="60" y="34" width="60" height="74" fill="#3a2d1e" stroke={p.acento} strokeOpacity="0.7" strokeWidth="3" />
            <ellipse cx="90" cy="64" rx="16" ry="20" fill="#5a4a38" />
            <path d="M72 108c4-18 32-18 36 0" fill="#2a3a5a" />
          </g>
          <Ventana x={280} y={36} w={84} h={100} id="r" />
          {[40, 90, 140, 190, 240].map((x) => (
            <g key={x} stroke="#566078" strokeWidth="3" fill="none">
              <path d={`M${x} 214l10-30h20l6 30M${x + 10} 184v-20h18v20`} />
            </g>
          ))}
          <Escritorio x={150} y={160} w={130} color="#1f2a3f" />
          <rect x="185" y="148" width="54" height="12" fill="#0f1220" stroke={p.luz} strokeOpacity="0.5" />
          <Lampara x={330} y={150} luz={p.luz} />
        </g>
      );
    case "archivo":
      return (
        <g>
          <Estante x={20} y={34} w={150} filas={4} />
          <Estante x={250} y={34} w={130} filas={4} />
          <path d="M200 60l-18 170M226 60l18 170M188 110h44M184 150h52M180 190h60" stroke="#5b4630" strokeWidth="4" />
          <Lampara x={210} y={40} luz={p.luz} />
        </g>
      );
    case "despacho":
      return (
        <g>
          <g>
            <rect x="238" y="28" width="130" height="110" fill="#0c1426" />
            {Array.from({ length: 11 }).map((_, i) => <rect key={i} x="238" y={30 + i * 10} width="130" height="4" fill="#3a3346" />)}
            {[250, 280, 300, 340].map((x, i) => <rect key={x} x={x} y={40 + i * 18} width="3" height="3" fill="#f0cd84" />)}
          </g>
          <Escritorio x={20} y={170} w={260} />
          {[40, 70, 100, 130, 160].map((x, i) => <rect key={x} x={x} y={170 - (20 + i * 8)} width="22" height={20 + i * 8} fill="#e6dcc0" opacity={0.75 - i * 0.08} />)}
          <rect x="200" y="152" width="30" height="18" rx="3" fill="#2b2b33" stroke={p.acento} strokeOpacity="0.7" />
          <rect x="204" y="155" width="22" height="5" fill={p.acento} opacity="0.7" />
          <Lampara x={250} y={140} luz={p.luz} />
        </g>
      );
    case "banco":
      return (
        <g>
          <circle cx="330" cy="60" r="26" fill="none" stroke={p.luz} strokeOpacity="0.6" strokeWidth="4" />
          <path d="M318 60h24M330 48v24" stroke={p.luz} strokeOpacity="0.6" strokeWidth="4" />
          <rect x="0" y="150" width="400" height="16" fill="#1f3a3e" />
          <rect x="40" y="40" width="220" height="110" fill="#bfefff" opacity="0.06" stroke="#6fd6e8" strokeOpacity="0.35" />
          <rect x="120" y="92" width="80" height="58" rx="4" fill="#0c1a12" stroke="#2b3a33" strokeWidth="4" />
          <rect x="128" y="100" width="64" height="40" fill="#113a22" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x="134" y={106 + i * 8} width={40 - i * 6} height="3" fill="#8fe0a6" opacity="0.85" className={i === 3 ? "titilar" : undefined} />)}
        </g>
      );
    case "cocina":
      return (
        <g>
          <Ventana x={150} y={30} w={100} h={80} id="k" />
          <rect x="310" y="40" width="70" height="150" rx="4" fill="#3a3a40" />
          <path d="M316 100h58" stroke="#23232a" strokeWidth="3" />
          <rect x="0" y="150" width="300" height="12" fill="#3b2f26" />
          <rect x="0" y="162" width="300" height="60" fill="#000" opacity="0.3" />
          <path d="M120 150v-14h18v14z" fill="#e8dfc6" />
          <path d="M124 130q4-8 0-14M132 130q4-8 0-14" stroke="#e8dfc6" strokeOpacity="0.4" fill="none" />
          <Lampara x={60} y={80} luz={p.luz} />
          <rect x="220" y="132" width="26" height="18" rx="3" fill="#10151f" stroke={p.acento} strokeOpacity="0.8" />
        </g>
      );
    case "hogar":
      return (
        <g>
          <Ventana x={40} y={34} w={90} h={90} id="h" />
          <path d="M170 200v-40q0-14 14-14h150q14 0 14 14v40z" fill="#4a2f36" />
          <rect x="176" y="176" width="166" height="24" fill="#3a242a" />
          {[0, 1, 2].map((i) => <rect key={i} x={70 + i * 16} y={196 - i * 4} width="14" height="14" fill={["#e0b25c", "#6fd6e8", "#ff7a8a"][i]} opacity="0.8" />)}
          <Lampara x={360} y={120} luz={p.luz} />
        </g>
      );
    case "laboratorio":
      return (
        <g>
          <rect x="0" y="0" width="400" height="10" fill="#dff8ff" opacity="0.5" />
          <Estante x={30} y={40} w={140} filas={2} color="#2c3e48" />
          {[210, 240, 270, 300].map((x, i) => (
            <path key={x} d={`M${x} 100v30l-10 20h28l-10-20v-30z`} fill={["#6fd6e8", "#8fe0a6", "#bda6ff", "#6fd6e8"][i]} fillOpacity="0.35" stroke="#bfefff" strokeOpacity="0.6" />
          ))}
          <Escritorio x={40} y={170} w={320} color="#c9d3dc" />
          <path d="M100 170v-40l20-10v-10h10v24l-12 8v28" stroke="#7a8793" strokeWidth="6" fill="none" />
          <rect x="250" y="156" width="46" height="14" fill="#efe7cf" transform="rotate(-6 273 163)" />
        </g>
      );
    case "hotel":
      return (
        <g>
          <text x="200" y="70" textAnchor="middle" fontSize="34" fill="none" stroke={p.luz} strokeWidth="2" className="titilar" style={{ letterSpacing: 6 }} fontFamily="Georgia, serif">HOTEL</text>
          <ellipse cx="200" cy="60" rx="120" ry="40" fill={p.luz} opacity="0.08" />
          <path d="M40 40h40l-8 14h-24z" fill="#1c1c24" />
          <circle cx="70" cy="50" r="3" fill="#ff3355" className="titilar" />
          <rect x="300" y="90" width="70" height="60" fill="#1a1016" stroke={p.acento} strokeOpacity="0.4" />
          {Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={310 + (i % 4) * 16} cy={102 + Math.floor(i / 4) * 16} r="3" fill="#e0b25c" opacity="0.8" />)}
          <path d="M30 216v-50h250v50" fill="#2a1822" />
          <rect x="30" y="160" width="250" height="8" fill="#3a2230" stroke={p.luz} strokeOpacity="0.5" />
        </g>
      );
    case "tribunal":
      return (
        <g>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={i * 52} y="20" width="46" height="140" fill="#3a2819" opacity="0.6" />)}
          <circle cx="200" cy="56" r="26" fill="#1c140c" stroke={p.luz} strokeWidth="3" />
          <path d="M200 40v32M186 48h28M186 48l-6 12h12zM214 48l-6 12h12z" stroke={p.luz} strokeWidth="2" fill="none" />
          <path d="M60 120h280v100H60z" fill="#2c1d12" />
          <rect x="60" y="112" width="280" height="10" fill="#4a3220" stroke={p.luz} strokeOpacity="0.4" />
          <rect x="300" y="70" width="80" height="40" fill="#0b0f1a" stroke={p.acento} strokeOpacity="0.6" />
          {[0, 1, 2].map((i) => <rect key={i} x="308" y={78 + i * 10} width={50 - i * 12} height="4" fill={p.acento} opacity="0.8" />)}
        </g>
      );
    case "departamento":
      return (
        <g>
          <Ventana x={200} y={24} w={170} h={130} id="d" amanecer />
          {[[30, 160, 60, 50], [70, 130, 50, 30], [100, 170, 70, 40]].map(([x, y, w, h], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="#8a6a44" />
              <path d={`M${x} ${y + 8}h${w}`} stroke="#6a4f31" strokeWidth="3" />
            </g>
          ))}
          <path d="M180 214v-20h20v20z" fill="#5a3a2a" />
          <path d="M190 194c-12-20-4-34 0-40 6 10 12 22 0 40zM190 196c10-16 22-18 28-16-6 10-14 16-28 16z" fill={p.acento} opacity="0.85" />
        </g>
      );
    case "aula":
      return (
        <g>
          <rect x="60" y="30" width="280" height="90" fill="#1c2a24" stroke="#4a3a2a" strokeWidth="6" />
          <path d="M80 60h120M80 80h90M220 60h90" stroke="#e8e2cf" strokeOpacity="0.35" strokeWidth="3" />
          <path d="M40 200v-50h320v50" fill="#2b2118" />
          {[110, 200, 290].map((x) => <path key={x} d={`M${x - 18} 150v-26q0-10 18-10t18 10v26`} fill="#1a1510" />)}
          <circle cx="360" cy="40" r="14" fill="#0d0f16" stroke={p.luz} strokeWidth="2" />
        </g>
      );
  }
}

export default function Escenario({ lugar, className = "escenario" }: { lugar: Lugar; className?: string }) {
  const p = PALETA[lugar];
  const id = `esc-${lugar}`;
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}-pared`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.pared[0]} />
          <stop offset="1" stopColor={p.pared[1]} />
        </linearGradient>
        <radialGradient id={`${id}-vineta`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.65" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-pared)`} />
      <rect y="200" width="400" height="40" fill={p.suelo} />
      <path d="M0 200h400" stroke={p.luz} strokeOpacity="0.15" />
      <Props lugar={lugar} p={p} />
      <rect width="400" height="240" fill={`url(#${id}-vineta)`} />
    </svg>
  );
}

/** Plano nocturno de la ciudad para el mapa de la campaña: manzanas, el río y parques. */
export function PlanoCiudad({ className = "escenario" }: { className?: string }) {
  const manzanas: JSX.Element[] = [];
  for (let f = 0; f < 7; f++) {
    for (let c = 0; c < 11; c++) {
      const x = c * 38 + (f % 2 ? 8 : 0);
      const y = f * 36;
      const parque = (f * 11 + c) % 17 === 5;
      manzanas.push(
        <rect key={`${f}-${c}`} x={x + 4} y={y + 4} width={30} height={28} rx={3} fill={parque ? "#16261c" : "#141a26"} stroke={parque ? "#2f7a4a" : "#1f2738"} strokeOpacity={parque ? 0.5 : 1} />
      );
    }
  }
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
      <rect width="400" height="240" fill="#0c0f17" />
      {manzanas}
      <path d="M-10 150C60 120 110 170 170 140S290 90 410 120" fill="none" stroke="#12304a" strokeWidth="16" />
      <path d="M-10 150C60 120 110 170 170 140S290 90 410 120" fill="none" stroke="#6fd6e8" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M0 60h400M0 200h400M120 0v240M280 0v240" stroke="#e0b25c" strokeOpacity="0.08" strokeWidth="3" />
      <rect width="400" height="240" fill="url(#plano-vineta)" />
      <defs>
        <radialGradient id="plano-vineta" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
      </defs>
    </svg>
  );
}
