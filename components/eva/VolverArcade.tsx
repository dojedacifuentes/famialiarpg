import SimboloEva from "./SimboloEva";
import Icono from "@/components/ui/Icono";
import { ARCADE } from "@/lib/eva-arcade";

/**
 * VUELTA A EVA ARCADE — el símbolo □X de EVA con el nombre del Arcade, como
 * botón. Lleva a la puerta del Arcade (`/links` de la landing de EVA), en la
 * misma pestaña: por ahí se llega al juego y por ahí se vuelve.
 *
 * En la portada va completo, con la flecha de volver, en su propia fila sobre
 * la tarjeta. En la cabecera, `compacto` y sólo desde tableta: en el teléfono
 * la fila del HUD ya va llena, y se sale por la portada.
 */
export default function VolverArcade({ compacto = false }: { compacto?: boolean }) {
  return (
    <a
      href={ARCADE.puerta}
      className={`btn btn-secundario volver-arcade ${compacto ? "volver-arcade-cabecera" : ""}`}
      aria-label={ARCADE.volver}
      title={ARCADE.volver}
    >
      {!compacto && <Icono nombre="volver" tam={18} />}
      <SimboloEva />
      <span className="volver-arcade-nombre">{ARCADE.nombre}</span>
    </a>
  );
}
