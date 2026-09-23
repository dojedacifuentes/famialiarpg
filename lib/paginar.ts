// ============================================================================
// PAGINACIÓN POR MEDICIÓN — lógica pura (sin DOM), probada en tests/.
// ----------------------------------------------------------------------------
// Regla central del juego: cada escena cabe en la pantalla. Cuando un bloque
// de contenido no cabe, se reparte en páginas navegables; nunca se recorta ni
// se reduce la tipografía. Estas funciones deciden el reparto a partir de
// alturas medidas en el navegador.
// ============================================================================

export type Reparto = {
  paginas: number[][];
  /** true si algún elemento, solo, es más alto que el espacio disponible. */
  desborda: boolean;
};

/**
 * Agrupa elementos (por índice) en páginas cuyo alto total no supera
 * `disponible`. Con `columnas > 1` los elementos se colocan en filas y el alto
 * de cada fila es el del elemento más alto de ella.
 */
export function repartirEnPaginas(
  alturas: number[],
  disponible: number,
  gap = 0,
  columnas = 1
): Reparto {
  const cols = Math.max(1, Math.floor(columnas));
  if (alturas.length === 0) return { paginas: [[]], desborda: false };
  if (!(disponible > 0)) return { paginas: [alturas.map((_, i) => i)], desborda: false };

  // Filas de `cols` elementos.
  const filas: { indices: number[]; alto: number }[] = [];
  for (let i = 0; i < alturas.length; i += cols) {
    const indices = alturas.slice(i, i + cols).map((_, k) => i + k);
    filas.push({ indices, alto: Math.max(...indices.map((j) => alturas[j])) });
  }

  const paginas: number[][] = [];
  let actual: number[] = [];
  let usado = 0;
  let desborda = false;

  for (const fila of filas) {
    const extra = actual.length === 0 ? fila.alto : gap + fila.alto;
    if (actual.length > 0 && usado + extra > disponible + 0.5) {
      paginas.push(actual);
      actual = [];
      usado = 0;
    }
    if (actual.length === 0 && fila.alto > disponible + 0.5) desborda = true;
    usado += actual.length === 0 ? fila.alto : gap + fila.alto;
    actual.push(...fila.indices);
  }
  if (actual.length > 0) paginas.push(actual);
  return { paginas, desborda };
}

/** Página que contiene el elemento `indice` (para conservar la posición al redimensionar). */
export function paginaDe(paginas: number[][], indice: number): number {
  const p = paginas.findIndex((pg) => pg.includes(indice));
  return p < 0 ? 0 : p;
}

// Abreviaturas jurídicas habituales: un punto tras ellas NO cierra la frase.
const ABREVIATURAS = new Set([
  "art", "arts", "inc", "incs", "ss", "sr", "sra", "srta", "dr", "dra", "n", "nº", "núm",
  "etc", "cfr", "vid", "pág", "págs", "ej", "vs", "ud", "uds", "a.m", "p.m", "letra",
]);

/**
 * Divide un texto en frases, respetando abreviaturas ("art. 98", "inc. 2°") y
 * cifras. Unir el resultado con espacios reproduce el texto original.
 */
export function dividirEnFrases(texto: string): string[] {
  const limpio = texto.trim();
  if (!limpio) return [];
  const frases: string[] = [];
  let inicio = 0;
  const re = /([.!?…:;])(["»”)]*)\s+(?=["«“(¿¡A-ZÁÉÍÓÚÑ])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(limpio))) {
    const fin = m.index + m[1].length + m[2].length;
    if (m[1] === ".") {
      const previo = limpio.slice(inicio, m.index).split(/\s+/).pop() ?? "";
      const palabra = previo.toLowerCase().replace(/[()«»"]/g, "");
      if (ABREVIATURAS.has(palabra) || /^[a-zñ]$/i.test(palabra)) continue;
    }
    frases.push(limpio.slice(inicio, fin).trim());
    inicio = fin;
  }
  const resto = limpio.slice(inicio).trim();
  if (resto) frases.push(resto);
  return frases;
}

/** Divide una frase larga en cláusulas (tras coma, punto y coma o dos puntos). */
export function dividirEnClausulas(frase: string): string[] {
  // Sin lookbehind: Safari < 16.4 no lo soporta y rompería todo el módulo.
  const partes: string[] = [];
  const re = /[,;:]\s+/g;
  let inicio = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(frase))) {
    partes.push(frase.slice(inicio, m.index + 1).trim());
    inicio = m.index + m[0].length;
  }
  partes.push(frase.slice(inicio).trim());
  return partes.filter(Boolean);
}

/**
 * Agrupa unidades de texto en páginas usando una función que indica si un
 * fragmento cabe. Si una unidad sola no cabe, se intenta con sus cláusulas; si
 * aun así no cabe, queda sola en su página (y la región permitirá desplazar).
 */
export function paginarTexto(texto: string, cabe: (fragmento: string) => boolean): { paginas: string[]; desborda: boolean } {
  if (cabe(texto)) return { paginas: [texto.trim()], desborda: false };
  const unidades: string[] = [];
  for (const f of dividirEnFrases(texto)) {
    if (cabe(f)) unidades.push(f);
    else unidades.push(...dividirEnClausulas(f));
  }
  const paginas: string[] = [];
  let desborda = false;
  let actual = "";
  for (const u of unidades) {
    const candidato = actual ? `${actual} ${u}` : u;
    if (!actual || cabe(candidato)) {
      if (!actual && !cabe(u)) desborda = true;
      actual = candidato;
    } else {
      paginas.push(actual);
      actual = u;
      if (!cabe(u)) desborda = true;
    }
  }
  if (actual) paginas.push(actual);
  return { paginas, desborda };
}

// ── Búsqueda del códex ───────────────────────────────────────────────────────
export function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * ¿`texto` coincide con la búsqueda `q`? Sin distinguir mayúsculas ni tildes.
 * Un número se busca como número completo: "22" encuentra "art. 22" pero no
 * "art. 225" ni "1722".
 */
export function coincide(texto: string, q: string): boolean {
  const b = normalizar(q.trim());
  if (!b) return true;
  const t = normalizar(texto);
  if (/^\d+$/.test(b)) return new RegExp(`(^|\\D)${b}(\\D|$)`).test(t);
  return t.includes(b);
}
