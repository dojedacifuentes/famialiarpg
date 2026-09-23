"use client";
// Bienes familiares (arts. 141-149 CC).
// Corrección: la declaración ya NO cambia la clase del bien a "familiar". Eso
// lo sacaba del haber social en la liquidación, contradiciendo la propia regla
// del panel ("su afectación no muda el dominio"). Ahora sólo se marca.
import { useState } from "react";
import Link from "next/link";
import { useGame } from "@/store/useGame";
import type { Bien } from "@/types/game";
import { capitulo, progresoCapitulo } from "@/data/capitulos";
import { ICONO_NATURALEZA, NOMBRE_CLASE, pesos } from "@/data/escenario";
import Actividad from "@/components/ui/Actividad";
import { Paginado } from "@/components/ui/Ajuste";
import Icono from "@/components/ui/Icono";

const REGLA = {
  titulo: "Bienes familiares (arts. 141-149 CC)",
  parrafos: [
    "El inmueble de propiedad de cualquiera de los cónyuges que sirva de residencia principal de la familia, y los muebles que la guarnecen, pueden ser declarados bienes familiares (art. 141).",
    "La declaración se hace judicialmente y limita la disposición sin autorización del otro cónyuge (art. 142). Su afectación no muda el dominio. La desafectación procede por acuerdo, por sentencia o si el bien deja de servir a la familia (art. 145).",
  ],
  articulo: "Arts. 141, 142, 145 CC",
};

export default function BienesFamiliaresPanel() {
  const game = useGame();
  const { bienes, hechos } = game;
  const [ultimo, setUltimo] = useState<string | null>(null);
  const cap = capitulo("bienes_familiares")!;
  const progreso = progresoCapitulo("bienes_familiares", game);
  const candidatos = bienes.filter((b) => b.fuente === "compra");

  function declarar(b: Bien) {
    game.updateBien(b.id, { declaradoBienFamiliar: true });
    game.setFlag("bien_familiar_declarado");
    game.registrarHecho("bf:decidido", "declarado");
    game.pushLog("Declaraste un inmueble como bien familiar.", "Art. 141 CC");
    setUltimo(`${b.nombre}: declarado bien familiar. Desde ahora su disposición requiere autorización del otro cónyuge (art. 142). El dominio no cambia.`);
  }

  function desafectar(b: Bien) {
    game.updateBien(b.id, { declaradoBienFamiliar: false });
    game.pushLog("Desafectaste un bien familiar (art. 145 CC).", "Art. 145 CC");
    setUltimo(`${b.nombre}: desafectado (art. 145).`);
  }

  return (
    <Actividad titulo="Proteger la vivienda familiar" objetivo={cap.objetivo} progreso={progreso} regla={REGLA} introClave="intro:bienes_familiares" lugar="hogar" retrato="conyuge">
      <div className="cuerpo gap-2">
        {bienes.length === 0 ? (
          <div className="tarjeta space-y-2">
            <p className="t-lectura txt-2">Aún no tienes bienes para declarar familiares.</p>
            <Link href="/mundo/haber" className="btn btn-secundario">Clasificar el haber (cap. III)</Link>
          </div>
        ) : candidatos.length === 0 ? (
          <p className="tarjeta t-lectura txt-2">Ninguno de tus bienes proviene de una compra: no hay candidatos a declarar.</p>
        ) : (
          <Paginado
            items={candidatos}
            clave={(b) => b.id}
            etiqueta="Bienes"
            columnas={(w) => (w > 760 ? 2 : 1)}
            render={(b) => (
              <article className="tarjeta flex items-center gap-3">
                <Icono nombre={ICONO_NATURALEZA[b.naturaleza] ?? "documento"} tam={26} className="txt-oro" />
                <div className="min-w-0 flex-1">
                  <div className="t-base txt-1">{b.nombre}</div>
                  <div className="t-meta txt-3">{pesos(b.valor)} · {NOMBRE_CLASE[b.clase]}</div>
                  {b.declaradoBienFamiliar && <span className="insignia mt-1" data-tono="oro"><Icono nombre="casaEscudo" tam={14} /> Bien familiar</span>}
                </div>
                {b.declaradoBienFamiliar
                  ? <button type="button" className="btn btn-peligro" onClick={() => desafectar(b)}>Desafectar (145)</button>
                  : <button type="button" className="btn btn-secundario" onClick={() => declarar(b)}>Declarar (141)</button>}
              </article>
            )}
          />
        )}
        <p className="t-meta txt-verde min-h-[1.3em]" role="status">{ultimo ?? ""}</p>
      </div>
      <div className="barra-accion">
        {!("bf:decidido" in hechos) ? (
          <button type="button" className="btn btn-secundario" onClick={() => { game.registrarHecho("bf:decidido", "ninguno"); setUltimo("Decidiste no declarar bienes familiares por ahora."); }}>
            No declarar ninguno
          </button>
        ) : (
          <Link href="/juego" className="btn btn-primario">Volver al mapa <Icono nombre="mapa" tam={18} /></Link>
        )}
      </div>
    </Actividad>
  );
}
