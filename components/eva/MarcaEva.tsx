import { useId } from "react";

/** Geometría de las referencias del propietario: E de tres trazos, V, A abierta. */
export default function MarcaEva({ compacta = false }: { compacta?: boolean }) {
  const id = useId();
  return <span className={`eva-marca ${compacta ? "eva-marca-compacta" : ""}`}>
    <svg viewBox="0 0 220 62" role="img" aria-label="EVA" fill="none">
      <defs><linearGradient id={id}><stop stopColor="#64D8FF"/><stop offset=".55" stopColor="#B5BFFF"/><stop offset="1" stopColor="#D59AFF"/></linearGradient></defs>
      <path d="M8 10H57 M8 31H57 M8 52H57 M79 10L108 52L137 10 M157 52L184 10L212 52" stroke={`url(#${id})`} strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter"/>
    </svg><span className="eva-wordmark">{"// ARCADE"}</span>
  </span>;
}
