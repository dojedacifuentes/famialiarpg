"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/store/useGame";
import type { Regimen } from "@/types/game";
import Actividad from "@/components/ui/Actividad";
import { Paginado } from "@/components/ui/Ajuste";
import Consecuencia from "@/components/ui/Consecuencia";
import Icono from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";
import { NOMBRE_REGIMEN } from "@/data/escenario";
import { capitulo } from "@/data/capitulos";

const REGIMENES: { id: Regimen; titulo: string; desc: string; arts: string; flag: string }[] = [
  {
    id: "sociedad_conyugal",
    titulo: "Sociedad Conyugal",
    desc: "Régimen legal supletorio. Coexisten haber social (absoluto y relativo), haberes propios, patrimonio reservado de la mujer (art. 150) y satélites art. 166-167. Administración ordinaria del marido (art. 1749), con limitaciones del art. 1754.",
    arts: "Arts. 135, 150, 166, 167, 1725, 1749, 1754 CC",
    flag: "regimen_sc",
  },
  {
    id: "separacion_total",
    titulo: "Separación Total de Bienes",
    desc: "Patrimonios estancos. Cada cónyuge administra y dispone libremente. Sin haber común. Pactada en capitulaciones (art. 1715) o por sentencia (arts. 152 ss.).",
    arts: "Arts. 152, 158, 1715, 1723 CC",
    flag: "regimen_st",
  },
  {
    id: "participacion_gananciales",
    titulo: "Participación en los Gananciales",
    desc: "Durante el matrimonio funciona como separación. Al término, se compensan los gananciales y nace un crédito de participación a favor del cónyuge cuyos gananciales fueron menores (Ley 19.335).",
    arts: "Arts. 1792-1 a 1792-27 CC / Ley 19.335",
    flag: "regimen_pg",
  },
];

export default function MatrimonioPanel() {
  const router = useRouter();
  const { personaje, setPersonaje, pushLog, setConyuge, conyuge, flags } = useGame();
  const casado = personaje.estadoCivil === "casado" || personaje.estadoCivil === "casado_segundo";
  // Continuidad: la puerta que abriste en el archivo del Conservador queda preseleccionada.
  const previa = REGIMENES.find((r) => flags.includes(r.flag))?.id;
  const [sel, setSel] = useState<Regimen | undefined>(personaje.regimen ?? previa);
  const [res, setRes] = useState<Delta[] | null>(null);
  const cap = capitulo("matrimonio")!;

  function contraer() {
    if (!sel || casado) return;
    const deltas = conCambios(() => {
      setPersonaje({ ...personaje, regimen: sel, estadoCivil: "casado", fechaMatrimonio: new Date().toISOString() });
      if (!conyuge) {
        setConyuge({
          nombre: "Cónyuge",
          sexo: personaje.sexo === "femenino" ? "masculino" : "femenino",
          afecto: 60, confianza: 60, honestidad: 50, patrimonioOculto: 0,
          infidelidades: 0, vif: false, alcoholismo: false, deberesCumplidos: 90,
        });
      }
      pushLog(`Contrajiste matrimonio bajo régimen de ${sel.replace(/_/g, " ")}.`, "Art. 135 CC");
    });
    setRes([{ texto: "Estado civil: casado/a", signo: "•", tono: "oro" }, { texto: `Régimen: ${NOMBRE_REGIMEN[sel]}`, signo: "•", tono: "cian" }, ...deltas]);
  }

  const elegido = REGIMENES.find((r) => r.id === (personaje.regimen ?? sel));

  return (
    <Actividad
      titulo="Elegí tu régimen patrimonial"
      objetivo={cap.objetivo}
      lugar="registro"
      retrato={casado ? "conyuge" : "oficial"}
      animo={casado ? "aprueba" : "neutral"}
      regla={{
        titulo: "Régimen patrimonial del matrimonio",
        parrafos: ["Por el solo hecho del matrimonio se contrae sociedad de bienes (art. 135 CC), salvo capitulación expresa en contrario."],
        articulo: "Art. 135 CC",
      }}
    >
      {casado ? (
        <>
          <div className="cuerpo">
            <Consecuencia
              titulo={`Casados bajo ${elegido ? elegido.titulo.toLowerCase() : "el régimen elegido"}.`}
              narrativa={res ? "Firmas, testigos, un libro de tapas oscuras. Tu vida patrimonial acaba de cambiar de forma." : "Este capítulo ya está resuelto en tu expediente."}
              deltas={res ?? [{ texto: `Régimen: ${elegido ? elegido.titulo : "—"}`, signo: "•", tono: "cian" }]}
              regla={elegido ? { articulo: elegido.arts, texto: elegido.desc, codex: "135" } : undefined}
            />
          </div>
          <div className="barra-accion">
            <button type="button" className="btn btn-primario" onClick={() => router.push("/mundo/haber")}>
              Ir al haber social <Icono nombre="flechaDer" tam={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="cuerpo">
            <Paginado
              items={REGIMENES}
              clave={(r) => r.id}
              etiqueta="Regímenes"
              columnas={(w) => (w > 860 ? 3 : 1)}
              render={(r) => (
                <button type="button" className="eleccion h-full" aria-pressed={sel === r.id} onClick={() => setSel(r.id)}>
                  <span className="flex items-center gap-2 w-full">
                    <span className="caja" aria-hidden>{sel === r.id && <Icono nombre="check" tam={16} grosor={3} />}</span>
                    <span className="font-display font-bold txt-1">{r.titulo}</span>
                  </span>
                  <span className="t-base txt-2">{r.desc}</span>
                  <span className="articulo">{r.arts}</span>
                  {previa === r.id && <span className="insignia" data-tono="cian">Tu elección en el archivo</span>}
                </button>
              )}
            />
          </div>
          <div className="barra-accion">
            <button type="button" className="btn btn-primario" disabled={!sel} onClick={contraer}>
              {sel ? `Casarse en ${REGIMENES.find((r) => r.id === sel)!.titulo.toLowerCase()}` : "Elige un régimen"}
              <Icono nombre="anillos" tam={18} />
            </button>
          </div>
        </>
      )}
    </Actividad>
  );
}
