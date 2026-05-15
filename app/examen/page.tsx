"use client";
import Link from "next/link";
import { useState } from "react";
import { useGame } from "@/store/useGame";

type Q = { q: string; opciones: string[]; correcta: number; explicacion: string; art: string };

const PREGUNTAS: Q[] = [
  {
    q: "¿Qué artículo define el matrimonio en el Código Civil chileno?",
    opciones: ["Art. 98 CC", "Art. 102 CC", "Art. 135 CC", "Art. 1° LMC"],
    correcta: 1,
    explicacion: "El art. 102 CC define el matrimonio como contrato solemne. La Ley 21.400 amplió la celebración a parejas del mismo sexo manteniendo la estructura del art. 102.",
    art: "Art. 102 CC",
  },
  {
    q: "El patrimonio reservado del art. 150 CC corresponde a:",
    opciones: ["Cualquier cónyuge bajo SC", "Solo al marido", "Solo a la mujer casada en SC", "Solo bajo separación total"],
    correcta: 2,
    explicacion: "El art. 150 es privativo de la mujer casada en sociedad conyugal: bienes adquiridos con producto de su trabajo separado. Administra como separada.",
    art: "Art. 150 CC",
  },
  {
    q: "El cese de convivencia con fecha cierta para divorcio del art. 55 inc. 3° LMC se acredita por:",
    opciones: ["Cualquier medio probatorio", "Solo testigos hábiles", "Los medios taxativos del art. 22 LMC", "Solo escritura pública"],
    correcta: 2,
    explicacion: "Para matrimonios posteriores al 18-11-2004 rigen los medios taxativos del art. 22 LMC y la notificación del art. 25 inc. 2°. Para anteriores: prueba libre (art. 2° transitorio).",
    art: "Arts. 22 y 25 LMC",
  },
  {
    q: "¿Cuál NO es causal de divorcio culposo del art. 54 LMC?",
    opciones: ["Atentado contra la vida del cónyuge", "Transgresión grave de los deberes", "Cese de convivencia de 6 meses", "Alcoholismo grave que impide convivencia"],
    correcta: 2,
    explicacion: "El cese es base del divorcio sin culpa (art. 55), no es causal del art. 54.",
    art: "Art. 54 LMC",
  },
  {
    q: "La cuarta de mejoras en sucesiones con legitimarios procede en favor de:",
    opciones: ["Solo descendientes", "Descendientes, ascendientes o cónyuge", "Solo el cónyuge sobreviviente", "Cualquier persona"],
    correcta: 1,
    explicacion: "Art. 1195: el causante puede asignar la cuarta de mejoras a cualquiera de los descendientes, ascendientes o el cónyuge sobreviviente.",
    art: "Arts. 1184 inc. 3°, 1195 CC",
  },
  {
    q: "El acuerdo regulador en el divorcio de común acuerdo (art. 55 inc. 1° LMC) debe ser:",
    opciones: ["Solo completo", "Solo suficiente", "Completo y suficiente", "Aprobado por notario"],
    correcta: 2,
    explicacion: "El art. 27 LMC exige acuerdo completo (cubre todas las materias del art. 21) y suficiente (resguarda interés superior y mitiga menoscabo).",
    art: "Arts. 21 y 27 LMC",
  },
  {
    q: "La administración ordinaria en la sociedad conyugal corresponde a:",
    opciones: ["A ambos cónyuges", "Al marido", "Al de mayor patrimonio", "A quien designen las capitulaciones"],
    correcta: 1,
    explicacion: "Art. 1749: el marido es jefe de la sociedad conyugal y administra los bienes sociales y los de su mujer. Tiene limitaciones del art. 1754.",
    art: "Art. 1749 CC",
  },
  {
    q: "La negativa injustificada a someterse a la prueba biológica (art. 199 CC) genera:",
    opciones: ["Multa procesal", "Presunción legal de paternidad/maternidad", "Nulidad de oficio", "Ningún efecto"],
    correcta: 1,
    explicacion: "El art. 199 inc. 2° establece presunción legal grave: la negativa hace presumir la paternidad o maternidad atribuida.",
    art: "Art. 199 CC",
  },
  {
    q: "La compensación económica puede ser denegada cuando el cónyuge solicitante:",
    opciones: ["Trabajaba durante el matrimonio", "Dio causa al divorcio por su culpa", "Es de mayor edad", "Recibió bienes en la liquidación"],
    correcta: 1,
    explicacion: "Art. 62 inc. 2° LMC: si el cónyuge que solicita la compensación dio causa al divorcio por culpa, el juez podrá denegar o reducir prudencialmente el monto.",
    art: "Art. 62 inc. 2° LMC",
  },
  {
    q: "Los bienes familiares (arts. 141-149 CC) se declaran:",
    opciones: ["Por acuerdo notarial", "Por sentencia judicial", "Por inscripción en el CBR", "Por escritura pública únicamente"],
    correcta: 1,
    explicacion: "Art. 141 inc. 2° y siguientes: la declaración es judicial. Su efecto principal: limita la disposición sin autorización del otro cónyuge (art. 142).",
    art: "Arts. 141-142 CC",
  },
  {
    q: "Las capitulaciones matrimoniales celebradas ANTES del matrimonio deben:",
    opciones: ["Constar por escritura pública y subinscribirse en 30 días", "Bastar acuerdo verbal", "Aprobarse por el juez", "Inscribirse en CBR"],
    correcta: 0,
    explicacion: "Arts. 1716 ss.: escritura pública y subinscripción al margen de la inscripción matrimonial dentro de 30 días, contados desde la celebración del matrimonio.",
    art: "Art. 1716 CC",
  },
  {
    q: "La acción de reforma del testamento prescribe en:",
    opciones: ["2 años", "4 años desde el conocimiento", "5 años", "10 años"],
    correcta: 1,
    explicacion: "Art. 1216 CC: 4 años contados desde el día en que tuvieron conocimiento del testamento y de su calidad de legitimarios.",
    art: "Art. 1216 CC",
  },
  {
    q: "El primer orden de sucesión intestada (art. 988 CC) es:",
    opciones: ["Cónyuge solamente", "Descendientes (concurre cónyuge)", "Ascendientes y cónyuge", "Hermanos"],
    correcta: 1,
    explicacion: "Art. 988: los descendientes excluyen a los demás, concurriendo el cónyuge sobreviviente con cuota especial.",
    art: "Art. 988 CC",
  },
  {
    q: "La aceptación de herencia con beneficio de inventario:",
    opciones: ["Es siempre tácita", "Limita la responsabilidad al valor de los bienes recibidos", "Solo procede a falta de testamento", "Es revocable libremente"],
    correcta: 1,
    explicacion: "Art. 1247: el heredero responde de las deudas y cargas solo hasta concurrencia del valor total de los bienes que ha heredado.",
    art: "Art. 1247 CC",
  },
  {
    q: "El derecho de representación en sucesión (art. 984 CC) opera:",
    opciones: ["Solo en testada", "Solo en intestada en línea descendente y hermanos", "En toda clase de sucesión", "Solo entre cónyuges"],
    correcta: 1,
    explicacion: "Art. 984: opera en la descendencia legítima y en la descendencia del causante hasta el infinito. Y en la descendencia de los hermanos del causante.",
    art: "Art. 984 CC",
  },
  {
    q: "El divorcio unilateral por cese de convivencia exige:",
    opciones: ["1 año de cese", "2 años", "3 años de cese con fecha cierta", "5 años"],
    correcta: 2,
    explicacion: "Art. 55 inc. 3° LMC: cese efectivo de la convivencia conyugal durante el transcurso de, a lo menos, tres años.",
    art: "Art. 55 inc. 3° LMC",
  },
  {
    q: "La opción del art. 150 inc. final CC (aceptar o renunciar gananciales):",
    opciones: ["Es revocable", "Es irrevocable", "Solo procede con autorización del marido", "Requiere homologación judicial"],
    correcta: 1,
    explicacion: "Art. 150 inc. final: una vez ejercida la opción, es irrevocable. La mujer queda definitivamente con su patrimonio reservado y renuncia a su mitad en los gananciales, o ingresa todo a la masa.",
    art: "Art. 150 inc. final CC",
  },
  {
    q: "El segundo matrimonio sin confección previa de inventario solemne (art. 124 CC) acarrea:",
    opciones: ["Nulidad del matrimonio", "Sanciones patrimoniales (arts. 127, 1764 N°2)", "Pérdida de la patria potestad", "Indignidad sucesoria"],
    correcta: 1,
    explicacion: "Arts. 124-127: el cónyuge que omitió el inventario pierde el derecho de suceder al hijo cuya tutela tenía y queda obligado a indemnizar perjuicios.",
    art: "Arts. 124-127 CC",
  },
  {
    q: "La filiación matrimonial y no matrimonial producen:",
    opciones: ["Distintos efectos jurídicos", "Iguales efectos jurídicos (Ley 19.585)", "Solo iguales en alimentos", "Distintos en sucesión"],
    correcta: 1,
    explicacion: "Ley 19.585 igualó los efectos. Art. 33 CC: la ley considera iguales a todos los hijos.",
    art: "Art. 33 CC / Ley 19.585",
  },
  {
    q: "La nulidad de matrimonio por incapacidad del oficial civil:",
    opciones: ["Es subsanable", "Causa nulidad absoluta", "Causa nulidad relativa de prescripción 4 años", "No produce efecto"],
    correcta: 2,
    explicacion: "Art. 44 LMC: la acción de nulidad por incompetencia del oficial prescribe en un año desde la celebración del matrimonio. Distingue causales con plazos diversos.",
    art: "Art. 44 LMC",
  },
];

export default function ExamenPage() {
  const { desbloquearLogro, setFlag, pushLog } = useGame();
  const [i, setI] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const p = PREGUNTAS[i];

  function contestar(idx: number) {
    setRespuesta(idx);
    if (idx === p.correcta) setAciertos((a) => a + 1);
  }

  function avanzar() {
    setRespuesta(null);
    if (i + 1 >= PREGUNTAS.length) {
      setTerminado(true);
      const nota = (aciertos / PREGUNTAS.length) * 7;
      if (aciertos >= PREGUNTAS.length * 0.7) {
        setFlag("examen_aprobado");
        desbloquearLogro({ id: "examen", titulo: "Cédula aprobada", descripcion: "Aprobaste el modo examen con nota igual o superior a 4,9.", articulo: "—", desbloqueado: true });
      }
      pushLog(`Examen de grado simulado finalizado. Nota: ${nota.toFixed(1)}`, "EXAMEN");
    } else {
      setI(i + 1);
    }
  }

  if (terminado) {
    const nota = (aciertos / PREGUNTAS.length) * 7;
    return (
      <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
        <div className="terminal p-8 text-center">
          <div className="tag mb-3">CÉDULA FINAL</div>
          <h1 className="label-art text-3xl text-neon-blue mb-4">Nota: {nota.toFixed(1)}</h1>
          <p className="text-parchment/70">Aciertos: {aciertos} / {PREGUNTAS.length}</p>
          <p className="text-parchment/60 text-sm mt-4">{nota >= 4.0 ? "Aprobado. La comisión asiente con cansancio." : "Reprobado. Vuelve a estudiar el Libro I del CC y la LMC."}</p>
          <Link href="/juego" className="btn mt-6 inline-block">◂ Volver al mapa</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex justify-between mb-4">
        <Link href="/juego" className="btn">◂ Mapa</Link>
        <div className="tag">PREGUNTA {i + 1} / {PREGUNTAS.length} · Aciertos: {aciertos}</div>
      </div>

      <div className="terminal p-6">
        <h2 className="label-art text-neon-cyan mb-4">{p.q}</h2>
        <div className="space-y-2">
          {p.opciones.map((op, idx) => {
            const correcto = idx === p.correcta;
            const elegido = idx === respuesta;
            return (
              <button
                key={idx}
                disabled={respuesta !== null}
                onClick={() => contestar(idx)}
                className={`block w-full text-left p-3 border text-sm ${
                  respuesta === null
                    ? "border-ink-400 hover:border-neon-blue"
                    : correcto
                      ? "border-neon-blue bg-neon-blue/10 text-neon-blue"
                      : elegido ? "border-neon-red bg-neon-red/10 text-neon-red" : "border-ink-400 opacity-50"
                }`}
              >
                {op}
              </button>
            );
          })}
        </div>
        {respuesta !== null && (
          <div className="mt-4 border-t border-ink-400 pt-4 text-sm">
            <p className="text-parchment/80">{p.explicacion}</p>
            <div className="tag tag-violet mt-2">{p.art}</div>
            <button className="btn mt-4" onClick={avanzar}>▸ Siguiente</button>
          </div>
        )}
      </div>
    </main>
  );
}
