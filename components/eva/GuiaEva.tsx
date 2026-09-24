"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useGame } from "@/store/useGame";
import { usePreferencias } from "@/store/usePreferencias";
import { capitulo, siguienteCapitulo } from "@/data/capitulos";
import { REGIMENES } from "@/lib/regimenes";
import Hoja from "@/components/ui/Hoja";

export default function GuiaEva() {
  const [abierta, setAbierta] = useState(false);
  const [modo, setModo] = useState<"orientar" | "explicar" | "revisar">("orientar");
  const cerrar = useCallback(() => setAbierta(false), []);
  const game = useGame();
  const prefs = usePreferencias();
  const path = usePathname();
  const cap = capitulo(path.split("/").at(-1) ?? "", game.personaje.regimen);
  const sig = siguienteCapitulo(game);
  const r = game.personaje.regimen ? REGIMENES[game.personaje.regimen] : undefined;
  const ayuda = modo === "orientar" ? cap?.objetivo ?? (sig ? `Tu próximo objetivo: ${sig.objetivo}` : "Abre el mapa o prueba una partida rápida. Tu campaña se conserva.")
    : modo === "explicar" ? cap && !["haber", "matrimonio", "liquidacion", "bienes_familiares"].includes(cap.id) ? `${cap.subt} Consulta el botón de información del panel para la regla de esta actividad. No te adelantaré las consecuencias de tu elección.` : r?.regla ?? "Primero elige tu régimen. La titularidad, la administración y el eventual crédito final son preguntas diferentes."
    : game.log[0] ? `Última actuación registrada: ${game.log[0].texto}. Puedes revisar sus consecuencias en la bitácora del capítulo, sin repetir recompensas.` : "Todavía no has tomado decisiones en la campaña. Cuando lo hagas, aquí revisaremos lo ocurrido.";
  return <>
    <button className="eva-ayuda" type="button" onClick={() => setAbierta(true)} aria-label="Abrir guía EVA y ajustes" aria-haspopup="dialog"><Image src="/eva/eva-guia.webp" alt="" width={36} height={36}/><span>EVA<span className="eva-online" aria-hidden> ·</span></span></button>
    <Hoja abierta={abierta} onCerrar={cerrar} titulo="EVA · Tu guía de expediente">
      <div className="eva-guia-cabecera"><Image src="/eva/eva-guia.webp" alt="EVA, guía del juego" width={96} height={96}/><div><p className="rotulo txt-cian">Presente cuando la necesitas</p><p className="t-meta txt-2">«La burocracia es eterna. Tu tiempo no.»</p></div></div>
      <div className="flex flex-wrap gap-2 my-3" role="group" aria-label="Tipo de ayuda">{(["orientar", "explicar", "revisar"] as const).map((m) => <button key={m} className={`btn ${modo === m ? "btn-primario" : "btn-secundario"}`} aria-pressed={modo === m} onClick={() => setModo(m)}>{m === "orientar" ? "Orientar" : m === "explicar" ? "Explicar" : "Revisar"}</button>)}</div>
      <p className="tarjeta t-base" aria-live="polite">{ayuda}</p>
      <fieldset className="mt-4 space-y-3"><legend className="rotulo mb-2">A tu ritmo</legend><label className="block">Velocidad de lectura<select className="campo mt-1" value={prefs.lectura} onChange={(e) => prefs.setLectura(e.target.value as typeof prefs.lectura)}><option value="instantanea">Instantánea</option><option value="rapida">Rápida</option><option value="animada">Animada</option></select></label><label className="flex items-center gap-3 min-h-[44px]"><input type="checkbox" checked={prefs.movimiento} onChange={(e) => prefs.setMovimiento(e.target.checked)}/> Animaciones suaves</label><p className="t-meta txt-3">Sin audio de fondo. También respetamos la preferencia de movimiento reducido de tu dispositivo.</p></fieldset>
      <p className="t-meta txt-3 mt-3">Guía didáctica local, sin chat externo ni envío de tu partida. No reemplaza asesoría jurídica.</p>
    </Hoja>
  </>;
}
