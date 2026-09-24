"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/store/useGame";
import { calcularParticipacion, esBienDelCiclo, REGIMENES } from "@/lib/regimenes";
import { generarEpilogo } from "@/lib/epilogo";
import GameShell from "@/components/ui/GameShell";
import Actividad from "@/components/ui/Actividad";
import { pesos } from "@/data/escenario";

export default function CierreRegimen() {
  const game = useGame();
  const router = useRouter();
  const regimen = game.personaje.regimen!;
  const pg = regimen === "participacion_gananciales";
  const fase = Math.max(0, Math.min(2, Number(game.hechos["cierre:fase"] ?? 0)));
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const bienes = game.bienes.filter((b) => esBienDelCiclo(b, game.personaje.cicloVital));
  const pendientes = bienes.filter((b) => b.clase === "titularidad_pendiente").length;
  const ejemplo = calcularParticipacion(40000000, 70000000, 10000000, 60000000);
  const opciones = pg ? ["Repartir cada bien por mitades", `Crédito de ${pesos(ejemplo.credito)} a favor de A`, "A absorbe todo el patrimonio de B"] : ["Repartir por mitades todos los bienes", "Cada titular conserva sus bienes; revisar créditos y copropiedad acreditados", "Convertir los bienes en haber relativo"];
  const resuelta = game.hechos["cierre:respuesta"] !== undefined;
  function responder(i: number) { if (respuesta !== null || resuelta) return; setRespuesta(i); game.registrarHecho("cierre:respuesta", i); }
  function cerrar() {
    game.registrarHecho("cierre:fin");
    game.finalizar(generarEpilogo(useGame.getState(), { cuotaPorConyuge: 0 }));
    router.push("/epilogo");
  }
  return <GameShell titulo={pg ? "Crédito de participación" : "Cierre patrimonial"} eyebrow={REGIMENES[regimen].nombre} volver={{ href: "/juego", etiqueta: "Volver al mapa" }}>
    <Actividad titulo={["1 · Revisa tu expediente", "2 · Resuelve el cierre", "3 · Resultado"][fase]} progreso={{ hecho: fase + 1, total: 3 }} regla={{ titulo: "Regla del régimen", parrafos: [REGIMENES[regimen].regla], articulo: REGIMENES[regimen].articulo }}>
      <div className="cuerpo gap-3 overflow-y-auto">
        {fase === 0 && <><p className="t-lectura">Registraste {bienes.length} bienes en los ejercicios de este ciclo. No se transforman en una masa social.</p><p className="tarjeta">{pendientes > 0 ? `${pendientes} registros antiguos necesitan acreditar titularidad. Se conservan sin asignar dueño.` : "La titularidad individual se mantiene. La protección de bienes familiares no cambia al propietario."}</p><p className="t-meta txt-2">Los casos del taller son independientes: sumar sueldos, inmuebles y bienes que los sustituyen duplicaría valores. No constituyen un balance real ni permiten calcular tu patrimonio final.</p></>}
        {fase === 1 && <><p className="t-lectura">{pg ? "Caso de cierre independiente. Balances netos ya ajustados y expresados a la misma fecha: A pasó de $40 a $70 millones; B, de $10 a $60 millones. No hay otros ajustes pendientes. ¿Qué corresponde?" : "Al terminar el régimen, constan bienes individuales, sin copropiedad ni créditos pendientes acreditados. ¿Qué corresponde?"}</p><div className="grid gap-2">{opciones.map((op, i) => <button key={op} className="btn btn-secundario text-left" disabled={respuesta !== null || resuelta} onClick={() => responder(i)}>{op}</button>)}</div>{(respuesta !== null || resuelta) && <p className="tarjeta" role="status">{Number(game.hechos["cierre:respuesta"]) === 1 ? "Correcto. " : "Revisa: la segunda opción es la correcta. "}{pg ? "A ganó 30 y B ganó 50 millones. La mitad de la diferencia es un crédito de 10 millones a favor de A. Las pérdidas no se reparten." : "No existe una liquidación de sociedad conyugal. Los posibles créditos y la partición de una copropiedad exigen sus propios antecedentes."}</p>}</>}
        {fase === 2 && <><p className="t-lectura">{pg ? "Aprendiste a distinguir titularidad y crédito de participación. El ejemplo no se incorpora como una deuda ficticia a tu inventario." : "Cierre registrado sin dividir bienes individuales ni generar recompensas de sociedad conyugal."}</p><p className="tarjeta">EVA: «El archivo ha cerrado. La impresora exige un certificado que acredite que el archivo ha cerrado.»</p><p className="t-meta txt-2">La compensación económica, los alimentos y los bienes familiares son materias distintas del cálculo del régimen.</p></>}
      </div>
      <div className="barra-accion">{fase > 0 && <button className="btn btn-secundario" onClick={() => game.fijarAvance("cierre:fase", fase - 1)}>Atrás</button>}{fase < 2 ? <button className="btn btn-primario" disabled={fase === 1 && !resuelta} onClick={() => game.fijarAvance("cierre:fase", fase + 1)}>Continuar</button> : <button className="btn btn-primario" onClick={cerrar}>Cerrar y leer epílogo</button>}</div>
    </Actividad>
  </GameShell>;
}
