"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ARTICULOS_DESTACADOS } from "@/lib/reglas";

const TEMAS: { titulo: string; cuerpo: string; tags: string[] }[] = [
  { titulo: "Matrimonio (art. 102 CC)", cuerpo: "Contrato solemne por el cual un hombre y una mujer se unen actual e indisolublemente, y por toda la vida, con el fin de vivir juntos, procrear y auxiliarse mutuamente. La Ley 21.400 amplía la celebración entre personas del mismo sexo (entrada en vigencia 10-03-2022).", tags: ["matrimonio", "102"] },
  { titulo: "Deberes recíprocos (arts. 131-134 CC)", cuerpo: "Fidelidad, socorro, ayuda mutua, respeto y protección (131). Adulterio como grave infracción al deber de fidelidad (132). Derecho y deber de vivir en el hogar común (133). Sustento de la familia común (134). Su incumplimiento grave habilita causal de divorcio culposo (art. 54 N°2 LMC).", tags: ["deberes", "131", "132", "133", "134", "fidelidad"] },
  { titulo: "Sociedad conyugal (art. 1725 CC)", cuerpo: "Régimen legal supletorio. Coexisten tres patrimonios: el social (haber absoluto y haber relativo), el del marido y el de la mujer, este último con sus patrimonios satélites de los arts. 150, 166 y 167.", tags: ["sc", "sociedad conyugal", "1725"] },
  { titulo: "Patrimonio reservado (art. 150 CC)", cuerpo: "Bienes adquiridos por la mujer con producto de su trabajo separado del marido. Administra y dispone como separada de bienes. Las deudas afectan solo al reservado y sus bienes propios. Al disolverse la SC, opción IRREVOCABLE: aceptar o renunciar gananciales.", tags: ["150", "reservado", "mujer"] },
  { titulo: "Patrimonios satélite 166-167 CC", cuerpo: "Art. 166: bienes donados, legados o heredados a la mujer con condición precisa de que no los administre el marido. Art. 167: separación parcial pactada en capitulaciones matrimoniales. Ambos: la mujer administra como separada respecto de ellos.", tags: ["166", "167", "satélite", "mujer"] },
  { titulo: "Administración (arts. 1749, 1754 CC)", cuerpo: "Art. 1749: el marido es jefe de la sociedad conyugal; administra los bienes sociales y los propios de su mujer. Limitaciones: requiere autorización de la mujer para los actos del art. 1749 inc. 3°. Art. 1754: la mujer no puede enajenar ni gravar sus bienes propios sin autorización del marido.", tags: ["1749", "1754", "administración"] },
  { titulo: "Bienes familiares (arts. 141-149 CC)", cuerpo: "El inmueble de propiedad de cualquiera de los cónyuges que sirva de residencia principal y los muebles que lo guarnecen pueden ser declarados familiares judicialmente. La declaración limita la disposición sin autorización del otro. Desafectación: acuerdo, sentencia, o cese del destino familiar.", tags: ["141", "142", "145", "familiares"] },
  { titulo: "Capitulaciones matrimoniales (arts. 1715-1721 CC)", cuerpo: "Convenios de carácter patrimonial. Previas: escritura pública subinscrita en 30 días. En el acto del matrimonio: elección de régimen. Posteriores: solo separación total o participación en gananciales (art. 1723).", tags: ["1715", "1716", "1723", "capitulaciones"] },
  { titulo: "Causales de divorcio culposo (art. 54 LMC)", cuerpo: "Siete causales: atentado contra la vida o malos tratamientos graves; transgresión grave y reiterada de los deberes (incluyendo abandono); condena ejecutoriada por delitos del Código Penal; conducta homosexual; alcoholismo o drogadicción grave; tentativa de prostituir al cónyuge o hijos; otros.", tags: ["54", "divorcio", "culposo"] },
  { titulo: "Divorcio sin culpa (art. 55 LMC)", cuerpo: "De común acuerdo: cese de 1 año + acuerdo regulador completo y suficiente (art. 21 y 27). Unilateral: cese de 3 años con fecha cierta. El cónyuge que pide unilateralmente debe estar al día en alimentos.", tags: ["55", "divorcio", "cese"] },
  { titulo: "Fecha cierta del cese (arts. 22 y 25 LMC)", cuerpo: "Medios taxativos: escritura pública o privada protocolizada; acta ante oficial del Registro Civil; transacción judicial aprobada. Además, art. 25 inc. 2°: notificación de demanda donde un cónyuge declare cese. Matrimonios pre-2004: prueba libre con limitaciones jurisprudenciales.", tags: ["22", "25", "cese", "fecha cierta"] },
  { titulo: "Acuerdo regulador (arts. 21 y 27 LMC)", cuerpo: "Para el divorcio de común acuerdo. Completo: cubre alimentos hijos, cuidado personal, relación directa y regular, y demás materias relevantes. Suficiente: resguarda interés superior de los hijos y mitiga el menoscabo económico.", tags: ["21", "27", "acuerdo"] },
  { titulo: "Compensación económica (arts. 61-66 LMC)", cuerpo: "Procede cuando un cónyuge se dedicó al hogar/hijos y no pudo desarrollar actividad remunerada (61). Criterios del 62: duración, edad, salud, situación previsional, calificación, mercado laboral, colaboración. Modalidades art. 65: monto único, cuotas reajustables, transferencia de bienes, usufructo/uso/habitación.", tags: ["61", "62", "65", "compensación", "ce"] },
  { titulo: "Nulidad y matrimonio putativo (arts. 50-52 LMC)", cuerpo: "Nulo por incapacidad, vicio del consentimiento o defecto formal. Si concurre buena fe y justa causa de error, produce los mismos efectos civiles que el válido respecto del cónyuge de buena fe y de los hijos (art. 51 LMC).", tags: ["50", "51", "52", "nulidad", "putativo"] },
  { titulo: "Filiación (arts. 179-221 CC)", cuerpo: "Matrimonial, no matrimonial o adoptiva, con iguales derechos (Ley 19.585). Acciones de reclamación: imprescriptible para el hijo (195); 2 años para los demás (206). Impugnación: plazos del 212. Prueba biológica con compulsión (199): la negativa hace presumir la paternidad.", tags: ["199", "205", "206", "212", "filiación"] },
  { titulo: "Alimentos (Ley 14.908)", cuerpo: "Obligación de socorro entre parientes. Procedimiento sumario ante Tribunal de Familia. Apremios: arrestos, retención tributaria, suspensión de licencia. Registro Nacional de Deudores de Pensiones de Alimentos (Ley 21.389).", tags: ["alimentos", "14.908", "21.389"] },
  { titulo: "Liquidación (arts. 1765-1788 CC)", cuerpo: "Etapas: facción de inventario, tasación, deducciones (bajas generales art. 959), liquidación de recompensas (1769-1779), cómputo de gananciales, división por mitades (1774), adjudicación (1337), inscripción conservatoria.", tags: ["liquidación", "1765", "1774"] },
  { titulo: "Segundas nupcias e inventario solemne (arts. 124-127 CC)", cuerpo: "El cónyuge que tuvo hijos del matrimonio anterior bajo su patria potestad o guarda debe confeccionar inventario solemne antes de contraer nuevas nupcias. Su omisión genera sanción del art. 127 (pérdida del derecho a suceder al hijo).", tags: ["124", "127", "segundas nupcias"] },
];

export default function Codex() {
  const [q, setQ] = useState("");
  const filtrados = useMemo(
    () => TEMAS.filter((t) =>
      !q || t.titulo.toLowerCase().includes(q.toLowerCase()) ||
      t.cuerpo.toLowerCase().includes(q.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()))
    ),
    [q]
  );

  return (
    <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <div className="tag mb-2">CODEX JURIDICUS</div>
          <h1 className="label-art text-3xl text-neon-blue">Articulado mínimo y temas clave</h1>
        </div>
        <Link href="/" className="btn">◂ Inicio</Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar: artículo, deber, concepto..."
        className="w-full bg-ink-700 border border-neon-blue/30 p-3 mb-4 focus:outline-none focus:border-neon-blue"
      />

      <div className="terminal p-4 mb-6">
        <div className="label-art text-neon-violet mb-2 text-sm">Artículos destacados ({ARTICULOS_DESTACADOS.length})</div>
        <div className="grid sm:grid-cols-2 gap-1 text-xs">
          {ARTICULOS_DESTACADOS.map((a) => (
            <div key={a.n}><b className="text-neon-cyan">{a.n}</b> — {a.t}</div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtrados.map((t) => (
          <details key={t.titulo} className="terminal p-4">
            <summary className="label-art text-neon-cyan cursor-pointer">{t.titulo}</summary>
            <p className="mt-2 text-parchment/80 text-sm leading-relaxed">{t.cuerpo}</p>
            <div className="mt-2 flex gap-1 flex-wrap">
              {t.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </div>
          </details>
        ))}
        {filtrados.length === 0 && <p className="text-parchment/40 italic">Sin resultados para "{q}".</p>}
      </div>
    </main>
  );
}
