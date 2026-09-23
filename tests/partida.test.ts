import { describe, expect, it } from "vitest";
import { escenasDesdeFlags, estadoInicial, migrarPartida, VERSION_PARTIDA } from "@/lib/partida";
import { CASOS_HABER } from "@/data/casos";

// Guardado real de la versión 3 (forma de store/useGame.ts antes del rediseño).
const v3 = {
  version: 3,
  creado: 111,
  ultimoGuardado: 222,
  personaje: {
    nombre: "Rojas, Ana", sexo: "femenino", origen: "clase_media", profesion: "abogado", nivelEconomico: 55,
    atributos: { persuasion: 6, honestidad: 6, impulsividad: 5, inteligencia_juridica: 8, empatia: 5, resistencia_emocional: 5 },
    reputacion: 12, trauma: 3, estadoCivil: "casado", regimen: "sociedad_conyugal", cicloVital: 2,
  },
  conyuge: { nombre: "Cónyuge", sexo: "masculino", afecto: 60, confianza: 60, honestidad: 50, patrimonioOculto: 0, infidelidades: 0, vif: false, alcoholismo: false, deberesCumplidos: 90 },
  hijos: [{ id: "h1", nombre: "Sofía", edad: 5, filiacion: "matrimonial", reconocido: true, alimentosAlDia: true, afecto: 80, trauma: 0, recuerdos: [] }],
  bienes: [
    { id: "b1", nombre: "Departamento comprado durante el matrimonio", valor: 90_000_000, clase: "familiar", naturaleza: "inmueble", fuente: "compra", tituloOnerosoOGratuito: "oneroso", declaradoBienFamiliar: true },
    { id: "b2", nombre: CASOS_HABER[0].nombre, valor: 1_500_000, clase: "haber_absoluto", naturaleza: "dinero", fuente: "trabajo" },
  ],
  recompensas: [],
  incumplimientos: [],
  flags: ["registro_esponsales", "consentimiento_valido", "regimen_sc"],
  mundoActual: "haber",
  log: [{ t: 1, texto: "algo" }],
  logros: [],
};

describe("migrarPartida (v3 → v4)", () => {
  const m = migrarPartida(v3, 3);

  it("conserva personaje, cónyuge, hijos, bienes, flags y registro", () => {
    expect(m.version).toBe(VERSION_PARTIDA);
    expect(m.personaje.nombre).toBe("Rojas, Ana");
    expect(m.personaje.cicloVital).toBe(2);
    expect(m.personaje.atributos.inteligencia_juridica).toBe(8);
    expect(m.conyuge?.afecto).toBe(60);
    expect(m.hijos).toHaveLength(1);
    expect(m.bienes).toHaveLength(2);
    expect(m.flags).toEqual(v3.flags);
    expect(m.log).toHaveLength(1);
    expect(m.creado).toBe(111);
  });

  it("deduce las escenas ya jugadas a partir de los flags", () => {
    expect(Object.keys(m.escenas).sort()).toEqual(["consentimiento", "eleccion_regimen", "inicio_noviazgo"]);
  });

  it("marca como resueltos los casos cuyo bien ya está en el inventario", () => {
    expect(m.hechos["haber:0"]).toBe("ok");
    expect(m.hechos["haber:1"]).toBeUndefined();
  });

  it("devuelve al haber social el bien marcado como 'familiar' y conserva la declaración", () => {
    const depto = m.bienes.find((b) => b.id === "b1")!;
    expect(depto.clase).toBe("haber_absoluto");
    expect(depto.declaradoBienFamiliar).toBe(true);
  });

  it("no toca un guardado v4 ya migrado", () => {
    const v4 = { ...m, escenas: { impedimentos: 1 }, hechos: { "deber:fidelidad": "cumple" } };
    const otra = migrarPartida(v4, 4);
    expect(otra.escenas).toEqual({ impedimentos: 1 });
    expect(otra.hechos).toEqual({ "deber:fidelidad": "cumple" });
  });

  it("repara guardados corruptos sin lanzar", () => {
    const r = migrarPartida({ personaje: "roto", bienes: 5, flags: [1, "ok"], hechos: null }, 1);
    expect(r.personaje.nombre).toBe("");
    expect(r.bienes).toEqual([]);
    expect(r.flags).toEqual(["ok"]);
    expect(r.escenas).toEqual({});
    expect(migrarPartida(undefined)).toMatchObject({ version: VERSION_PARTIDA, bienes: [], escenas: {}, hechos: {} });
  });
});

describe("escenasDesdeFlags", () => {
  it("guarda el índice de la opción que dejó el flag", () => {
    expect(escenasDesdeFlags(["bigamia_oculta"])).toEqual({ consentimiento: 1 });
    expect(escenasDesdeFlags([])).toEqual({});
  });
});

describe("estadoInicial", () => {
  it("incluye los campos nuevos de v4", () => {
    const e = estadoInicial(5);
    expect(e).toMatchObject({ version: VERSION_PARTIDA, escenas: {}, hechos: {}, creado: 5 });
  });
});
