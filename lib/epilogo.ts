// Epílogo patrimonial. Texto trasladado desde app/liquidacion/page.tsx; se
// tipa el estado y se añade una línea para la opción del art. 150, que ahora
// se guarda en la partida.
import type { SaveState } from "@/types/game";

type Calculo = { cuotaPorConyuge: number };

export function generarEpilogo(game: Pick<SaveState, "personaje" | "hijos" | "flags" | "incumplimientos" | "recompensas" | "ce" | "hechos">, calc: Calculo): string {
  const p = game.personaje;
  const cuota = calc.cuotaPorConyuge;
  const hijosTrauma = game.hijos.reduce((s, h) => s + h.trauma, 0);
  const moroso = game.hijos.some((h) => !h.alimentosAlDia);
  const fraude = game.flags.includes("fraude_simulacion");
  const vif = game.flags.includes("denuncia_vif");
  const bigamia = game.flags.includes("bigamia_oculta");
  const ceFalsa = game.flags.includes("cese_falso");
  const incumpl = (game.incumplimientos || []).filter((i) => i.habilitaCulpa).length;
  const opcion150 = p.regimen === "sociedad_conyugal" ? game.hechos?.["opcion150"] : undefined;

  const tono = p.trauma > 70 ? "ruinoso" : p.reputacion > 30 ? "ejemplar" : "gris";

  const lineas: string[] = [];
  lineas.push(`${p.nombre}, ${p.profesion} de origen ${p.origen}, completó el ciclo vital N°${p.cicloVital} el ${new Date().toLocaleDateString("es-CL")}.`);
  lineas.push(`Estado civil definitivo del ciclo: ${p.estadoCivil}. Régimen: ${p.regimen?.replace(/_/g, " ") ?? "ninguno"}.`);
  if (p.regimen === "separacion_total") lineas.push("Cerró el régimen manteniendo las titularidades individuales. No se repartió una sociedad conyugal inexistente.");
  else if (p.regimen === "participacion_gananciales") lineas.push("Completó el ejercicio del crédito de participación. El crédito real exige balances netos ajustados; el ejemplo no adjudicó bienes ni generó una deuda en su expediente.");
  else lineas.push(`El modelo didáctico de sociedad conyugal arrojó una cuota estimada de $${cuota.toLocaleString("es-CL")}. No constituye una adjudicación real.`);
  if (opcion150 === "aceptar") lineas.push("Ejerció la opción del art. 150 inc. final: aceptó los gananciales, y su patrimonio reservado se confundió con el haber social.");
  if (opcion150 === "renunciar") lineas.push("Ejerció la opción del art. 150 inc. final: renunció a los gananciales y conservó íntegro su patrimonio reservado.");
  if (incumpl > 0) lineas.push(`Acumuló ${incumpl} incumplimientos graves de deberes recíprocos (art. 131 ss. CC). Esto pudo bloquear su compensación económica (art. 62 inc. 2° LMC).`);
  if (game.recompensas?.length) lineas.push(`Acumuló ${game.recompensas.length} asientos en el libro de recompensas (arts. 1769-1779).`);
  if (moroso) lineas.push("Quedaron obligaciones alimenticias pendientes: requieren atención prioritaria y pueden dar lugar a medidas de cumplimiento conforme a la ley.");
  if (fraude) lineas.push(`Se rumorea que simuló una enajenación: la nulidad relativa pende sobre su tumba (art. 1682 CC).`);
  if (bigamia) lineas.push(`Su primer matrimonio nunca fue disuelto; el segundo fue declarado nulo, pero los hijos conservaron la calidad de matrimoniales por buena fe (art. 51 LMC).`);
  if (vif) lineas.push(`La VIF dejó marcas que la jurisprudencia llamó "daño moral indemnizable" (Ley 20.066).`);
  if (ceFalsa) lineas.push(`Falseó la fecha del cese: la contraparte impugnó. Lo demás fue silencio procesal.`);
  if (hijosTrauma > 40) lineas.push(`Sus hijos crecieron tomando notas de cada incumplimiento. Recordarán todo.`);
  if (game.ce?.acordada) lineas.push(`Su compensación económica final fue de $${game.ce.montoEstimado.toLocaleString("es-CL")} en modalidad ${game.ce.modalidad}.`);
  lineas.push(tono === "ruinoso"
    ? "Su epitafio: «Aquí yace un haber relativo sin recompensar»."
    : tono === "ejemplar"
      ? "Su epitafio: «Cumplió los arts. 131 y 102 hasta el final»."
      : "Su epitafio: «Un patrimonio razonable. Un afecto razonable. Nada del otro mundo civil».");

  return lineas.join("\n\n");
}
