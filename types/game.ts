// ============================================================================
// TIPOS DEL DOMINIO — Derecho de Familia y Civil chileno
// Referencias: Código Civil (CC), Ley de Matrimonio Civil 19.947 (LMC),
// Ley de Tribunales de Familia 19.968 (LTF), Ley 14.908 sobre Alimentos,
// Ley 20.066 sobre VIF, Ley 19.585 sobre filiación, Ley 21.400 (matrimonio
// igualitario), Ley 21.484 (responsabilidad parental y deudores de alimentos).
// ============================================================================

export type Sexo = "masculino" | "femenino";

export type Regimen = "sociedad_conyugal" | "separacion_total" | "participacion_gananciales";

export type Atributos = {
  persuasion: number;
  honestidad: number;
  impulsividad: number;
  inteligencia_juridica: number;
  empatia: number;
  resistencia_emocional: number;
};

export type Origen = "popular" | "clase_media" | "elite" | "rural" | "academico";
export type Profesion = "abogado" | "comerciante" | "funcionario" | "artista" | "ingeniero" | "obrero";

export type Personaje = {
  nombre: string;
  sexo: Sexo;
  origen: Origen;
  profesion: Profesion;
  nivelEconomico: number;
  atributos: Atributos;
  reputacion: number;
  trauma: number;
  estadoCivil: "soltero" | "casado" | "separado_judicial" | "divorciado" | "viudo" | "nulidad" | "casado_segundo";
  regimen?: Regimen;
  fechaMatrimonio?: string; // ISO; relevante para art. 22 LMC y pre/post 18-11-2004
  cicloVital: number;       // contador de "vidas" post-divorcio/nulidad
};

// ============== BIENES ==============
// Clases conforme arts. 1725 ss. y patrimonios satélites (150, 166, 167)
export type ClaseBien =
  | "individual_marido"
  | "individual_mujer"
  | "copropiedad"
  | "titularidad_pendiente"
  | "haber_absoluto"         // Art. 1725 N°1, 2, 5
  | "haber_relativo"         // Art. 1725 N°3, 4 (con recompensa)
  | "propio_marido"          // Arts. 1726, 1736
  | "propio_mujer"           // Arts. 1726, 1736
  | "reservado_art150"       // Patrimonio reservado de la mujer casada en SC
  | "satelite_art166"        // Donación/herencia/legado con condición de no admin. del marido
  | "satelite_art167"        // Separación parcial pactada en capitulaciones
  | "familiar"               // Bien familiar declarado (arts. 141 ss.)
  | "excluido_ce_culpa";     // No procede recompensa por culpa, etc.

export type NaturalezaBien = "inmueble" | "mueble" | "dinero" | "credito" | "fungible" | "valor_mobiliario";

export type Bien = {
  id: string;
  nombre: string;
  valor: number;
  clase: ClaseBien;
  naturaleza: NaturalezaBien;
  adquiridoAntesDelMatrimonio?: boolean;
  fuente: "trabajo" | "trabajo_separado_mujer" | "herencia" | "donacion" | "compra" | "frutos" | "indemnizacion" | "subrogacion" | "permuta" | "mejora_propio";
  tituloOnerosoOGratuito?: "oneroso" | "gratuito";
  oculto?: boolean;
  generaRecompensa?: number;
  declaradoBienFamiliar?: boolean;
  cicloVital?: number;
  titular?: "marido" | "mujer" | "ambos";
  regimenAdquisicion?: Regimen;
  /** Los casos del taller son independientes, no un balance consolidado. */
  casoDidactico?: boolean;
  // Para subrogación (arts. 1727-1733): el bien que se sustituye debe ser propio
  subroga?: { delConyuge: "marido" | "mujer"; eraInmueble: boolean };
};

// ============== HIJOS ==============
export type Hijo = {
  id: string;
  nombre: string;
  edad: number;
  filiacion: "matrimonial" | "no_matrimonial" | "adoptiva";
  reconocido: boolean;
  cuidadoPersonal?: "padre" | "madre" | "compartido" | "tercero";
  alimentosAlDia: boolean;
  afecto: number;
  trauma: number;
  recuerdos: string[];
  rndpa?: boolean; // Registro Nacional de Deudores de Pensiones de Alimentos (Ley 21.389)
  reclamacionFiliacion?: { interpuesta: boolean; acogida?: boolean; art: string };
  impugnacionFiliacion?: { interpuesta: boolean; acogida?: boolean; art: string };
};

// ============== CÓNYUGE ==============
export type Conyuge = {
  nombre: string;
  sexo: Sexo;
  afecto: number;
  confianza: number;
  honestidad: number;
  patrimonioOculto: number;
  infidelidades: number;
  vif: boolean;
  alcoholismo: boolean;
  // Cumplimiento de deberes art. 131-134 CC (0-100)
  deberesCumplidos: number;
  acuerdoRegulador?: AcuerdoRegulador;
};

// ============== DEBERES MATRIMONIALES ==============
export type DeberMatrimonial =
  | "fidelidad"            // Art. 131, 132 CC
  | "socorro"              // Art. 131, 134 CC (auxilio económico)
  | "ayuda_mutua"          // Art. 131 CC
  | "respeto_proteccion"   // Art. 131 CC
  | "vida_en_comun"        // Art. 133 CC
  | "auxilio_enfermedad";  // Art. 134 CC (deber de socorro extendido)

export type IncumplimientoDeber = {
  id: string;
  deber: DeberMatrimonial;
  fecha: number;
  detalle: string;
  articulo: string;
  habilitaCulpa: boolean; // si esta conducta basta para art. 54 LMC
};

// ============== RECOMPENSAS ==============
export type Recompensa = {
  id: string;
  acreedor: "marido" | "mujer" | "sociedad";
  deudor: "marido" | "mujer" | "sociedad";
  monto: number;
  motivo: string;
  articulo: string;
};

// ============== ACUERDO REGULADOR (Art. 21 y 27 LMC) ==============
export type AcuerdoRegulador = {
  alimentosHijos: boolean;            // monto y forma
  cuidadoPersonal: boolean;           // unipersonal o compartido
  relacionDirectaRegular: boolean;    // antes "régimen de visitas"
  alimentosConyuge?: boolean;
  bienesFamiliares?: boolean;
  liquidacionRegimen?: boolean;       // si hubo SC o PG
  compensacionEconomica?: boolean;
  completo: boolean;                  // ¿cubre todas las materias?
  suficiente: boolean;                // ¿resguarda interés superior niños/cónyuge débil?
};

// ============== FECHA CIERTA DEL CESE DE CONVIVENCIA (Art. 22 y 25 LMC) ==============
export type MedioFechaCierta =
  | "escritura_publica"               // Art. 22 letra a) LMC
  | "escritura_privada_protocolizada" // Art. 22 letra a) LMC
  | "acta_oficial_registro_civil"     // Art. 22 letra b) LMC
  | "transaccion_judicial_aprobada"   // Art. 22 letra c) LMC
  | "notificacion_demanda_art25";     // Art. 25 inc. 2° LMC

export type FechaCiertaCese = {
  medio: MedioFechaCierta;
  fecha: string; // ISO
  valida: boolean;
  articulo: string;
  observaciones?: string;
};

// ============== COMPENSACIÓN ECONÓMICA (Arts. 61-66 LMC) ==============
export type FactoresCE = {
  duracionMatrimonioAños: number;
  edadConyugeBeneficiario: number;
  saludDeficiente: boolean;
  situacionPrevisional: "deficitaria" | "media" | "suficiente";
  calificacionProfesional: "baja" | "media" | "alta";
  accesoMercadoLaboral: "imposible" | "dificil" | "factible";
  dedicacionExclusivaHogar: boolean;
  colaboracionActividadConyuge: boolean;
};

export type ModalidadPagoCE =
  | "monto_unico"
  | "cuotas_reajustables"
  | "transferencia_bienes"
  | "usufructo_uso_habitacion";

export type CompensacionEconomica = {
  beneficiario: "marido" | "mujer";
  factores: FactoresCE;
  montoEstimado: number;
  modalidad: ModalidadPagoCE;
  bloqueadaPorCulpaGrave?: boolean; // art. 62 inc. 2° LMC
  acordada?: boolean;
  ejecutoriada?: boolean;
};

// ============== ACCIONES ==============
export type Flag = string;

export type Mundo =
  | "noviazgo"
  | "matrimonio"
  | "haber"
  | "patrimonios_satelite"
  | "deberes"
  | "hijos"
  | "filiacion_acciones"
  | "bienes_familiares"
  | "crisis"
  | "cese_convivencia"
  | "acuerdo_regulador"
  | "separacion"
  | "nulidad"
  | "compensacion_economica"
  | "liquidacion"
  | "segunda_vida"
  | "examen"
  | "sucesion";

export type Logro = {
  id: string;
  titulo: string;
  descripcion: string;
  articulo: string;
  desbloqueado: boolean;
  fecha?: number;
};

// ============== STATE GLOBAL ==============
/** Valor de un hecho único de la partida (decisión, avance de actividad…). */
export type HechoValor = string | number | boolean | number[];

export type SaveState = {
  version: number;
  /** Escena resuelta → índice de la opción elegida (-1 si no tenía opciones). Desde v4. */
  escenas: Record<string, number>;
  /** Acciones de una sola vez por ciclo vital (evita duplicar recompensas). Desde v4. */
  hechos: Record<string, HechoValor>;
  creado: number;
  ultimoGuardado: number;
  personaje: Personaje;
  conyuge?: Conyuge;
  hijos: Hijo[];
  bienes: Bien[];
  recompensas: Recompensa[];
  incumplimientos: IncumplimientoDeber[];
  fechaCierta?: FechaCiertaCese;
  ce?: CompensacionEconomica;
  flags: Flag[];
  mundoActual: Mundo;
  log: { t: number; texto: string; tag?: string }[];
  logros: Logro[];
  finalizado?: boolean;
  epilogo?: string;
};
