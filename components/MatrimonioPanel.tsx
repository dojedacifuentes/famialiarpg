"use client";
import { useGame } from "@/store/useGame";
import type { Regimen } from "@/types/game";
import { useRouter } from "next/navigation";

const REGIMENES: { id: Regimen; titulo: string; desc: string; arts: string }[] = [
  {
    id: "sociedad_conyugal",
    titulo: "Sociedad Conyugal",
    desc: "Régimen legal supletorio. Coexisten haber social (absoluto y relativo), haberes propios, patrimonio reservado de la mujer (art. 150) y satélites art. 166-167. Administración ordinaria del marido (art. 1749), con limitaciones del art. 1754.",
    arts: "Arts. 135, 150, 166, 167, 1725, 1749, 1754 CC",
  },
  {
    id: "separacion_total",
    titulo: "Separación Total de Bienes",
    desc: "Patrimonios estancos. Cada cónyuge administra y dispone libremente. Sin haber común. Pactada en capitulaciones (art. 1715) o por sentencia (arts. 152 ss.).",
    arts: "Arts. 152, 158, 1715, 1723 CC",
  },
  {
    id: "participacion_gananciales",
    titulo: "Participación en los Gananciales",
    desc: "Durante el matrimonio funciona como separación. Al término, se compensan los gananciales y nace un crédito de participación a favor del cónyuge cuyos gananciales fueron menores (Ley 19.335).",
    arts: "Arts. 1792-1 a 1792-27 CC / Ley 19.335",
  },
];

export default function MatrimonioPanel() {
  const router = useRouter();
  const { personaje, setPersonaje, pushLog, setConyuge, conyuge } = useGame();

  function elegir(r: Regimen) {
    setPersonaje({
      ...personaje,
      regimen: r,
      estadoCivil: "casado",
      fechaMatrimonio: new Date().toISOString(),
    });
    if (!conyuge) {
      setConyuge({
        nombre: "Cónyuge",
        sexo: personaje.sexo === "femenino" ? "masculino" : "femenino",
        afecto: 60,
        confianza: 60,
        honestidad: 50,
        patrimonioOculto: 0,
        infidelidades: 0,
        vif: false,
        alcoholismo: false,
        deberesCumplidos: 90,
      });
    }
    pushLog(`Contrajiste matrimonio bajo régimen de ${r.replace(/_/g, " ")}.`, "Art. 135 CC");
    setTimeout(() => router.push("/mundo/haber"), 600);
  }

  return (
    <div className="space-y-4">
      <h2 className="label-art text-neon-blue text-xl">Elegí tu régimen patrimonial</h2>
      <p className="text-parchment/60 text-sm">
        Por el solo hecho del matrimonio se contrae sociedad de bienes (art. 135 CC), salvo capitulación expresa en contrario.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {REGIMENES.map((r) => (
          <button
            key={r.id}
            onClick={() => elegir(r.id)}
            className={`terminal p-5 text-left hover:bg-neon-blue/5 transition ${personaje.regimen === r.id ? "border-neon-blue" : ""}`}
          >
            <div className="label-art text-neon-cyan mb-2">{r.titulo}</div>
            <p className="text-parchment/70 text-xs mb-3">{r.desc}</p>
            <div className="tag tag-violet">{r.arts}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
