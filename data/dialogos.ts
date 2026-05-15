// Diálogos narrativos. Disco Elysium + Código Civil chileno.
// Rigor normativo: cada escena cita artículo o doctrina. Humor negro táctico.

import type { Atributos } from "@/types/game";

export type Opcion = {
  texto: string;
  requiere?: { atributo?: keyof Atributos; minimo?: number; flag?: string; sexo?: "masculino" | "femenino" };
  efectos?: {
    flags?: string[];
    atributos?: Partial<Record<keyof Atributos, number>>;
    reputacion?: number;
    trauma?: number;
    log?: string;
  };
};

export type Escena = {
  id: string;
  titulo: string;
  ambientacion: string;
  speaker?: string;
  lineas: string[];
  opciones: Opcion[];
  articulo?: { n: string; t: string };
};

export const ESCENAS: Record<string, Escena> = {

  // ============ MUNDO I — NOVIAZGO PRECONTRACTUAL ============

  inicio_noviazgo: {
    id: "inicio_noviazgo",
    titulo: "Notaría Municipal #4 — 03:14 a.m.",
    ambientacion: "Tubos fluorescentes parpadean. Olor a café instantáneo y papel mojado. Afuera, lluvia ácida sobre Santiago jurídico.",
    speaker: "NOTARIO INSOMNE",
    lineas: [
      "Joven. Trae los esponsales firmados.",
      "Recuerde: la promesa de matrimonio mutuamente aceptada NO produce obligación alguna ante la ley civil (art. 98 CC).",
      "Es un hecho privado. Romántico, si quiere. Inexigible, siempre.",
      "Tampoco da acción para reclamar indemnización por su incumplimiento, salvo las multas estipuladas si el otro contrayente las cumpliere (art. 99 CC).",
      "¿Desea, igualmente, registrar la intención?",
    ],
    articulo: { n: "98 CC", t: "Los esponsales no producen obligación civil." },
    opciones: [
      {
        texto: "[HONESTIDAD] «Sé que no obliga. Igual quiero dejarlo por escrito.»",
        requiere: { atributo: "honestidad", minimo: 4 },
        efectos: { flags: ["registro_esponsales"], log: "Registraste esponsales sin valor civil.", reputacion: 2 },
      },
      {
        texto: "[PERSUASIÓN] «¿Y si pago un poco más? ¿Se vuelven exigibles?»",
        requiere: { atributo: "persuasion", minimo: 6 },
        efectos: { reputacion: -4, flags: ["intento_corromper"], log: "Intentaste corromper al notario. Mala impresión." },
      },
      {
        texto: "Salir a la lluvia. No firmar nada.",
        efectos: { trauma: 2, log: "Saliste. Algo en ti se quebró un poco." },
      },
    ],
  },

  impedimentos: {
    id: "impedimentos",
    titulo: "Oficina del Oficial Civil — minutos previos a la ceremonia",
    ambientacion: "Una sala con sillas plegables, un cuadro torcido de O'Higgins, y la lista de impedimentos.",
    speaker: "OFICIAL CIVIL",
    lineas: [
      "Antes de proceder, verifico impedimentos dirimentes (que viciarían el acto): vínculo matrimonial no disuelto (art. 5 N°1 LMC), minoría de 16 años (art. 5 N°2), demencia (art. 5 N°4), parentesco (art. 6).",
      "Y los impedimentos impedientes o prohibiciones: falta de asenso (arts. 105-116 CC), guardas (art. 116), segundas nupcias (art. 124 — confección de inventario solemne).",
      "¿Hay algo que declarar?",
    ],
    articulo: { n: "5-8 LMC", t: "Impedimentos dirimentes y vicios del consentimiento matrimonial." },
    opciones: [
      { texto: "Declarar todo correctamente.", efectos: { flags: ["sin_impedimentos"], reputacion: 2, log: "Sin impedimentos. El acto procede." } },
      {
        texto: "[IMPULSIVIDAD] Ocultar segundas nupcias sin inventario solemne (art. 124).",
        requiere: { atributo: "impulsividad", minimo: 6 },
        efectos: { flags: ["pena_pecuniaria_124", "ojo_124"], log: "Ocultaste el inventario. Te expones a sanción patrimonial (arts. 124-127 CC)." },
      },
    ],
  },

  consentimiento: {
    id: "consentimiento",
    titulo: "Oficina del Registro Civil — Acto Constitutivo",
    ambientacion: "Tres testigos. Un oficial. Un libro de tapas oscuras. El consentimiento será verificado.",
    speaker: "OFICIAL CIVIL",
    lineas: [
      "Verifico ausencia de vicios del consentimiento (art. 8 LMC): error acerca de la identidad de la persona o sobre alguna de sus cualidades personales que, atendida la naturaleza o los fines del matrimonio, ha de ser estimada como determinante para otorgar el consentimiento; y la fuerza ocasionada por una persona o por una circunstancia externa.",
      "¿Conoce a su contrayente? ¿Hay vínculo matrimonial anterior no disuelto?",
    ],
    articulo: { n: "8 LMC", t: "Vicios del consentimiento matrimonial: error y fuerza." },
    opciones: [
      {
        texto: "Declarar todo correctamente.",
        efectos: { flags: ["consentimiento_valido"], reputacion: 2, log: "Consentimiento válido." },
      },
      {
        texto: "[IMPULSIVIDAD] Omitir el matrimonio anterior no disuelto.",
        requiere: { atributo: "impulsividad", minimo: 6 },
        efectos: { flags: ["bigamia_oculta", "nulidad_latente"], trauma: 8, log: "Ocultaste un vínculo. La nulidad te seguirá (art. 5 N°1 LMC)." },
      },
    ],
  },

  // ============ MUNDO II — MATRIMONIO Y RÉGIMEN ============

  capitulaciones_previas: {
    id: "capitulaciones_previas",
    titulo: "Notaría — Capitulaciones matrimoniales preparatorias",
    ambientacion: "Hojas timbradas en triplicado. El notario cita a Somarriva. Vos pensás en un Excel.",
    speaker: "NOTARIO",
    lineas: [
      "Las capitulaciones celebradas ANTES del matrimonio (art. 1716 CC) deben constar por escritura pública y subinscribirse al margen de la inscripción matrimonial dentro de 30 días.",
      "Las capitulaciones celebradas EN el acto del matrimonio (art. 1716 inc. 2°) solo pueden tener por objeto la elección entre los tres regímenes.",
      "Postnupcialmente solo se puede pactar separación total de bienes o participación en los gananciales, no volver a la sociedad conyugal (art. 1723 CC).",
    ],
    articulo: { n: "1715-1721 CC", t: "Capitulaciones matrimoniales: requisitos, contenido, modificación." },
    opciones: [
      { texto: "Pactar separación parcial sobre algunos bienes (art. 167 CC).", efectos: { flags: ["pacto_art167"], log: "Pactaste separación parcial. Algunos bienes administrarás como separada." } },
      { texto: "No pactar capitulaciones; entrar al régimen legal supletorio.", efectos: { log: "Sin capitulaciones. Rige sociedad conyugal por defecto (art. 135 CC)." } },
    ],
  },

  eleccion_regimen: {
    id: "eleccion_regimen",
    titulo: "Elección de Régimen Patrimonial",
    ambientacion: "Tres puertas. Tres mundos. Bajo cada puerta, un código distinto.",
    speaker: "ARCHIVISTA DEL CONSERVADOR",
    lineas: [
      "Por defecto, el matrimonio engendra sociedad de bienes (art. 135 CC).",
      "Puede pactar separación total o participación en los gananciales en capitulaciones (art. 1715 inc. 2° CC).",
      "Su elección configurará la economía moral de toda su vida adulta.",
    ],
    articulo: { n: "135 CC", t: "Por el hecho del matrimonio se contrae sociedad de bienes." },
    opciones: [
      { texto: "SOCIEDAD CONYUGAL — administración del marido (art. 1749), patrimonio reservado de la mujer (art. 150).", efectos: { flags: ["regimen_sc"], log: "Sociedad conyugal." } },
      { texto: "SEPARACIÓN TOTAL — patrimonios estancos (arts. 152 ss. CC).", efectos: { flags: ["regimen_st"], log: "Separación total." } },
      { texto: "PARTICIPACIÓN EN GANANCIALES — Ley 19.335, arts. 1792-1 ss.", efectos: { flags: ["regimen_pg"], log: "Participación en gananciales." } },
    ],
  },

  // ============ MUNDO III — HABER Y PATRIMONIOS SATÉLITE ============

  haber_intro: {
    id: "haber_intro",
    titulo: "Despacho del contador-partidor de la familia",
    ambientacion: "Cinco columnas de bienes. Una calculadora HP-12C. Olor a tinta y a desconfianza.",
    speaker: "CONTADOR-PARTIDOR",
    lineas: [
      "La sociedad conyugal coexiste con tres haberes: el SOCIAL (absoluto y relativo), el PROPIO del marido y el PROPIO de la mujer.",
      "Adicionalmente, si Ud. es mujer casada en SC, puede tener PATRIMONIOS SATÉLITES: el reservado del art. 150 (trabajo separado), el del art. 166 (donaciones con condición) y el del art. 167 (separación parcial pactada).",
      "Vamos a clasificar cada bien. La doctrina chilena —Rodríguez Grez, Ramos Pazos, Court Murasso— lo enseña así.",
    ],
    articulo: { n: "1725 CC", t: "Composición del haber social." },
    opciones: [
      { texto: "Comenzar la clasificación.", efectos: { log: "Iniciaste la clasificación del haber." } },
    ],
  },

  art150_explica: {
    id: "art150_explica",
    titulo: "Cuenta corriente separada — sucursal Banco Estado",
    ambientacion: "Pantalla CRT verdosa. Tu nombre figura en la titularidad. Solo tuyo. Por primera vez.",
    speaker: "EJECUTIVA DEL BANCO",
    lineas: [
      "Su sueldo y los bienes adquiridos con él forman parte de su patrimonio reservado del art. 150 CC.",
      "Ud. los administra como separada de bienes: enajena, grava, contrata, demanda y es demandada por sí sola sobre ellos.",
      "Las deudas que contraiga en esta administración afectan solo este patrimonio y a los bienes propios, NO a los sociales.",
      "Al disolverse la sociedad conyugal, Ud. podrá OPTAR (decisión irrevocable): aceptar gananciales —y todo entra a la masa común— o renunciar —y conserva íntegro el reservado—.",
    ],
    articulo: { n: "150 CC", t: "Patrimonio reservado de la mujer casada." },
    opciones: [
      { texto: "Tomar nota mental. Llevar carpeta separada.", requiere: { sexo: "femenino" }, efectos: { flags: ["consciente_150"], atributos: { inteligencia_juridica: 1 }, log: "Aprendiste a administrar tu patrimonio reservado." } },
      { texto: "«Yo no tengo ese patrimonio.»", requiere: { sexo: "masculino" }, efectos: { log: "El art. 150 no aplica al cónyuge varón. Su trabajo entra al haber social ordinario." } },
    ],
  },

  // ============ MUNDO IV — DEBERES MATRIMONIALES ============

  deberes_intro: {
    id: "deberes_intro",
    titulo: "Cocina del departamento — un martes cualquiera",
    ambientacion: "Café frío. Mensajes sin leer. La rutina diciéndote algo importante.",
    speaker: "TU PROPIA CONCIENCIA JURÍDICA",
    lineas: [
      "Art. 131 CC: los cónyuges están obligados a guardarse fe, a socorrerse y ayudarse mutuamente en todas las circunstancias de la vida, a respetarse y protegerse.",
      "Art. 132 CC: el adulterio constituye una grave infracción al deber de fidelidad. NO produce per se efectos civiles automáticos.",
      "Art. 133 CC: ambos cónyuges tienen el derecho y el deber de vivir en el hogar común, salvo causa grave que lo justifique.",
      "Art. 134 CC: el marido y la mujer deben proveer a las necesidades de la familia común, atendiendo a sus facultades económicas y al régimen de bienes que entre ellos medie.",
      "El incumplimiento grave y reiterado de estos deberes habilita causal de divorcio culposo (art. 54 LMC) y puede bloquear la compensación económica al culpable (art. 62 inc. 2° LMC).",
    ],
    articulo: { n: "131-134 CC", t: "Deberes recíprocos entre cónyuges." },
    opciones: [
      { texto: "Comprometerte con cumplirlos.", efectos: { atributos: { empatia: 1 }, log: "Tomaste conciencia de los deberes recíprocos." } },
    ],
  },

  // ============ MUNDO V — HIJOS Y FILIACIÓN ============

  filiacion_intro: {
    id: "filiacion_intro",
    titulo: "Servicio Médico Legal — Test biológico",
    ambientacion: "Probetas. Un técnico cansado. Un sobre con resultados.",
    speaker: "PERITO BIOLÓGICO",
    lineas: [
      "La filiación produce los mismos efectos jurídicos sin distinción (Ley 19.585), salvo las reglas particulares (art. 33 CC).",
      "Acciones de reclamación de filiación: imprescriptibles para el hijo (art. 195), dos años para los demás legitimados desde el fallecimiento (art. 206).",
      "Acciones de impugnación: plazos breves en el art. 212. Para impugnación de paternidad por el marido: 180 días o un año desde que tuvo conocimiento (art. 212).",
      "La negativa injustificada a someterse a la prueba biológica (art. 199) hace presumir legalmente la paternidad o maternidad.",
    ],
    articulo: { n: "195-221 CC", t: "Acciones de filiación." },
    opciones: [
      { texto: "[INTELIGENCIA JURÍDICA] Pedir prueba biológica con compulsión.", requiere: { atributo: "inteligencia_juridica", minimo: 5 }, efectos: { flags: ["prueba_199_compelida"], log: "Pediste prueba con compulsión. Si se niega, opera la presunción del art. 199 inc. 2°." } },
      { texto: "Aceptar resultado sin más.", efectos: { log: "Resultado biológico aceptado." } },
    ],
  },

  // ============ MUNDO VI — CRISIS ============

  crisis_fidelidad: {
    id: "crisis_fidelidad",
    titulo: "Hotel Boutique — recepción a las 23:47",
    ambientacion: "Las cámaras de seguridad parpadean. Tenés tres opciones y todas duelen.",
    speaker: "TU INSTINTO PROCESAL",
    lineas: [
      "El adulterio (art. 132 CC) es grave infracción al deber de fidelidad. No es delito desde 1994.",
      "Para invocarlo como causal de divorcio culposo (art. 54 N°2 LMC) deberás acreditar transgresión grave y reiterada, no un episodio aislado, y deberá tornar intolerable la vida en común.",
      "La sola sospecha no basta: la prueba debe ser calificada (testimonial idónea, prueba documental, peritaje informático).",
    ],
    articulo: { n: "54 N°2 LMC", t: "Transgresión grave y reiterada de los deberes." },
    opciones: [
      { texto: "Documentar y guardar prueba para juicio futuro.", efectos: { flags: ["prueba_infidelidad", "incumplio_131"], log: "Acopiaste prueba. Posible causal art. 54 N°2 LMC." } },
      { texto: "Confrontar privadamente.", efectos: { trauma: 6, log: "Confrontaste. La confianza se quiebra." } },
    ],
  },

  // ============ MUNDO VII — CESE Y FECHA CIERTA ============

  cese_intro: {
    id: "cese_intro",
    titulo: "Notaría Pública — 14:00",
    ambientacion: "Hoy firmás la separación material. El notario tiene tres modelos de minuta listos.",
    speaker: "NOTARIO",
    lineas: [
      "Para acreditar fecha cierta del cese de convivencia, en matrimonios POSTERIORES al 18-11-2004, el art. 22 LMC reconoce TRES medios:",
      "  a) escritura pública o escritura privada protocolizada;",
      "  b) acta extendida ante oficial del Registro Civil;",
      "  c) transacción aprobada judicialmente.",
      "Adicionalmente, el art. 25 inc. 2° LMC permite acreditar el cese por la notificación de demanda judicial entre los cónyuges (cualquier demanda donde una parte declare cese).",
      "Para matrimonios ANTERIORES al 18-11-2004, la prueba es libre (art. 2° transitorio LMC), aunque la jurisprudencia exige prueba calificada (testigos hábiles, documentos, etc.).",
    ],
    articulo: { n: "22 LMC", t: "Medios para acreditar fecha cierta del cese de convivencia." },
    opciones: [
      { texto: "Otorgar escritura pública de constatación del cese.", efectos: { flags: ["cese_22a"], log: "Escritura pública. Fecha cierta inmediata." } },
      { texto: "Acta ante oficial del Registro Civil (más barato).", efectos: { flags: ["cese_22b"], log: "Acta ante oficial. Equivalente al art. 22 b)." } },
      { texto: "Demandar alimentos / cuidado personal: vale por el art. 25.", efectos: { flags: ["cese_25"], log: "La notificación de tu demanda fijará la fecha (art. 25 inc. 2° LMC)." } },
    ],
  },

  // ============ MUNDO VIII — DIVORCIO ============

  divorcio_compensacion: {
    id: "divorcio_compensacion",
    titulo: "Audiencia preparatoria — Tribunal de Familia",
    ambientacion: "Sala 3. Pantallas con cifras. El juez tiene tu legajo abierto en el art. 62 LMC.",
    speaker: "JUEZA DE FAMILIA",
    lineas: [
      "La compensación económica procede cuando uno de los cónyuges, por dedicarse al cuidado del hogar o de los hijos o por realizar trabajo en menor medida del que podía y quería, no pudo desarrollar actividad remunerada durante el matrimonio o lo hizo en menor medida (art. 61 LMC).",
      "El monto se determina considerando: duración del matrimonio y de la vida en común, situación patrimonial de ambos, buena o mala fe, edad y salud del beneficiario, situación previsional y de salud, calificación profesional y posibilidades de acceso al mercado laboral, colaboración prestada (art. 62 inc. 1° LMC).",
      "ATENCIÓN: si el cónyuge que pide la compensación dio causa al divorcio por su culpa (causal del art. 54 LMC), el juez podrá DENEGAR o disminuir prudencialmente su monto (art. 62 inc. 2° LMC).",
    ],
    articulo: { n: "61-62 LMC", t: "Procedencia y cuantificación de la compensación económica." },
    opciones: [
      { texto: "[EMPATÍA 5] Proponer acuerdo razonable.", requiere: { atributo: "empatia", minimo: 5 }, efectos: { flags: ["ce_acordada"], reputacion: 4, log: "Acordaste compensación con base en art. 65 LMC." } },
      { texto: "Pelear todo y negar dedicación al hogar.", efectos: { reputacion: -8, trauma: 6, flags: ["ce_litigada"], log: "Litigaste. La sentencia es incierta." } },
    ],
  },

  // ============ MUNDO IX — SEGUNDA VIDA (post-divorcio loop) ============

  segunda_vida_intro: {
    id: "segunda_vida_intro",
    titulo: "Departamento nuevo — 8 meses después de la sentencia",
    ambientacion: "Cajas sin abrir. Café aceptable. Por primera vez en años, vos elegís el papel pintado.",
    speaker: "TU YO RECONSTRUIDO",
    lineas: [
      "Conservaste tus bienes propios (arts. 1726, 1736 CC) y, si correspondía, tu reservado del art. 150.",
      "Las recompensas se cobraron al liquidar. Las deudas sociales, también.",
      "Podés rehacer tu vida: trabajar, ahorrar, conocer a alguien, casarte de nuevo (con o sin capitulaciones), tener más hijos, comprar bienes.",
      "El segundo matrimonio exige confección de INVENTARIO SOLEMNE de los bienes de los hijos del primer matrimonio (arts. 124-127 CC), bajo sanción.",
    ],
    articulo: { n: "124-127 CC", t: "Segundas nupcias: inventario solemne previo." },
    opciones: [
      { texto: "Pedir confección de inventario solemne ante notario.", efectos: { flags: ["inventario_124_hecho"], reputacion: 4, log: "Confeccionaste inventario solemne para segundas nupcias." } },
      { texto: "Saltarse el inventario (sanción patrimonial).", efectos: { flags: ["sancion_124"], reputacion: -10, log: "Te expones a las sanciones del art. 127 CC." } },
      { texto: "Quedarse soltero. La libertad como activo intangible.", efectos: { atributos: { resistencia_emocional: 1 }, log: "Decidiste no casarte de nuevo. La libertad es un bien jurídico." } },
    ],
  },
};
