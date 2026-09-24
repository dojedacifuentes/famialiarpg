// ============================================================================
// ESCENARIO — dónde ocurre cada escena y quién habla. Datos de presentación:
// no alteran el contenido de data/dialogos.ts.
// ============================================================================
import type { ClaseBien } from "@/types/game";
import type { NombreIcono } from "@/components/ui/Icono";

export type Lugar =
  | "notaria" | "registro" | "archivo" | "despacho" | "banco" | "cocina"
  | "hogar" | "laboratorio" | "hotel" | "tribunal" | "departamento" | "aula";

export const NOMBRE_LUGAR: Record<Lugar, string> = {
  notaria: "Notaría",
  registro: "Registro Civil",
  archivo: "Conservador y archivo",
  despacho: "Despacho",
  banco: "Sucursal bancaria",
  cocina: "Departamento familiar",
  hogar: "Hogar familiar",
  laboratorio: "Servicio Médico Legal",
  hotel: "Hotel boutique",
  tribunal: "Tribunal de Familia",
  departamento: "Departamento nuevo",
  aula: "Sala de la comisión",
};

export type TipoRetrato =
  | "notario" | "oficial" | "archivista" | "contador" | "ejecutiva" | "conciencia"
  | "perito" | "instinto" | "jueza" | "reconstruido" | "conyuge" | "jugador";

export const ESCENARIO: Record<string, { lugar: Lugar; retrato: TipoRetrato; codex?: string }> = {
  inicio_noviazgo: { lugar: "notaria", retrato: "notario" },
  impedimentos: { lugar: "registro", retrato: "oficial", codex: "nulidad" },
  consentimiento: { lugar: "registro", retrato: "oficial", codex: "nulidad" },
  capitulaciones_previas: { lugar: "notaria", retrato: "notario", codex: "capitulaciones" },
  eleccion_regimen: { lugar: "archivo", retrato: "archivista", codex: "135" },
  haber_intro: { lugar: "despacho", retrato: "contador", codex: "1725" },
  art150_explica: { lugar: "banco", retrato: "ejecutiva", codex: "150" },
  deberes_intro: { lugar: "cocina", retrato: "conciencia", codex: "131" },
  filiacion_intro: { lugar: "laboratorio", retrato: "perito", codex: "filiación" },
  crisis_fidelidad: { lugar: "hotel", retrato: "instinto", codex: "54" },
  cese_intro: { lugar: "notaria", retrato: "notario", codex: "22" },
  divorcio_compensacion: { lugar: "tribunal", retrato: "jueza", codex: "62" },
  segunda_vida_intro: { lugar: "departamento", retrato: "reconstruido", codex: "124" },
};

// ── Etiquetas legibles ──────────────────────────────────────────────────────
export const NOMBRE_CLASE: Record<ClaseBien, string> = {
  individual_marido: "Patrimonio del marido",
  individual_mujer: "Patrimonio de la mujer",
  copropiedad: "Copropiedad acreditada",
  titularidad_pendiente: "Titularidad por acreditar",
  haber_absoluto: "Haber absoluto",
  haber_relativo: "Haber relativo (con recompensa)",
  propio_marido: "Propio del marido",
  propio_mujer: "Propio de la mujer",
  reservado_art150: "Reservado art. 150",
  satelite_art166: "Satélite art. 166",
  satelite_art167: "Satélite art. 167",
  familiar: "Bien familiar",
  excluido_ce_culpa: "Excluido",
};

export const ICONO_NATURALEZA: Record<string, NombreIcono> = {
  inmueble: "inmueble",
  mueble: "mueble",
  dinero: "dinero",
  credito: "credito",
  fungible: "fungible",
  valor_mobiliario: "valores",
};

export const NOMBRE_NATURALEZA: Record<string, string> = {
  inmueble: "Inmueble",
  mueble: "Mueble",
  dinero: "Dinero",
  credito: "Crédito",
  fungible: "Fungible",
  valor_mobiliario: "Valor mobiliario",
};

/**
 * Antecedentes: flags narrativos que funcionan como objetos del expediente.
 * Sólo se listan los que tienen una función en el juego (el tribunal, la
 * compensación o el epílogo los leen).
 */
export const ANTECEDENTES: Record<string, { nombre: string; icono: NombreIcono; uso: string }> = {
  consentimiento_valido: { nombre: "Acta de matrimonio sin vicios", icono: "documento", uso: "Abre el capítulo II." },
  bigamia_oculta: { nombre: "Vínculo anterior ocultado", icono: "alerta", uso: "Hace procedente la nulidad por vínculo no disuelto." },
  registro_esponsales: { nombre: "Esponsales registrados", icono: "pluma", uso: "Sin valor civil (art. 98 CC)." },
  pacto_art167: { nombre: "Capitulación de separación parcial", icono: "pergamino", uso: "Base del patrimonio del art. 167." },
  consciente_150: { nombre: "Carpeta del patrimonio reservado", icono: "llave", uso: "Administración separada (art. 150)." },
  prueba_199_compelida: { nombre: "Orden de prueba biológica", icono: "probeta", uso: "Activa la presunción del art. 199 inc. 2°." },
  prueba_infidelidad: { nombre: "Prueba de infidelidad", icono: "ojo", uso: "Causal culposa ante el tribunal (art. 54 LMC)." },
  prueba_alcoholismo: { nombre: "Registro de alcoholismo", icono: "documento", uso: "Causal culposa ante el tribunal (art. 54 N°5 LMC)." },
  denuncia_vif: { nombre: "Denuncia por VIF", icono: "alerta", uso: "Causal culposa ante el tribunal (Ley 20.066)." },
  cese_22a: { nombre: "Escritura pública del cese", icono: "documento", uso: "Medio del art. 22 a) LMC." },
  cese_22b: { nombre: "Acta ante oficial civil", icono: "documento", uso: "Medio del art. 22 b) LMC." },
  cese_25: { nombre: "Demanda notificada", icono: "documento", uso: "Medio del art. 25 inc. 2° LMC." },
  cese_acreditado: { nombre: "Fecha cierta del cese", icono: "calendario", uso: "Exigida por las vías de divorcio por cese." },
  ce_acordada: { nombre: "Propuesta de compensación", icono: "balanza", uso: "Acuerdo sobre la base del art. 65 LMC." },
  fraude_simulacion: { nombre: "Venta simulada", icono: "alerta", uso: "El epílogo recordará la nulidad pendiente." },
  inventario_124_hecho: { nombre: "Inventario solemne", icono: "pergamino", uso: "Permite segundas nupcias sin sanción (arts. 124-127)." },
  sancion_124: { nombre: "Omisión del inventario solemne", icono: "alerta", uso: "Expone a las sanciones del art. 127 CC." },
  bien_familiar_declarado: { nombre: "Declaración de bien familiar", icono: "casaEscudo", uso: "Limita la disposición sin el otro cónyuge (art. 142)." },
  ruptura_definitiva: { nombre: "Ruptura definitiva", icono: "rayo", uso: "Abre el cese, la separación y la liquidación." },
  examen_aprobado: { nombre: "Cédula aprobada", icono: "examen", uso: "Logro permanente entre ciclos." },
};

export const NOMBRE_ATRIBUTO: Record<string, string> = {
  persuasion: "Persuasión",
  honestidad: "Honestidad",
  impulsividad: "Impulsividad",
  inteligencia_juridica: "Inteligencia jurídica",
  empatia: "Empatía",
  resistencia_emocional: "Resistencia emocional",
};

export const NOMBRE_ESTADO_CIVIL: Record<string, string> = {
  soltero: "Soltería",
  casado: "Casado/a",
  casado_segundo: "Casado/a (segundas nupcias)",
  separado_judicial: "Separación judicial",
  divorciado: "Divorciado/a",
  viudo: "Viudez",
  nulidad: "Matrimonio nulo",
};

export const NOMBRE_REGIMEN: Record<string, string> = {
  sociedad_conyugal: "Sociedad conyugal",
  separacion_total: "Separación total",
  participacion_gananciales: "Participación en gananciales",
};

export function pesos(n: number): string {
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}
