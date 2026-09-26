/**
 * EVA ARCADE — la colección de juegos de EVA a la que pertenece Expediente
 * 1725. Su puerta es `/links` en la landing de EVA: desde ahí se llega a cada
 * juego y a ella se vuelve (`components/eva/VolverArcade.tsx`).
 *
 * La marca de EVA (el símbolo □X) llega calculada en `lib/marca-eva.ts`,
 * generada desde la landing (eva.proyecto01, `scripts/brand-assets.mjs --kit`);
 * no se edita a mano.
 */
export const ARCADE = {
  nombre: "EVA ARCADE",
  puerta: "https://evaproyecto01.vercel.app/links",
  volver: "Volver a EVA ARCADE",
  /** Nombre y categoría del juego dentro del Arcade, como en su tarjeta de /links. */
  juego: "EXPEDIENTE 1725",
  categoria: "RPG · Derecho de Familia",
  /** Su color en el Arcade: el magenta claro de su tarjeta en /links. */
  tinta: "#e396f2",
  /** Dirección pública del juego (la de su proyecto en Vercel). */
  sitio: "https://evaarcadefamilia.vercel.app",
} as const;

export { MARCA as MARCA_EVA } from "./marca-eva";
