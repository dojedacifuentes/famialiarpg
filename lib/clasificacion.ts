// Corrección de un caso del clasificador del haber. El cónyuge adquirente se
// toma del enunciado del caso cuando lo nombra; si no, del personaje jugador.
import { clasificarBien } from "@/lib/reglas";
import type { CasoHaber, RolConyugal } from "@/data/casos";
import type { Sexo } from "@/types/game";

export function clasificarCaso(caso: CasoHaber, sexoJugador: Sexo) {
  const adquirente: RolConyugal = caso.adquirente ?? (sexoJugador === "femenino" ? "mujer" : "marido");
  const r = clasificarBien(
    {
      id: "caso",
      nombre: caso.nombre,
      valor: caso.valor,
      naturaleza: caso.naturaleza,
      fuente: caso.fuente,
      tituloOnerosoOGratuito: caso.tituloOnerosoOGratuito,
      adquiridoAntesDelMatrimonio: caso.adquiridoAntesDelMatrimonio,
      subroga: caso.subroga,
    },
    adquirente === "mujer" ? "femenino" : "masculino"
  );
  return { ...r, adquirente };
}

/**
 * Asiento del libro de recompensas que genera un caso bien clasificado.
 * En la mejora de un bien propio con dineros sociales la acreedora es la
 * sociedad (art. 1746); en el haber relativo, el cónyuge aportante.
 */
export function asientoRecompensa(caso: CasoHaber, adquirente: RolConyugal) {
  const mejora = caso.fuente === "mejora_propio";
  return {
    acreedor: mejora ? ("sociedad" as const) : adquirente,
    deudor: mejora ? adquirente : ("sociedad" as const),
  };
}
