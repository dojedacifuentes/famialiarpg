import SimboloEva from "./SimboloEva";
import { ARCADE } from "@/lib/eva-arcade";

/**
 * La marca de EVA ARCADE: el símbolo oficial □X de EVA y el nombre del Arcade,
 * como en su puerta (`/links` de la landing de EVA). Hasta septiembre de 2026 era
 * un ƎVΛ dibujado a mano con «// ARCADE».
 *
 * `compacta`: para el centro del mapa (ahí sólo se ve el símbolo) y la partida
 * rápida.
 */
export default function MarcaEva({ compacta = false }: { compacta?: boolean }) {
  return (
    <span className={`eva-marca ${compacta ? "eva-marca-compacta" : ""}`}>
      <SimboloEva />
      <span className="eva-wordmark">{ARCADE.nombre}</span>
    </span>
  );
}
