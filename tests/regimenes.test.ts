import { describe, expect, it } from "vitest";
import { CASOS_HABER } from "@/data/casos";
import { clasificarCaso } from "@/lib/clasificacion";
import { calcularParticipacion, opcionesPatrimoniales, casoParaRegimen } from "@/lib/regimenes";
import { estadoInicial, migrarPartida } from "@/lib/partida";
import { generarEpilogo } from "@/lib/epilogo";

describe("regímenes independientes", () => {
  it("no aplica sociedad conyugal en ST/PG a ninguno de los 23 casos", () => {
    for (const regimen of ["separacion_total", "participacion_gananciales"] as const) {
      for (const caso of CASOS_HABER) {
        const r = clasificarCaso(caso, "femenino", regimen);
        expect(r.clase).toMatch(/^individual_/);
        expect(r.recompensa).toBe(0);
        expect(opcionesPatrimoniales(regimen)).toContain(r.clase);
        expect(casoParaRegimen(caso, regimen, "femenino").nombre).not.toMatch(/dineros sociales|utilidades sociales/);
      }
    }
    expect(clasificarCaso(CASOS_HABER[0], "femenino").clase).toBe("haber_absoluto");
  });
  it("calcula crédito, no mitad del patrimonio; no comparte pérdidas", () => {
    expect(calcularParticipacion(40, 70, 10, 60)).toEqual({ gananciaA: 30, gananciaB: 50, credito: 10, acreedor: "A" });
    expect(calcularParticipacion(40, 30, 10, 30).credito).toBe(10);
    expect(calcularParticipacion(40, 30, 10, 0).acreedor).toBeNull();
    expect(calcularParticipacion(-5, 20, 0, 0).gananciaA).toBe(20);
    expect(() => calcularParticipacion(NaN, 0, 0, 0)).toThrow();
  });
  it("migra sin inventar dueño, perder progreso ni cambiar la protección familiar", () => {
    const s = estadoInicial();
    s.version = 4;
    s.personaje.regimen = "separacion_total";
    s.hechos["haber:0"] = "ok";
    s.bienes = [{ id: "x", nombre: "Bien sin antecedentes", valor: 10, clase: "familiar", naturaleza: "inmueble", fuente: "compra" }];
    const m = migrarPartida(s);
    expect(m.bienes[0].clase).toBe("titularidad_pendiente");
    expect(m.bienes[0].declaradoBienFamiliar).toBe(true);
    expect(m.hechos["haber:0"]).toBe("ok");
    expect(migrarPartida(m).bienes).toEqual(m.bienes);
  });
  it("no anuncia cuota social en el epílogo de otros regímenes", () => {
    for (const regimen of ["separacion_total", "participacion_gananciales"] as const) {
      const s = estadoInicial(); s.personaje.regimen = regimen;
      expect(generarEpilogo(s, { cuotaPorConyuge: 999 })).not.toContain("$999");
    }
  });
});
