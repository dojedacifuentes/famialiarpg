import { describe, expect, it } from "vitest";
import { CASOS_HABER } from "@/data/casos";
import { asientoRecompensa, clasificarCaso } from "@/lib/clasificacion";
import { CAPITULOS, capitulo, cumpleRequisito, estadoCapitulo, progresoCapitulo } from "@/data/capitulos";
import { estadoInicial } from "@/lib/partida";
import { generarEpilogo } from "@/lib/epilogo";
import { ESCENAS } from "@/data/dialogos";
import { ESCENARIO } from "@/data/escenario";

const caso = (fragmento: string) => {
  const c = CASOS_HABER.find((x) => x.nombre.includes(fragmento));
  if (!c) throw new Error(`caso no encontrado: ${fragmento}`);
  return c;
};

describe("clasificador del haber: el adquirente sale del enunciado", () => {
  it.each(["femenino", "masculino"] as const)("con jugador %s", (sexo) => {
    expect(clasificarCaso(caso("Parcela donada a la mujer"), sexo).clase).toBe("propio_mujer");
    expect(clasificarCaso(caso("Casa heredada del abuelo del marido"), sexo).clase).toBe("propio_marido");
    expect(clasificarCaso(caso("Inmueble adquirido por el marido antes"), sexo).clase).toBe("propio_marido");
    expect(clasificarCaso(caso("Sueldo de la mujer en empresa propia"), sexo).clase).toBe("reservado_art150");
    expect(clasificarCaso(caso("Departamento comprado durante"), sexo).clase).toBe("haber_absoluto");
  });

  it("los casos sin cónyuge nombrado siguen al personaje jugador", () => {
    expect(clasificarCaso(caso("Mil libros"), "femenino").adquirente).toBe("mujer");
    expect(clasificarCaso(caso("Mil libros"), "masculino").adquirente).toBe("marido");
    expect(clasificarCaso(caso("Mil libros"), "masculino").clase).toBe("haber_relativo");
  });

  it("la mejora de un bien propio con dineros sociales hace acreedora a la sociedad (art. 1746)", () => {
    const c = caso("Ampliación del inmueble propio del marido");
    const r = clasificarCaso(c, "femenino");
    expect(r.recompensa).toBe(c.valor);
    expect(asientoRecompensa(c, r.adquirente)).toEqual({ acreedor: "sociedad", deudor: "marido" });
  });

  it("en el haber relativo la acreedora es el cónyuge aportante", () => {
    const c = caso("Joyas donadas por una tía al marido");
    const r = clasificarCaso(c, "femenino");
    expect(r.clase).toBe("haber_relativo");
    expect(asientoRecompensa(c, r.adquirente)).toEqual({ acreedor: "marido", deudor: "sociedad" });
  });
});

describe("capítulos", () => {
  const base = estadoInicial();

  it("cada escena de un capítulo existe y tiene escenario", () => {
    for (const c of CAPITULOS) for (const e of c.escenas) {
      expect(ESCENAS[e], e).toBeDefined();
      expect(ESCENARIO[e], e).toBeDefined();
    }
  });

  it("el capítulo II se abre tras un consentimiento válido o un vínculo ocultado", () => {
    const req = capitulo("matrimonio")!.req;
    expect(cumpleRequisito(req, base)).toBe(false);
    expect(cumpleRequisito(req, { ...base, flags: ["consentimiento_valido"] })).toBe(true);
    expect(cumpleRequisito(req, { ...base, flags: ["bigamia_oculta"] })).toBe(true);
  });

  it("estado y progreso se derivan de la partida", () => {
    const nov = capitulo("noviazgo")!;
    expect(estadoCapitulo(nov, base)).toBe("disponible");
    expect(estadoCapitulo(nov, { ...base, escenas: { inicio_noviazgo: 0 } })).toBe("en_curso");
    expect(estadoCapitulo(nov, { ...base, escenas: { inicio_noviazgo: 0, impedimentos: 0, consentimiento: 0 } })).toBe("completado");
    expect(estadoCapitulo(capitulo("haber")!, base)).toBe("bloqueado");
    const casada = { ...base, personaje: { ...base.personaje, estadoCivil: "casado" as const } };
    const pr = progresoCapitulo("haber", { ...casada, escenas: { haber_intro: 0 }, hechos: { "haber:0": "ok", "haber:1": "error" } });
    expect(pr).toEqual({ hecho: 3, total: 1 + CASOS_HABER.length, completo: false });
  });
});

describe("epílogo", () => {
  it("recuerda la opción del art. 150 y conserva el epitafio", () => {
    const s = { ...estadoInicial(), hechos: { opcion150: "renunciar" } };
    s.personaje = { ...s.personaje, nombre: "Ana", regimen: "sociedad_conyugal" };
    const t = generarEpilogo(s, { cuotaPorConyuge: 1000 });
    expect(t).toContain("renunció a los gananciales");
    expect(t).toContain("Su epitafio:");
  });
});
