"use client";
// Fecha cierta del cese de convivencia (arts. 22 y 25 LMC). Se constituye una
// vez; la escena de la notaría preselecciona el medio que elegiste allí.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import { validarFechaCierta } from "@/lib/reglas";
import type { MedioFechaCierta } from "@/types/game";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import Actividad from "@/components/ui/Actividad";
import Consecuencia from "@/components/ui/Consecuencia";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";
import { conCambios } from "@/lib/cambios";
import type { Delta } from "@/lib/deltas";

const MEDIOS: { id: MedioFechaCierta; nombre: string; art: string; desc: string; flag?: string }[] = [
  { id: "escritura_publica", nombre: "Escritura pública", art: "Art. 22 letra a) LMC", desc: "Otorgada ante notario. Es el medio más solemne; fecha cierta inmediata.", flag: "cese_22a" },
  { id: "escritura_privada_protocolizada", nombre: "Escritura privada protocolizada", art: "Art. 22 letra a) LMC", desc: "Documento privado firmado por los cónyuges, protocolizado ante notario." },
  { id: "acta_oficial_registro_civil", nombre: "Acta ante oficial del Registro Civil", art: "Art. 22 letra b) LMC", desc: "Más económico que la escritura pública. Equivalente probatorio.", flag: "cese_22b" },
  { id: "transaccion_judicial_aprobada", nombre: "Transacción judicial aprobada", art: "Art. 22 letra c) LMC", desc: "Convenio entre cónyuges aprobado por sentencia judicial (Tribunal de Familia)." },
  { id: "notificacion_demanda_art25", nombre: "Notificación de demanda (art. 25)", art: "Art. 25 inc. 2° LMC", desc: "La fecha cierta se fija al notificarse legalmente cualquier demanda donde un cónyuge declare cese.", flag: "cese_25" },
];

const REGLA = {
  titulo: "Fecha cierta del cese (arts. 22 y 25 LMC)",
  parrafos: [
    "Para matrimonios celebrados desde el 18-11-2004, la fecha cierta solo se acredita por los medios TAXATIVOS del art. 22 LMC y por la notificación de demanda del art. 25 inc. 2°.",
    "Antes de esa fecha, la prueba es libre (art. 2° transitorio LMC), aunque la jurisprudencia exige prueba calificada (testigos hábiles, instrumentos).",
  ],
  articulo: "Arts. 22 y 25 LMC",
};

export default function FechaCiertaPanel() {
  const game = useGame();
  const { personaje, fechaCierta, flags } = game;
  const previa = MEDIOS.find((m) => m.flag && flags.includes(m.flag))?.id;
  const [sel, setSel] = useState<MedioFechaCierta | undefined>(fechaCierta?.medio ?? previa);
  const [deltas, setDeltas] = useState<Delta[] | null>(null);
  const cap = capitulo("cese_convivencia")!;
  const progreso = progresoCapitulo("cese_convivencia", game);

  function constituir() {
    if (!sel || useGame.getState().fechaCierta) return;
    const d = conCambios(() => {
      const v = validarFechaCierta({ medio: sel, fechaMatrimonio: personaje.fechaMatrimonio });
      game.setFechaCierta(v);
      game.setFlag("cese_acreditado");
      game.pushLog(`Acreditaste cese de convivencia mediante ${sel.replace(/_/g, " ")}.`, v.articulo);
    });
    setDeltas(d);
  }

  if (fechaCierta) {
    const m = MEDIOS.find((x) => x.id === fechaCierta.medio);
    return (
      <Actividad titulo="Fecha cierta constituida" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} lugar="notaria" retrato="notario" animo="aprueba">
        <div className="cuerpo">
          <Consecuencia
            tono="exito"
            titulo={m?.nombre ?? fechaCierta.medio}
            narrativa={`Has fijado la fecha de cese mediante ${fechaCierta.medio.replace(/_/g, " ")}. A partir de aquí, el plazo del art. 55 LMC corre: 1 año si pides divorcio de común acuerdo, 3 años si pides divorcio unilateral.`}
            deltas={deltas ?? [{ texto: "Antecedente: Fecha cierta del cese", signo: "•", tono: "cian" }]}
            regla={{ articulo: fechaCierta.articulo, texto: fechaCierta.observaciones, codex: "22" }}
          />
        </div>
        <div className="barra-accion">
          <Link href="/mundo/acuerdo_regulador" className="btn btn-secundario">Acuerdo regulador</Link>
          <Link href="/mundo/separacion" className="btn btn-primario">Ir al tribunal <Icono nombre="mazo" tam={18} /></Link>
        </div>
      </Actividad>
    );
  }

  return (
    <Actividad titulo="Elige el medio de acreditación" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} introClave="intro:cese" lugar="notaria" retrato="notario">
      <div className="cuerpo">
        <Paginado
          items={MEDIOS}
          clave={(m) => m.id}
          etiqueta="Medios"
          columnas={(w) => (w > 760 ? 2 : 1)}
          render={(m) => (
            <button type="button" className="eleccion h-full" aria-pressed={sel === m.id} onClick={() => setSel(m.id)}>
              <span className="flex items-center gap-2 w-full">
                <span className="caja" aria-hidden>{sel === m.id && <Icono nombre="check" tam={16} grosor={3} />}</span>
                <span className="font-bold txt-1">{m.nombre}</span>
              </span>
              <span className="articulo">{m.art}</span>
              <span className="t-base txt-2">{m.desc}</span>
              {previa === m.id && <span className="insignia" data-tono="cian">Lo elegiste en la notaría</span>}
            </button>
          )}
        />
      </div>
      <div className="barra-accion">
        <button type="button" className="btn btn-primario" disabled={!sel} onClick={constituir}>
          {sel ? "Constituir fecha cierta" : "Elige un medio"} <Icono nombre="calendario" tam={18} />
        </button>
      </div>
    </Actividad>
  );
}
