import { beforeEach, describe, expect, it } from "vitest";
import { useGame } from "@/store/useGame";
import { ESCENAS } from "@/data/dialogos";
import type { Bien } from "@/types/game";

const bien: Bien = { id: "x1", nombre: "Auto", valor: 10, clase: "haber_absoluto", naturaleza: "mueble", fuente: "compra" };

beforeEach(() => {
  useGame.getState().reset();
});

describe("resolverEscena — recompensas una sola vez", () => {
  it("aplica los efectos de la opción y la registra", () => {
    const esc = ESCENAS.inicio_noviazgo; // opción 0: +2 reputación, flag registro_esponsales
    expect(useGame.getState().resolverEscena(esc, 0)).toBe(true);
    const s = useGame.getState();
    expect(s.personaje.reputacion).toBe(2);
    expect(s.flags).toContain("registro_esponsales");
    expect(s.escenas.inicio_noviazgo).toBe(0);
    expect(s.log[0].texto).toBe("Registraste esponsales sin valor civil.");
  });

  it("repetir (recarga, doble toque, volver) no duplica nada", () => {
    const esc = ESCENAS.inicio_noviazgo;
    useGame.getState().resolverEscena(esc, 0);
    expect(useGame.getState().resolverEscena(esc, 0)).toBe(false);
    expect(useGame.getState().resolverEscena(esc, 1)).toBe(false);
    const s = useGame.getState();
    expect(s.personaje.reputacion).toBe(2);
    expect(s.flags.filter((f) => f === "registro_esponsales")).toHaveLength(1);
    expect(s.flags).not.toContain("intento_corromper");
    expect(s.log).toHaveLength(1);
  });

  it("respeta los límites de los atributos", () => {
    useGame.setState((s) => ({ personaje: { ...s.personaje, atributos: { ...s.personaje.atributos, inteligencia_juridica: 10 } } }));
    useGame.getState().resolverEscena(ESCENAS.art150_explica, 0); // +1 inteligencia jurídica
    expect(useGame.getState().personaje.atributos.inteligencia_juridica).toBe(10);
  });
});

describe("hechos y acciones idempotentes", () => {
  it("registrarHecho sólo acepta la primera vez", () => {
    const g = useGame.getState();
    expect(g.registrarHecho("haber:0", "ok")).toBe(true);
    expect(useGame.getState().registrarHecho("haber:0", "error")).toBe(false);
    expect(useGame.getState().hechos["haber:0"]).toBe("ok");
  });

  it("fijarAvance sobrescribe y borra", () => {
    useGame.getState().fijarAvance("liq:fase", 3);
    expect(useGame.getState().hechos["liq:fase"]).toBe(3);
    useGame.getState().fijarAvance("liq:fase", undefined);
    expect("liq:fase" in useGame.getState().hechos).toBe(false);
  });

  it("addBien, addRecompensa y addIncumplimiento no duplican por id", () => {
    const g = useGame.getState();
    g.addBien(bien); g.addBien(bien);
    g.addRecompensa({ id: "r", acreedor: "mujer", deudor: "sociedad", monto: 1, motivo: "", articulo: "" });
    g.addRecompensa({ id: "r", acreedor: "mujer", deudor: "sociedad", monto: 1, motivo: "", articulo: "" });
    g.addIncumplimiento({ id: "i", deber: "fidelidad", fecha: 0, detalle: "", articulo: "", habilitaCulpa: true });
    g.addIncumplimiento({ id: "i", deber: "fidelidad", fecha: 0, detalle: "", articulo: "", habilitaCulpa: true });
    const s = useGame.getState();
    expect(s.bienes).toHaveLength(1);
    expect(s.recompensas).toHaveLength(1);
    expect(s.incumplimientos).toHaveLength(1);
  });
});

describe("iniciarSegundaVida", () => {
  it("abre un ciclo nuevo: escenas y hechos se reinician, el inventario solemne se conserva", () => {
    const g = useGame.getState();
    g.addBien({ ...bien, id: "p", clase: "propio_mujer" });
    g.addBien(bien);
    g.resolverEscena(ESCENAS.segunda_vida_intro, 0); // flag inventario_124_hecho
    g.registrarHecho("haber:0", "ok");
    g.setFlag("ruptura_definitiva");
    useGame.getState().iniciarSegundaVida();
    const s = useGame.getState();
    expect(s.personaje.cicloVital).toBe(2);
    expect(s.escenas).toEqual({});
    expect(s.hechos).toEqual({});
    expect(s.flags).toContain("inventario_124_hecho");
    expect(s.flags).not.toContain("ruptura_definitiva");
    expect(s.bienes.map((b) => b.id)).toEqual(["p"]);
  });
});

describe("reset", () => {
  it("vuelve al estado inicial v4", () => {
    const g = useGame.getState();
    g.setPersonaje({ ...g.personaje, nombre: "Alguien" });
    g.registrarHecho("x");
    g.finalizar("fin");
    useGame.getState().reset();
    const s = useGame.getState();
    expect(s.personaje.nombre).toBe("");
    expect(s.hechos).toEqual({});
    expect(s.finalizado).toBe(false);
    expect(s.epilogo).toBeUndefined();
  });
});
