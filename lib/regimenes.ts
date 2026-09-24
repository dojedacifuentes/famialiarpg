import type { Bien, ClaseBien, Regimen, Sexo } from "@/types/game";
import type { CasoHaber } from "@/data/casos";

export const REGIMENES: Record<Regimen, { nombre: string; taller: string; regla: string; articulo: string }> = {
  sociedad_conyugal: { nombre: "Sociedad conyugal", taller: "Haber social", regla: "Distingue naturaleza, título y momento de adquisición. Aplica haber absoluto, relativo, bienes propios y, cuando corresponda, patrimonio reservado.", articulo: "Arts. 150, 1725–1736 CC" },
  separacion_total: { nombre: "Separación total", taller: "Patrimonios independientes", regla: "Identifica al titular y su título de adquisición. El matrimonio no convierte los bienes en sociales; una compra conjunta puede generar copropiedad, no sociedad conyugal.", articulo: "Art. 159 CC" },
  participacion_gananciales: { nombre: "Participación en los gananciales", taller: "Titularidad y gananciales", regla: "Durante el régimen los patrimonios permanecen separados. Al terminar se comparan los gananciales netos, con los ajustes legales: puede nacer un crédito, no una mitad de cada bien.", articulo: "Arts. 1792-2, 1792-6 y 1792-19 CC" },
};

export function opcionesPatrimoniales(regimen: Regimen): ClaseBien[] {
  return regimen === "sociedad_conyugal"
    ? ["haber_absoluto", "haber_relativo", "propio_marido", "propio_mujer", "reservado_art150"]
    : ["individual_marido", "individual_mujer", "copropiedad", "titularidad_pendiente"];
}

/** Adapta los supuestos, no sólo las etiquetas. Los casos antiguos se conservan en SC. */
export function casoParaRegimen(caso: CasoHaber, regimen: Regimen, sexo: Sexo): CasoHaber {
  if (regimen === "sociedad_conyugal") return caso;
  const titular = caso.adquirente ?? (sexo === "femenino" ? "mujer" : "marido");
  return {
    ...caso,
    adquirente: titular,
    nombre: caso.nombre.replace(/dineros sociales/g, "fondos del titular").replace(/utilidades sociales/g, "rendimientos del titular"),
    pista: `Busca quién adquiere y con qué título. No se aplica el haber social ni el patrimonio reservado del art. 150 en este régimen.`,
  };
}

/** Sólo admite balances netos ya ajustados/valorizados conforme a la ley. No suma casos didácticos. */
export function calcularParticipacion(origenA: number, finalA: number, origenB: number, finalB: number) {
  const valores = [origenA, finalA, origenB, finalB];
  if (valores.some((n) => !Number.isFinite(n) || Math.abs(n) > Number.MAX_SAFE_INTEGER / 4)) throw new Error("Balance no válido");
  const gananciaA = Math.max(0, finalA - Math.max(0, origenA));
  const gananciaB = Math.max(0, finalB - Math.max(0, origenB));
  return { gananciaA, gananciaB, credito: Math.abs(gananciaA - gananciaB) / 2, acreedor: gananciaA === gananciaB ? null : gananciaA < gananciaB ? "A" as const : "B" as const };
}

export function esBienDelCiclo(b: Bien, ciclo: number) { return (b.cicloVital ?? 1) === ciclo; }
