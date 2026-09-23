import { describe, expect, it } from "vitest";
import { coincide, dividirEnClausulas, dividirEnFrases, paginaDe, paginarTexto, repartirEnPaginas } from "@/lib/paginar";

describe("repartirEnPaginas", () => {
  it("agrupa elementos sin superar el alto disponible", () => {
    const r = repartirEnPaginas([100, 100, 100, 100], 250, 10);
    expect(r.paginas).toEqual([[0, 1], [2, 3]]);
    expect(r.desborda).toBe(false);
  });

  it("no pierde ningún elemento", () => {
    const alturas = [40, 90, 30, 200, 10, 70, 55];
    const r = repartirEnPaginas(alturas, 180, 8);
    expect(r.paginas.flat()).toEqual(alturas.map((_, i) => i));
  });

  it("marca desborde cuando un elemento solo no cabe, pero lo conserva", () => {
    const r = repartirEnPaginas([50, 400, 50], 200, 0);
    expect(r.paginas).toEqual([[0], [1], [2]]);
    expect(r.desborda).toBe(true);
  });

  it("con columnas usa el alto de la fila", () => {
    const r = repartirEnPaginas([50, 120, 60, 60, 60], 190, 10, 2);
    // filas: [0,1]=120, [2,3]=60, [4]=60 → 120+10+60 = 190 cabe; +70 no.
    expect(r.paginas).toEqual([[0, 1, 2, 3], [4]]);
  });

  it("encuentra la página de un elemento", () => {
    expect(paginaDe([[0, 1], [2, 3], [4]], 3)).toBe(1);
    expect(paginaDe([[0, 1]], 9)).toBe(0);
  });
});

describe("dividirEnFrases", () => {
  it("respeta abreviaturas jurídicas", () => {
    const t = "Recuerde: la promesa NO produce obligación (art. 98 CC). Es un hecho privado. Inexigible, siempre.";
    expect(dividirEnFrases(t)).toEqual([
      "Recuerde: la promesa NO produce obligación (art. 98 CC).",
      "Es un hecho privado.",
      "Inexigible, siempre.",
    ]);
  });

  it("no corta en 'arts.' ni en 'inc.'", () => {
    const t = "Ver arts. 105-116 CC y el inc. 2° del art. 62. Luego sigue.";
    expect(dividirEnFrases(t)).toEqual(["Ver arts. 105-116 CC y el inc. 2° del art. 62.", "Luego sigue."]);
  });

  it("al unir las frases se recupera el texto", () => {
    const t = "Primera frase. ¿Segunda? «Tercera» cita. Cuarta: final.";
    expect(dividirEnFrases(t).join(" ")).toBe(t);
  });

  it("divide cláusulas sin perder texto", () => {
    const f = "uno, dos; tres: cuatro";
    expect(dividirEnClausulas(f)).toEqual(["uno,", "dos;", "tres:", "cuatro"]);
  });
});

describe("paginarTexto", () => {
  // Simula una caja que admite N caracteres.
  const caja = (n: number) => (s: string) => s.length <= n;

  it("un texto que cabe queda en una página", () => {
    expect(paginarTexto("Hola mundo.", caja(50)).paginas).toEqual(["Hola mundo."]);
  });

  it("reparte entre frases y no pierde texto", () => {
    const t = "Una frase corta. Otra frase algo más larga que la primera. Tercera frase final.";
    const r = paginarTexto(t, caja(45));
    expect(r.paginas.join(" ")).toBe(t);
    expect(r.paginas.length).toBeGreaterThan(1);
    r.paginas.forEach((p) => expect(p.length).toBeLessThanOrEqual(45));
    expect(r.desborda).toBe(false);
  });

  it("si una frase no cabe, usa cláusulas; si aun así no cabe, avisa desborde sin recortar", () => {
    const t = "Palabraenormesinespaciosquenuncacabeenlacaja, y luego algo.";
    const r = paginarTexto(t, caja(20));
    expect(r.paginas.join(" ")).toBe(t);
    expect(r.desborda).toBe(true);
  });
});

describe("coincide (búsqueda del códex)", () => {
  it("ignora mayúsculas y tildes", () => {
    expect(coincide("Filiación (arts. 179-221 CC)", "filiacion")).toBe(true);
  });
  it("busca números como número completo", () => {
    expect(coincide("Arts. 22 y 25 LMC", "22")).toBe(true);
    expect(coincide("art. 225 CC", "22")).toBe(false);
    expect(coincide("art. 1722", "22")).toBe(false);
  });
  it("búsqueda vacía coincide con todo", () => {
    expect(coincide("lo que sea", "  ")).toBe(true);
  });
});
