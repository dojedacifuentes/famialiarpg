"use client";
import Link from "next/link";
import Image from "next/image";
import GameShell from "@/components/ui/GameShell";
import MarcaEva from "@/components/eva/MarcaEva";
import { useRapida } from "@/store/useRapida";
import { useMontado } from "@/store/useGame";
import { decisionesRapidas } from "@/lib/rapida";
import { REGIMENES } from "@/lib/regimenes";
import type { Regimen } from "@/types/game";
import { Progreso } from "@/components/ui/Actividad";

export default function RapidaPage() {
  const s = useRapida();
  const listo = useMontado();
  const casos = s.regimen ? decisionesRapidas(s.regimen) : [];
  const actual = casos[s.paso];
  const respondida = s.respuestas[s.paso] !== undefined;
  const puntuacion = casos.filter((c, i) => c.correcta === s.respuestas[i]).length;
  return <GameShell titulo="Partida rápida" eyebrow="EVA ARCADE · 3 decisiones · ~3 minutos" stats={false} volver={{ href: "/", etiqueta: "Volver a la portada" }} nav={false}>
    <section className="eva-rapida panel p-4" aria-label="Caso rápido">
      {!listo ? <p>Cargando…</p> : !s.regimen ? <><MarcaEva compacta/><h2 className="t-titulo">Misma pareja. Tres futuros patrimoniales.</h2><p className="t-base txt-2">Juega con Elena y Tomás. Elige un régimen y descubre qué cambia. Tu campaña no se modifica.</p><div className="eva-rapida-cuerpo eva-regimenes">{(Object.keys(REGIMENES) as Regimen[]).map((r) => <button key={r} className="btn btn-secundario" onClick={() => s.iniciar(r)}><strong>{REGIMENES[r].nombre}</strong><span className="t-meta txt-2">{r === "sociedad_conyugal" ? "Haber social, propios y recompensas." : r === "separacion_total" ? "Titularidad individual y posibles créditos." : "Patrimonios separados; eventual crédito al finalizar."}</span></button>)}</div><p className="t-meta txt-3">Sin registro, cronómetro ni penalización. Guardado local independiente.</p></> : actual ? <><p className="rotulo txt-cian">{REGIMENES[s.regimen].nombre}</p><Progreso hecho={s.paso + 1} total={3}/><h2 className="t-titulo">{actual.titulo}</h2><div className="eva-rapida-cuerpo"><p className="t-lectura">{actual.situacion}</p><div className="grid gap-2">{actual.opciones.map((op, i) => <button key={op} className={`btn ${respondida && i === actual.correcta ? "btn-primario" : "btn-secundario"} text-left justify-start`} disabled={respondida} onClick={() => s.responder(i)}>{op}</button>)}</div>{respondida && <div className="eva-respuesta" role="status"><p className="font-bold">{s.respuestas[s.paso] === actual.correcta ? "Correcto · EVA confirma" : "EVA · Revisemos la regla"}</p><p>{actual.explicacion}</p><span className="articulo">{actual.articulo}</span></div>}</div><div className="barra-accion"><button className="btn btn-primario" disabled={!respondida} onClick={s.continuar}>{s.paso === 2 ? "Ver resultado" : "Siguiente decisión"}</button></div></> : <><div className="eva-guia-cabecera"><Image src="/eva/eva-guia.webp" alt="EVA" width={80} height={80}/><div><p className="rotulo txt-cian">Expediente resuelto</p><h2 className="t-titulo">{puntuacion} de 3 decisiones correctas</h2></div></div><p className="t-base">{puntuacion === 3 ? "EVA: «Impecable. La impresora sospecha de ti.»" : "EVA: «El error quedó archivado. El aprendizaje, contigo.»"}</p><div className="eva-rapida-cuerpo"><p className="tarjeta">{REGIMENES[s.regimen].regla}</p><p className="t-meta txt-2">Rejuega el mismo caso con otro régimen para comparar. El resultado no es asesoría jurídica ni una liquidación real.</p></div><div className="barra-accion flex-wrap"><button className="btn btn-primario" onClick={s.menu}>Comparar otro régimen</button><Link href="/creacion" className="btn btn-secundario">Abrir campaña</Link><Link href="/" className="btn btn-secundario">Portada</Link></div></>}
    </section>
  </GameShell>;
}
