"use client";
// ============================================================================
// GAME SHELL — armazón común de todas las pantallas.
// HUD compacto arriba · escena al centro · navegación siempre accesible.
// Mide exactamente la ventana (100dvh); el documento no se desplaza nunca.
// ============================================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGame } from "@/store/useGame";
import Icono, { type NombreIcono } from "./Icono";

export type Volver = { href: string; etiqueta: string } | { onClick: () => void; etiqueta: string };

const DESTINOS: { href: string; icono: NombreIcono; label: string }[] = [
  { href: "/juego", icono: "mapa", label: "Mapa" },
  { href: "/inventario", icono: "expediente", label: "Expediente" },
  { href: "/codex", icono: "codex", label: "Códex" },
  { href: "/examen", icono: "examen", label: "Examen" },
  { href: "/", icono: "inicio", label: "Portada" },
];

function activo(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href === "/juego") return pathname === "/juego" || pathname.startsWith("/mundo") || pathname.startsWith("/liquidacion");
  return pathname === href || pathname.startsWith(href + "/");
}

function NavPrincipal() {
  const pathname = usePathname();
  return (
    <nav className="shell-nav" aria-label="Navegación principal">
      <ul className="nav-lista">
        {DESTINOS.map((d) => (
          <li key={d.href}>
            <Link href={d.href} className="nav-enlace" aria-current={activo(pathname, d.href) ? "page" : undefined}>
              <Icono nombre={d.icono} tam={22} />
              <span>{d.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Stat({ icono, etiqueta, corta, valor, min, max, color }: { icono: NombreIcono; etiqueta: string; corta: string; valor: number; min: number; max: number; color: string }) {
  const previo = useRef(valor);
  const [cambio, setCambio] = useState<"sube" | "baja" | undefined>();
  useEffect(() => {
    if (valor === previo.current) return;
    setCambio(valor > previo.current ? "sube" : "baja");
    previo.current = valor;
    const t = setTimeout(() => setCambio(undefined), 950);
    return () => clearTimeout(t);
  }, [valor]);
  const pct = Math.max(0, Math.min(100, ((valor - min) / (max - min)) * 100));
  return (
    <div className="stat-chip cifra" data-cambio={cambio} title={`${etiqueta}: ${valor}`} role="img" aria-label={`${etiqueta}: ${valor} (escala ${min} a ${max})`}>
      <Icono nombre={icono} tam={16} style={{ color }} />
      <span>
        <span className="hidden sm:inline txt-3 font-normal mr-1">{corta}</span>
        {valor}
      </span>
      <span className="barra" aria-hidden>
        <span style={{ width: `${pct}%`, background: color }} />
      </span>
    </div>
  );
}

export function HudStats() {
  const p = useGame((s) => s.personaje);
  return (
    <div className="hud-stats">
      <Stat icono="reputacion" etiqueta="Reputación" corta="Rep." valor={p.reputacion} min={-100} max={100} color="#bda6ff" />
      <Stat icono="trauma" etiqueta="Trauma" corta="Trauma" valor={p.trauma} min={0} max={100} color="#ff7a8a" />
      <Stat icono="economia" etiqueta="Nivel económico" corta="Econ." valor={p.nivelEconomico} min={0} max={100} color="#e0b25c" />
    </div>
  );
}

export default function GameShell({
  eyebrow,
  titulo,
  volver,
  stats = true,
  nav = true,
  acciones,
  children,
  etiquetaMain,
}: {
  eyebrow?: string;
  titulo: string;
  volver?: Volver;
  stats?: boolean;
  nav?: boolean;
  acciones?: ReactNode;
  children: ReactNode;
  etiquetaMain?: string;
}) {
  useEffect(() => {
    document.documentElement.classList.add("bloqueo");
    return () => document.documentElement.classList.remove("bloqueo");
  }, []);

  return (
    <div className="shell">
      <a href="#escena" className="skip-link">Saltar a la escena</a>
      <header className="shell-hud">
        {volver && (
          "href" in volver ? (
            <Link href={volver.href} className="btn btn-secundario btn-icono fijo" aria-label={volver.etiqueta} title={volver.etiqueta}>
              <Icono nombre="volver" tam={20} />
            </Link>
          ) : (
            <button type="button" onClick={volver.onClick} className="btn btn-secundario btn-icono" aria-label={volver.etiqueta} title={volver.etiqueta}>
              <Icono nombre="volver" tam={20} />
            </button>
          )
        )}
        <div className="hud-titulo">
          {eyebrow && <div className="hud-eyebrow">{eyebrow}</div>}
          <h1 className="hud-nombre">{titulo}</h1>
        </div>
        {acciones}
        {stats && <HudStats />}
      </header>
      <main id="escena" className="shell-main" aria-label={etiquetaMain ?? titulo} tabIndex={-1}>
        {children}
      </main>
      {nav ? <NavPrincipal /> : <div className="shell-nav" aria-hidden />}
    </div>
  );
}
