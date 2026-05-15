import type {
  Bien, ClaseBien, Sexo, FactoresCE, AcuerdoRegulador, MedioFechaCierta, FechaCiertaCese,
} from "@/types/game";

// ============================================================================
//  REGLAS PATRIMONIALES DE LA SOCIEDAD CONYUGAL — Arts. 1725 ss. CC
// ============================================================================
//
// HABER ABSOLUTO (art. 1725) — ingresa al haber social sin obligación de restituir:
//   N°1: salarios y emolumentos de todo género de empleos y oficios.
//   N°2: frutos, réditos, pensiones, intereses y lucros de bienes sociales y propios.
//   N°5: bienes adquiridos a título oneroso durante la vigencia.
//
// HABER RELATIVO (art. 1725) — ingresa CON cargo de recompensa al cónyuge aportante:
//   N°3: dinero aportado al matrimonio o adquirido a título gratuito durante.
//   N°4: cosas muebles aportadas o adquiridas a título gratuito durante.
//
// BIENES PROPIOS:
//   Art. 1726: bienes adquiridos a título gratuito durante el matrimonio (inmuebles).
//   Art. 1736: bienes adquiridos antes del matrimonio (inmuebles).
//   Arts. 1727-1733: subrogación real — el bien adquirido toma el carácter del que sustituye.
//
// PATRIMONIOS SATÉLITES DE LA MUJER CASADA EN SOCIEDAD CONYUGAL:
//   Art. 150: PATRIMONIO RESERVADO. Bienes adquiridos por la mujer con producto de
//             su trabajo separado del marido. Administra como separada de bienes.
//             Al término de la SC: opción de aceptar o renunciar gananciales.
//   Art. 166: bienes adquiridos por la mujer por herencia, legado o donación con la
//             condición precisa de que no los administre el marido.
//   Art. 167: separación parcial pactada en capitulaciones matrimoniales.
//
// ADMINISTRACIÓN:
//   Art. 1749: el marido es jefe de la sociedad conyugal y administra los bienes
//              sociales y los de su mujer.
//   Art. 1754: la mujer NO puede enajenar ni gravar sus bienes propios sin
//              autorización del marido.
//
// LIQUIDACIÓN: arts. 1765-1788.
// ============================================================================

export type ClasificacionRazonada = {
  clase: ClaseBien;
  recompensa: number;
  justificacion: string;
  articulo: string;
};

/**
 * Clasifica un bien según las reglas patrimoniales rigurosas de la sociedad
 * conyugal chilena. Distingue NATURALEZA del bien (mueble/inmueble), TÍTULO
 * de adquisición (oneroso/gratuito) y MOMENTO (antes/durante).
 *
 * Tabla de decisión (art. 1725, 1726, 1736, 1727, 150):
 *
 *  ANTES DEL MATRIMONIO:
 *    Inmueble (cualquier título)        → BIEN PROPIO (art. 1736)
 *    Mueble o dinero (cualquier título) → HABER RELATIVO con recompensa (art. 1725 N°3 y 4)
 *
 *  DURANTE EL MATRIMONIO:
 *    Salario / emolumento del trabajo     → HABER ABSOLUTO (art. 1725 N°1)
 *    Trabajo SEPARADO de la mujer en SC   → RESERVADO ART. 150
 *    Frutos de bienes propios o sociales  → HABER ABSOLUTO (art. 1725 N°2)
 *    Inmueble a título ONEROSO            → HABER ABSOLUTO (art. 1725 N°5)
 *    Inmueble a título GRATUITO           → BIEN PROPIO (art. 1726)
 *    Mueble a título ONEROSO              → HABER ABSOLUTO (art. 1725 N°5)
 *    Mueble a título GRATUITO             → HABER RELATIVO con recompensa (art. 1725 N°4)
 *    Dinero a título ONEROSO              → HABER ABSOLUTO (art. 1725 N°5)
 *    Dinero a título GRATUITO             → HABER RELATIVO con recompensa (art. 1725 N°3)
 *    Indemnización (regla general)        → HABER ABSOLUTO (art. 1725 N°2 — fruto del lucro)
 *    Subrogación real de inmueble propio  → BIEN PROPIO (arts. 1727, 1733)
 *    Mejoras a un bien propio con dineros sociales → recompensa a la sociedad
 */
export function clasificarBien(b: Omit<Bien, "clase">, sexoAdquirente?: Sexo): ClasificacionRazonada {
  const titulo = b.tituloOnerosoOGratuito;
  const propio = (s: Sexo | undefined) => (s === "femenino" ? "propio_mujer" : "propio_marido") as ClaseBien;

  // Patrimonio reservado de la mujer casada (art. 150) — tiene prioridad sobre el régimen general.
  if (b.fuente === "trabajo_separado_mujer" && sexoAdquirente === "femenino") {
    return {
      clase: "reservado_art150",
      recompensa: 0,
      justificacion: "Producto del trabajo separado de la mujer casada en SC: ingresa a su patrimonio reservado. Administra y dispone como separada de bienes; las deudas afectan solo a este patrimonio y a sus bienes propios.",
      articulo: "Art. 150 CC",
    };
  }

  // === ANTES DEL MATRIMONIO ===
  if (b.adquiridoAntesDelMatrimonio) {
    if (b.naturaleza === "inmueble") {
      return {
        clase: propio(sexoAdquirente),
        recompensa: 0,
        justificacion: "Inmueble adquirido antes del matrimonio: conserva su carácter de bien propio del cónyuge aportante (regla del aporte).",
        articulo: "Art. 1736 CC",
      };
    }
    // Muebles, dinero, fungibles → haber relativo con recompensa
    if (b.naturaleza === "dinero" || b.naturaleza === "fungible") {
      return {
        clase: "haber_relativo",
        recompensa: b.valor,
        justificacion: "Dinero aportado al matrimonio: ingresa al haber relativo de la sociedad con cargo de recompensa al cónyuge aportante.",
        articulo: "Art. 1725 N°3 CC",
      };
    }
    return {
      clase: "haber_relativo",
      recompensa: b.valor,
      justificacion: "Mueble (cosa fungible o especie mueble) aportado al matrimonio: ingresa al haber relativo con cargo de recompensa al cónyuge aportante.",
      articulo: "Art. 1725 N°4 CC",
    };
  }

  // === DURANTE EL MATRIMONIO ===
  switch (b.fuente) {
    case "trabajo":
      return {
        clase: "haber_absoluto",
        recompensa: 0,
        justificacion: "Salarios y emolumentos del trabajo de cualquiera de los cónyuges devengados durante la sociedad conyugal.",
        articulo: "Art. 1725 N°1 CC",
      };
    case "frutos":
      return {
        clase: "haber_absoluto",
        recompensa: 0,
        justificacion: "Frutos, réditos, pensiones, intereses y lucros de bienes sociales o propios, devengados durante la sociedad.",
        articulo: "Art. 1725 N°2 CC",
      };
    case "compra":
    case "permuta":
      return {
        clase: "haber_absoluto",
        recompensa: 0,
        justificacion: "Bien adquirido durante el matrimonio a TÍTULO ONEROSO: ingresa íntegramente al haber absoluto.",
        articulo: "Art. 1725 N°5 CC",
      };
    case "herencia":
    case "donacion":
      // Distingue por naturaleza
      if (b.naturaleza === "inmueble") {
        return {
          clase: propio(sexoAdquirente),
          recompensa: 0,
          justificacion: "Inmueble adquirido durante el matrimonio a TÍTULO GRATUITO (herencia, legado o donación): es bien propio del cónyuge donatario o heredero.",
          articulo: "Art. 1726 CC",
        };
      }
      // Mueble o dinero a título gratuito
      if (b.naturaleza === "dinero") {
        return {
          clase: "haber_relativo",
          recompensa: b.valor,
          justificacion: "Dinero adquirido durante el matrimonio a título gratuito: ingresa al haber relativo con cargo de recompensa.",
          articulo: "Art. 1725 N°3 CC",
        };
      }
      return {
        clase: "haber_relativo",
        recompensa: b.valor,
        justificacion: "Mueble adquirido durante el matrimonio a título gratuito (herencia, legado o donación): ingresa al haber relativo con cargo de recompensa al cónyuge adquirente.",
        articulo: "Art. 1725 N°4 CC",
      };
    case "indemnizacion":
      return {
        clase: "haber_absoluto",
        recompensa: 0,
        justificacion: "La indemnización percibida durante la vigencia de la sociedad —regla general— ingresa al haber social como lucro patrimonial. Discutible doctrinariamente cuando indemniza un perjuicio de carácter personalísimo (daño moral, integridad física).",
        articulo: "Art. 1725 N°2 CC (criterio jurisprudencial mayoritario)",
      };
    case "subrogacion":
      // La subrogación real solo opera respecto de bienes propios que se sustituyen.
      // El bien adquirido toma el carácter del sustituido.
      if (b.subroga?.eraInmueble) {
        return {
          clase: b.subroga.delConyuge === "mujer" ? "propio_mujer" : "propio_marido",
          recompensa: 0,
          justificacion: "Subrogación real: el inmueble adquirido sustituye a otro inmueble propio del cónyuge. Conserva la calidad de bien propio. La subrogación exige diferencia de precios no superior a la mitad del nuevo bien y declaración expresa.",
          articulo: "Arts. 1727 N°1 y 1733 CC",
        };
      }
      return {
        clase: propio(sexoAdquirente),
        recompensa: 0,
        justificacion: "Subrogación real: el bien adquirido toma el carácter del que sustituye. Requiere ánimo subrogatorio expreso.",
        articulo: "Arts. 1727-1733 CC",
      };
    case "mejora_propio":
      return {
        clase: propio(sexoAdquirente),
        recompensa: b.valor,
        justificacion: "Mejora útil o necesaria hecha en bien propio con dineros sociales: el bien conserva su carácter, pero la sociedad tiene derecho a recompensa por el aumento de valor.",
        articulo: "Art. 1746 CC",
      };
  }

  // Fallback didáctico
  return {
    clase: "haber_absoluto",
    recompensa: 0,
    justificacion: "Regla supletoria: los bienes adquiridos durante la vigencia de la sociedad se presumen sociales (presunción del art. 1739).",
    articulo: "Art. 1739 CC",
  };
}

// ============================================================================
//  PATRIMONIOS SATÉLITE DE LA MUJER CASADA — Arts. 150, 166, 167 CC
// ============================================================================

export function clasificarSatelite(input: {
  sexo: Sexo;
  origen: "trabajo_separado" | "donacion_condicion_no_admin" | "capitulaciones_separacion_parcial";
}): ClasificacionRazonada {
  if (input.sexo !== "femenino") {
    return {
      clase: "haber_absoluto",
      recompensa: 0,
      justificacion: "El patrimonio reservado del art. 150 y los satélites de los arts. 166-167 son institutos privativos de la mujer casada en sociedad conyugal.",
      articulo: "Art. 150 CC (a contrario sensu para varón)",
    };
  }
  switch (input.origen) {
    case "trabajo_separado":
      return {
        clase: "reservado_art150",
        recompensa: 0,
        justificacion: "Bienes adquiridos por la mujer con el producto de su trabajo separado del marido. La mujer los administra y dispone como separada de bienes; al disolverse la SC, podrá aceptar o renunciar a los gananciales.",
        articulo: "Art. 150 CC",
      };
    case "donacion_condicion_no_admin":
      return {
        clase: "satelite_art166",
        recompensa: 0,
        justificacion: "Bienes donados, legados o heredados a la mujer con la CONDICIÓN PRECISA de que no los administre el marido: la mujer los administra como separada parcial sobre esos bienes.",
        articulo: "Art. 166 CC",
      };
    case "capitulaciones_separacion_parcial":
      return {
        clase: "satelite_art167",
        recompensa: 0,
        justificacion: "Bienes incluidos en capitulación matrimonial de separación parcial: la mujer los administra como separada respecto de ellos.",
        articulo: "Art. 167 CC",
      };
  }
}

/** Decisión final de la mujer al término de la sociedad conyugal (art. 150 inc. final):
 *  - ACEPTAR gananciales: ingresa todo a la masa, incluido el reservado.
 *  - RENUNCIAR a gananciales: conserva íntegro el reservado pero pierde su mitad
 *    en los gananciales sociales. Sus deudas contraídas durante la administración
 *    del reservado afectan solo a éste. */
export function efectoOpcionGananciales(input: {
  reservadoArt150: number;
  cuotaGananciales: number;
  pasivoReservado: number;
}): { aceptar: { neto: number; texto: string }; renunciar: { neto: number; texto: string } } {
  return {
    aceptar: {
      neto: input.reservadoArt150 + input.cuotaGananciales - input.pasivoReservado,
      texto: "Al aceptar gananciales, el patrimonio reservado se confunde con el haber social. La mujer recibe su mitad de gananciales, pero las deudas del reservado pasan a la masa.",
    },
    renunciar: {
      neto: input.reservadoArt150 - input.pasivoReservado,
      texto: "Al renunciar a los gananciales, la mujer conserva íntegro el reservado (con sus deudas), pero pierde la mitad de los gananciales sociales. Decisión irrevocable.",
    },
  };
}

// ============================================================================
//  LIQUIDACIÓN — Arts. 959, 1765-1788 CC
// ============================================================================

export function calcularBajasGenerales(input: {
  gastosDeducidos: number;       // costas comunes, deudas comunes, baja general art. 959
  pasivoSocial: number;          // deudas sociales (art. 1740)
  haberRelativoARestituir: number; // recompensas que la sociedad debe a cónyuges
}): number {
  return input.gastosDeducidos + input.pasivoSocial + input.haberRelativoARestituir;
}

export function liquidar(bienes: Bien[]): {
  acervoBruto: number;
  bajasGenerales: number;
  acervoLiquido: number;
  gananciales: number;
  cuotaPorConyuge: number;
} {
  const sociales = bienes.filter((b) => b.clase === "haber_absoluto" || b.clase === "haber_relativo");
  const acervoBruto = sociales.reduce((s, b) => s + b.valor, 0);
  const haberRelativo = bienes
    .filter((b) => b.clase === "haber_relativo")
    .reduce((s, b) => s + (b.generaRecompensa || 0), 0);
  const bajasGenerales = haberRelativo; // simplificación didáctica del art. 959
  const acervoLiquido = acervoBruto - bajasGenerales;
  const gananciales = acervoLiquido;
  return {
    acervoBruto,
    bajasGenerales,
    acervoLiquido,
    gananciales,
    cuotaPorConyuge: gananciales / 2, // Art. 1774 CC
  };
}

// ============================================================================
//  FECHA CIERTA DEL CESE DE CONVIVENCIA — Arts. 22 y 25 LMC
// ============================================================================
//
// La Ley 19.947 entró en vigencia el 18 de noviembre de 2004. Para matrimonios
// celebrados ANTES de esa fecha, la prueba del cese es libre (art. 2° transitorio
// LMC), aunque la jurisprudencia exige prueba calificada.
// Para matrimonios celebrados DESDE 18-11-2004, solo se admiten los medios
// del art. 22 LMC y la notificación de demanda del art. 25 inc. 2°.

export function validarFechaCierta(input: {
  medio: MedioFechaCierta;
  fechaMatrimonio?: string; // ISO
}): FechaCiertaCese {
  const ANTES_LMC = input.fechaMatrimonio
    ? new Date(input.fechaMatrimonio) < new Date("2004-11-18")
    : false;

  const arts: Record<MedioFechaCierta, { art: string; valido: boolean; obs?: string }> = {
    escritura_publica: { art: "Art. 22 letra a) LMC", valido: true },
    escritura_privada_protocolizada: { art: "Art. 22 letra a) LMC", valido: true },
    acta_oficial_registro_civil: { art: "Art. 22 letra b) LMC", valido: true },
    transaccion_judicial_aprobada: { art: "Art. 22 letra c) LMC", valido: true },
    notificacion_demanda_art25: { art: "Art. 25 inc. 2° LMC", valido: true },
  };

  const v = arts[input.medio];
  return {
    medio: input.medio,
    fecha: new Date().toISOString(),
    valida: v.valido,
    articulo: v.art,
    observaciones: ANTES_LMC
      ? "Matrimonio anterior al 18-11-2004: la prueba del cese es libre (art. 2° transitorio LMC), aunque se exige prueba calificada por la jurisprudencia."
      : "Matrimonio posterior al 18-11-2004: solo proceden los medios taxativos del art. 22 LMC y la notificación del art. 25 inc. 2°.",
  };
}

// ============================================================================
//  COMPENSACIÓN ECONÓMICA — Arts. 61-66 LMC
// ============================================================================

/** Cálculo estimado (didáctico) según los criterios del art. 62 LMC.
 *  La doctrina y la jurisprudencia chilena no establecen una fórmula única.
 *  Se han usado, entre otras, las metodologías de Pizarro Wilson, del
 *  "menoscabo previsional" y del "lucro cesante laboral". Aquí ponderamos
 *  cada factor sobre una base estimada para fines didácticos. */
export function calcularCompensacionEconomica(f: FactoresCE, ingresoBaseEstimado = 800000): {
  monto: number;
  desglose: { factor: string; aporte: number; articulo: string }[];
} {
  const desglose: { factor: string; aporte: number; articulo: string }[] = [];
  let monto = 0;

  const baseAños = ingresoBaseEstimado * 12 * Math.min(f.duracionMatrimonioAños, 40) * 0.05;
  desglose.push({ factor: `Duración del matrimonio (${f.duracionMatrimonioAños} años)`, aporte: baseAños, articulo: "Art. 62 LMC" });
  monto += baseAños;

  if (f.dedicacionExclusivaHogar) {
    const dedic = ingresoBaseEstimado * 12 * f.duracionMatrimonioAños * 0.15;
    desglose.push({ factor: "Dedicación exclusiva al cuidado del hogar e hijos", aporte: dedic, articulo: "Arts. 61, 62 LMC" });
    monto += dedic;
  }
  if (f.colaboracionActividadConyuge) {
    const colab = ingresoBaseEstimado * 12 * f.duracionMatrimonioAños * 0.08;
    desglose.push({ factor: "Colaboración en actividad lucrativa del otro cónyuge", aporte: colab, articulo: "Art. 61 LMC" });
    monto += colab;
  }
  if (f.saludDeficiente) {
    const salud = ingresoBaseEstimado * 24;
    desglose.push({ factor: "Estado de salud deficiente", aporte: salud, articulo: "Art. 62 LMC" });
    monto += salud;
  }
  if (f.situacionPrevisional === "deficitaria") {
    const prev = ingresoBaseEstimado * 36;
    desglose.push({ factor: "Situación previsional deficitaria", aporte: prev, articulo: "Art. 62 LMC" });
    monto += prev;
  } else if (f.situacionPrevisional === "media") {
    const prev = ingresoBaseEstimado * 12;
    desglose.push({ factor: "Situación previsional media", aporte: prev, articulo: "Art. 62 LMC" });
    monto += prev;
  }
  if (f.calificacionProfesional === "baja") {
    const cal = ingresoBaseEstimado * 18;
    desglose.push({ factor: "Baja calificación profesional", aporte: cal, articulo: "Art. 62 LMC" });
    monto += cal;
  }
  if (f.accesoMercadoLaboral === "imposible") {
    const acc = ingresoBaseEstimado * 30;
    desglose.push({ factor: "Imposibilidad de acceso al mercado laboral", aporte: acc, articulo: "Art. 62 LMC" });
    monto += acc;
  } else if (f.accesoMercadoLaboral === "dificil") {
    const acc = ingresoBaseEstimado * 15;
    desglose.push({ factor: "Difícil acceso al mercado laboral", aporte: acc, articulo: "Art. 62 LMC" });
    monto += acc;
  }
  if (f.edadConyugeBeneficiario > 55) {
    const edad = ingresoBaseEstimado * (f.edadConyugeBeneficiario - 55) * 1.5;
    desglose.push({ factor: `Edad avanzada (${f.edadConyugeBeneficiario} años)`, aporte: edad, articulo: "Art. 62 LMC" });
    monto += edad;
  }

  return { monto: Math.round(monto), desglose };
}

// ============================================================================
//  ACUERDO REGULADOR — Arts. 21 y 27 LMC
// ============================================================================

export function evaluarAcuerdoRegulador(a: AcuerdoRegulador, hayHijos: boolean): {
  completo: boolean;
  suficiente: boolean;
  observaciones: string[];
  articulo: string;
} {
  const obs: string[] = [];
  let completo = true;
  let suficiente = true;

  if (hayHijos) {
    if (!a.alimentosHijos) { completo = false; obs.push("Falta regulación de alimentos para hijos (Ley 14.908)."); }
    if (!a.cuidadoPersonal) { completo = false; obs.push("Falta regulación del cuidado personal (art. 225 CC)."); }
    if (!a.relacionDirectaRegular) { completo = false; obs.push("Falta regulación de la relación directa y regular (art. 229 CC)."); }
  }
  if (a.alimentosConyuge === false) obs.push("Considerar alimentos entre cónyuges si procede (arts. 321 y 134 CC).");
  if (!a.liquidacionRegimen) obs.push("Recomendable incluir liquidación o renuncia expresa.");

  if (!completo) suficiente = false;
  return {
    completo,
    suficiente,
    observaciones: obs,
    articulo: "Arts. 21 y 27 inc. 2° LMC",
  };
}

// ============================================================================
//  DEBERES MATRIMONIALES Y CAUSALES DE DIVORCIO CULPOSO — Arts. 131-134 CC, 54 LMC
// ============================================================================
//
// Art. 131 CC: los cónyuges están obligados a guardarse fe, a socorrerse, ayudarse
//              mutuamente en todas las circunstancias de la vida y a respetarse y
//              protegerse mutuamente.
// Art. 132 CC: el adulterio constituye grave infracción al deber de fidelidad.
// Art. 133 CC: ambos cónyuges tienen el derecho y el deber de vivir en el hogar común.
// Art. 134 CC: los cónyuges deben proveer a las necesidades de la familia común.
//
// Art. 54 LMC: causales de divorcio culposo: falta imputable al otro, siempre
//              que constituya una violación grave de los deberes y obligaciones
//              que les impone el matrimonio, o de los deberes y obligaciones para
//              con los hijos, que torne intolerable la vida en común. Enumera 7.

export const CAUSALES_CULPOSAS = [
  { n: 1, t: "Atentado contra la vida o malos tratamientos graves contra la integridad física o psíquica del cónyuge o de alguno de los hijos." },
  { n: 2, t: "Transgresión grave y reiterada de los deberes de convivencia, socorro y fidelidad propios del matrimonio. Abandono continuo o reiterado del hogar común." },
  { n: 3, t: "Condena ejecutoriada por crimen o simple delito de los previstos en el art. 363, 365 bis, 366 bis y otros del Código Penal." },
  { n: 4, t: "Conducta homosexual." }, // mantenida en la ley, criticada doctrinariamente
  { n: 5, t: "Alcoholismo o drogadicción que constituya impedimento grave para la convivencia armoniosa." },
  { n: 6, t: "Tentativa para prostituir al otro cónyuge o a los hijos." },
  { n: 7, t: "(Numeración refundida; ver texto vigente del art. 54 LMC.)" },
];

// ============================================================================
//  ARTÍCULOS DESTACADOS — CODEX
// ============================================================================
export const ARTICULOS_DESTACADOS = [
  { n: "102 CC", t: "Definición de matrimonio. Ley 21.400 amplió la celebración entre personas del mismo sexo." },
  { n: "131 CC", t: "Deberes de fidelidad, socorro, ayuda mutua, respeto y protección entre cónyuges." },
  { n: "132 CC", t: "El adulterio es grave infracción al deber de fidelidad." },
  { n: "133 CC", t: "Deber y derecho de vivir en el hogar común." },
  { n: "134 CC", t: "Sustento de la familia: proporcionalidad según facultades económicas." },
  { n: "135 CC", t: "Por el hecho del matrimonio se contrae sociedad de bienes." },
  { n: "141 CC", t: "Bienes familiares: residencia principal y muebles que la guarnecen." },
  { n: "150 CC", t: "Patrimonio reservado de la mujer casada." },
  { n: "166 CC", t: "Bienes donados, heredados o legados a la mujer con condición de no administración del marido." },
  { n: "167 CC", t: "Separación parcial pactada en capitulaciones matrimoniales." },
  { n: "1725 CC", t: "Composición del haber social: absoluto y relativo." },
  { n: "1726 CC", t: "Bienes adquiridos a título gratuito durante el matrimonio son propios." },
  { n: "1727 CC", t: "Subrogación real entre inmuebles propios." },
  { n: "1736 CC", t: "Bienes adquiridos antes del matrimonio conservan su carácter." },
  { n: "1749 CC", t: "El marido es jefe de la sociedad conyugal y administra los bienes sociales." },
  { n: "1754 CC", t: "Autorización de la mujer para enajenar sus bienes propios." },
  { n: "1764 CC", t: "Causales de disolución de la sociedad conyugal." },
  { n: "1773-1774 CC", t: "Partición y división por mitades de los gananciales." },
  { n: "1792-2 CC", t: "Régimen de participación en los gananciales." },
  { n: "21 LMC", t: "Acuerdo regulador en el divorcio de común acuerdo." },
  { n: "22 LMC", t: "Medios para acreditar fecha cierta del cese de convivencia." },
  { n: "25 LMC", t: "Notificación de la demanda como medio para acreditar cese." },
  { n: "27 LMC", t: "Acuerdo completo y suficiente: alimentos, cuidado personal, relación directa y regular." },
  { n: "54 LMC", t: "Causales de divorcio por culpa." },
  { n: "55 LMC", t: "Divorcio por cese de convivencia: 1 año común acuerdo, 3 años unilateral." },
  { n: "61 LMC", t: "Procedencia de la compensación económica." },
  { n: "62 LMC", t: "Criterios de cuantificación de la compensación económica." },
  { n: "65 LMC", t: "Modalidades de pago de la compensación económica." },
  { n: "199 CC", t: "Prueba pericial biológica en filiación." },
  { n: "205 CC", t: "Acción de reclamación de filiación." },
  { n: "208 CC", t: "Plazos para impugnación de la paternidad por el marido." },
  { n: "212 CC", t: "Impugnación de paternidad por el hijo o por sus representantes." },
];
