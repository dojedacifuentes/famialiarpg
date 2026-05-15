"use client";
import Link from "next/link";
import { useGame } from "@/store/useGame";

export default function Inventario() {
  const { bienes, recompensas, hijos, flags, conyuge, personaje, incumplimientos, fechaCierta, ce, logros } = useGame();

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="label-art text-3xl text-neon-blue">📦 Inventario del expediente</h1>
        <Link href="/juego" className="btn">◂ Mapa</Link>
      </div>

      <section className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="terminal p-4">
          <div className="label-art text-neon-cyan mb-2">Personaje</div>
          <div className="text-xs space-y-1">
            <div>{personaje.nombre} · {personaje.sexo} · {personaje.profesion}</div>
            <div>Ciclo vital: <b>#{personaje.cicloVital}</b></div>
            <div>Estado civil: <b>{personaje.estadoCivil}</b></div>
            <div>Régimen: <b>{personaje.regimen?.replace(/_/g, " ") || "—"}</b></div>
            <div>Reputación: {personaje.reputacion} · Trauma: {personaje.trauma}</div>
          </div>
        </div>
        <div className="terminal p-4">
          <div className="label-art text-neon-cyan mb-2">Cónyuge</div>
          {conyuge ? (
            <div className="text-xs space-y-1">
              <div>Nombre: <b>{conyuge.nombre}</b> ({conyuge.sexo})</div>
              <div>Afecto: <b className={conyuge.afecto > 0 ? "text-neon-blue" : "text-neon-red"}>{conyuge.afecto}</b></div>
              <div>Cumplimiento deberes: <b>{conyuge.deberesCumplidos}/100</b></div>
              <div>Infidelidades: <b>{conyuge.infidelidades}</b></div>
              <div>VIF: {conyuge.vif ? "sí" : "no"}</div>
              <div>Acuerdo regulador: {conyuge.acuerdoRegulador?.completo ? "completo" : "—"}</div>
            </div>
          ) : <p className="text-parchment/40 italic">Sin cónyuge registrado.</p>}
        </div>
      </section>

      <section className="terminal p-4 mb-4">
        <div className="label-art text-neon-violet mb-3">Bienes ({bienes.length})</div>
        <table className="w-full text-xs">
          <thead className="text-parchment/50">
            <tr><th className="text-left">Bien</th><th>Clase</th><th>Ciclo</th><th className="text-right">Valor</th><th className="text-right">Recompensa</th></tr>
          </thead>
          <tbody>
            {bienes.map((b) => (
              <tr key={b.id} className="border-b border-ink-400">
                <td>{b.nombre}{b.oculto && <span className="ml-2 tag tag-red">OCULTO</span>}{b.declaradoBienFamiliar && <span className="ml-2 tag tag-amber">FAMILIAR</span>}</td>
                <td className="text-center text-neon-cyan">{b.clase}</td>
                <td className="text-center">#{b.cicloVital}</td>
                <td className="text-right">${b.valor.toLocaleString("es-CL")}</td>
                <td className="text-right text-neon-violet">{b.generaRecompensa ? `$${b.generaRecompensa.toLocaleString("es-CL")}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="terminal p-4 mb-4">
        <div className="label-art text-neon-violet mb-3">Libro de recompensas ({recompensas.length})</div>
        {recompensas.map((r) => (
          <div key={r.id} className="text-xs border-b border-ink-400 py-2">
            <b>{r.deudor} → {r.acreedor}</b>: ${r.monto.toLocaleString("es-CL")} — {r.motivo} <span className="tag tag-violet ml-1">{r.articulo}</span>
          </div>
        ))}
      </section>

      <section className="terminal p-4 mb-4">
        <div className="label-art text-neon-violet mb-3">Incumplimientos de deberes ({incumplimientos.length})</div>
        {incumplimientos.map((i) => (
          <div key={i.id} className="text-xs border-b border-ink-400 py-2">
            <b>{i.deber}</b>: {i.detalle} <span className="tag tag-violet ml-1">{i.articulo}</span> {i.habilitaCulpa && <span className="tag tag-red ml-1">CULPOSA</span>}
          </div>
        ))}
      </section>

      <section className="terminal p-4 mb-4">
        <div className="label-art text-neon-violet mb-3">Hijos ({hijos.length})</div>
        {hijos.map((h) => (
          <div key={h.id} className="text-xs border-b border-ink-400 py-2 flex justify-between">
            <span><b>{h.nombre}</b> · {h.edad} años · {h.filiacion}</span>
            <span>{h.alimentosAlDia ? "alimentos al día" : <span className="text-neon-red">en mora</span>}</span>
          </div>
        ))}
      </section>

      <section className="terminal p-4 mb-4">
        <div className="label-art text-neon-violet mb-3">Cese de convivencia y compensación</div>
        <div className="text-xs space-y-1">
          {fechaCierta
            ? <div>Fecha cierta: <b>{fechaCierta.medio}</b> · <span className="tag tag-violet">{fechaCierta.articulo}</span></div>
            : <div className="text-parchment/40 italic">Sin fecha cierta del cese.</div>}
          {ce
            ? <div>CE: <b>${ce.montoEstimado.toLocaleString("es-CL")}</b> · modalidad: {ce.modalidad}</div>
            : <div className="text-parchment/40 italic">Sin compensación económica acordada.</div>}
        </div>
      </section>

      <section className="terminal p-4 mb-4">
        <div className="label-art text-neon-violet mb-3">Logros ({logros.length})</div>
        {logros.map((l) => (
          <div key={l.id} className="text-xs border-b border-ink-400 py-2">
            <b className="text-neon-cyan">★ {l.titulo}</b> — {l.descripcion}
          </div>
        ))}
        {logros.length === 0 && <p className="text-parchment/40 italic text-xs">Sin logros aún.</p>}
      </section>

      <section className="terminal p-4">
        <div className="label-art text-neon-violet mb-3">Flags narrativos ({flags.length})</div>
        <div className="flex flex-wrap gap-1">
          {flags.map((f) => <span key={f} className="tag">{f}</span>)}
        </div>
      </section>
    </main>
  );
}
