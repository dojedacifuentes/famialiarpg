// Casos de clasificación patrimonial. Contenido jurídico trasladado sin cambios
// desde components/ClasificadorBienes.tsx y components/PatrimonioSatelitePanel.tsx.
//
// Único añadido: `adquirente`, cuando el enunciado del caso nombra al cónyuge
// que adquiere ("del marido", "a la mujer"). Antes el motor recibía siempre el
// sexo del personaje jugador, de modo que "Parcela donada a la mujer" se
// calificaba como propio del marido si el jugador era hombre (y viceversa).
import type { Bien, NaturalezaBien } from "@/types/game";
import type { clasificarSatelite } from "@/lib/reglas";

export type RolConyugal = "marido" | "mujer";

export type CasoHaber = {
  nombre: string;
  valor: number;
  naturaleza: NaturalezaBien;
  fuente: Bien["fuente"];
  tituloOnerosoOGratuito?: "oneroso" | "gratuito";
  adquiridoAntesDelMatrimonio?: boolean;
  subroga?: { delConyuge: RolConyugal; eraInmueble: boolean };
  adquirente?: RolConyugal;
  pista: string;
};

// 23 casos rigurosos cubriendo todas las hipótesis del art. 1725 + 150 + 1726 + 1736 + 1727 + 1733 + 1739 + 1746.
export const CASOS_HABER: CasoHaber[] = [
  // -- HABER ABSOLUTO (art. 1725 N°1) --
  { nombre: "Sueldo del marido devengado en marzo", valor: 1_500_000, naturaleza: "dinero", fuente: "trabajo", tituloOnerosoOGratuito: "oneroso", adquirente: "marido", pista: "Salario devengado durante la sociedad. Art. 1725 N°1." },
  { nombre: "Bono de fin de año del marido", valor: 2_500_000, naturaleza: "dinero", fuente: "trabajo", tituloOnerosoOGratuito: "oneroso", adquirente: "marido", pista: "Emolumento del empleo." },
  { nombre: "Honorarios profesionales del marido", valor: 4_000_000, naturaleza: "dinero", fuente: "trabajo", tituloOnerosoOGratuito: "oneroso", adquirente: "marido", pista: "Producto del trabajo durante la vigencia." },

  // -- PATRIMONIO RESERVADO ART. 150 --
  { nombre: "Sueldo de la mujer en empresa propia (trabajo separado del marido)", valor: 1_800_000, naturaleza: "dinero", fuente: "trabajo_separado_mujer", adquirente: "mujer", pista: "Trabajo separado de la mujer en SC: patrimonio reservado." },
  { nombre: "Inmueble adquirido por la mujer con su sueldo separado", valor: 50_000_000, naturaleza: "inmueble", fuente: "trabajo_separado_mujer", adquirente: "mujer", pista: "Adquirido con producto del trabajo separado." },
  { nombre: "Honorarios docentes de la mujer (cátedra particular)", valor: 600_000, naturaleza: "dinero", fuente: "trabajo_separado_mujer", adquirente: "mujer", pista: "Trabajo separado de la mujer." },

  // -- HABER ABSOLUTO (art. 1725 N°2) — Frutos --
  { nombre: "Cosecha del fundo propio del marido", valor: 4_000_000, naturaleza: "fungible", fuente: "frutos", adquirente: "marido", pista: "Frutos naturales de bien propio: haber absoluto." },
  { nombre: "Intereses bancarios devengados durante la sociedad", valor: 800_000, naturaleza: "dinero", fuente: "frutos", pista: "Frutos civiles." },
  { nombre: "Renta de arrendamiento del inmueble propio de la mujer", valor: 1_200_000, naturaleza: "dinero", fuente: "frutos", adquirente: "mujer", pista: "Frutos civiles de bien propio durante la sociedad." },

  // -- HABER ABSOLUTO (art. 1725 N°5) — Adquisiciones a título oneroso durante --
  { nombre: "Auto comprado durante el matrimonio con dineros sociales", valor: 12_000_000, naturaleza: "mueble", fuente: "compra", tituloOnerosoOGratuito: "oneroso", pista: "Mueble adquirido a título oneroso durante vigencia." },
  { nombre: "Departamento comprado durante el matrimonio", valor: 90_000_000, naturaleza: "inmueble", fuente: "compra", tituloOnerosoOGratuito: "oneroso", pista: "Inmueble adquirido a título oneroso durante vigencia." },
  { nombre: "Acciones bursátiles compradas con utilidades sociales", valor: 20_000_000, naturaleza: "valor_mobiliario", fuente: "compra", tituloOnerosoOGratuito: "oneroso", pista: "Valor mobiliario adquirido a título oneroso." },

  // -- BIEN PROPIO (art. 1726) — Inmueble a título gratuito durante --
  { nombre: "Casa heredada del abuelo del marido durante el matrimonio", valor: 80_000_000, naturaleza: "inmueble", fuente: "herencia", tituloOnerosoOGratuito: "gratuito", adquirente: "marido", pista: "Inmueble adquirido a título gratuito durante: propio del heredero." },
  { nombre: "Parcela donada a la mujer por su madre durante el matrimonio", valor: 60_000_000, naturaleza: "inmueble", fuente: "donacion", tituloOnerosoOGratuito: "gratuito", adquirente: "mujer", pista: "Inmueble a título gratuito durante vigencia: propio." },

  // -- HABER RELATIVO (art. 1725 N°4) — Mueble a título gratuito durante --
  { nombre: "Joyas donadas por una tía al marido durante el matrimonio", valor: 2_000_000, naturaleza: "mueble", fuente: "donacion", tituloOnerosoOGratuito: "gratuito", adquirente: "marido", pista: "Mueble a título gratuito durante vigencia: haber relativo con recompensa." },
  { nombre: "Auto recibido como legado por la mujer durante el matrimonio", valor: 15_000_000, naturaleza: "mueble", fuente: "herencia", tituloOnerosoOGratuito: "gratuito", adquirente: "mujer", pista: "Mueble a título gratuito durante vigencia." },

  // -- HABER RELATIVO (art. 1725 N°3) — Dinero --
  { nombre: "Premio en efectivo recibido por la mujer durante el matrimonio", valor: 5_000_000, naturaleza: "dinero", fuente: "donacion", tituloOnerosoOGratuito: "gratuito", adquirente: "mujer", pista: "Dinero a título gratuito durante vigencia: art. 1725 N°3." },

  // -- BIENES APORTADOS ANTES DEL MATRIMONIO --
  { nombre: "Inmueble adquirido por el marido antes del matrimonio", valor: 100_000_000, naturaleza: "inmueble", fuente: "compra", adquiridoAntesDelMatrimonio: true, tituloOnerosoOGratuito: "oneroso", adquirente: "marido", pista: "Inmueble anterior al matrimonio: propio (art. 1736)." },
  { nombre: "Mil libros aportados al casarse", valor: 3_000_000, naturaleza: "mueble", fuente: "compra", adquiridoAntesDelMatrimonio: true, tituloOnerosoOGratuito: "oneroso", pista: "Muebles aportados al matrimonio: haber relativo." },
  { nombre: "$10.000.000 en cuenta de ahorro aportados al casarse", valor: 10_000_000, naturaleza: "dinero", fuente: "compra", adquiridoAntesDelMatrimonio: true, pista: "Dinero aportado al matrimonio: haber relativo art. 1725 N°3." },

  // -- SUBROGACIÓN REAL --
  { nombre: "Inmueble adquirido en subrogación del inmueble propio anterior del marido", valor: 70_000_000, naturaleza: "inmueble", fuente: "subrogacion", subroga: { delConyuge: "marido", eraInmueble: true }, adquirente: "marido", pista: "Subrogación de inmueble propio: art. 1727 N°1 y 1733." },

  // -- MEJORAS A BIEN PROPIO CON DINEROS SOCIALES (art. 1746) --
  { nombre: "Ampliación del inmueble propio del marido pagada con dineros sociales", valor: 8_000_000, naturaleza: "inmueble", fuente: "mejora_propio", adquirente: "marido", pista: "Mejora a bien propio con dineros sociales: el bien sigue siendo propio pero la sociedad tiene recompensa (art. 1746)." },

  // -- INDEMNIZACIÓN --
  { nombre: "Indemnización por accidente laboral del marido durante el matrimonio", valor: 6_000_000, naturaleza: "dinero", fuente: "indemnizacion", adquirente: "marido", pista: "Indemnización durante la vigencia: regla general haber absoluto." },
];

export type CasoSatelite = {
  nombre: string;
  valor: number;
  origen: Parameters<typeof clasificarSatelite>[0]["origen"];
  esperado: "reservado_art150" | "satelite_art166" | "satelite_art167" | "haber_absoluto";
};

export const CASOS_SATELITE: CasoSatelite[] = [
  { nombre: "Sueldo mensual de la mujer obtenido en empleo propio", valor: 1_200_000, origen: "trabajo_separado", esperado: "reservado_art150" },
  { nombre: "Auto comprado por la mujer con su sueldo profesional", valor: 12_000_000, origen: "trabajo_separado", esperado: "reservado_art150" },
  { nombre: "Casa heredada por la mujer con condición de que el marido no la administre", valor: 90_000_000, origen: "donacion_condicion_no_admin", esperado: "satelite_art166" },
  { nombre: "Acciones pactadas como separadas en capitulación matrimonial preparatoria", valor: 30_000_000, origen: "capitulaciones_separacion_parcial", esperado: "satelite_art167" },
];
