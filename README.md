# EXPEDIENTE 1725/2026 — Derecho de Familia RPG · v3.0

**Disco Elysium + Código Civil chileno.** RPG narrativo web sobre matrimonio, sociedad conyugal, patrimonios satélites de la mujer casada, deberes recíprocos, filiación, divorcio, nulidad, compensación económica, liquidación y reconstrucción post-divorcio. Pensado para **estudio del examen de grado**.

Estética (v3): **noir notarial** — Santiago de noche, lluvia, luz de sodio sobre expedientes. Escenarios y retratos vectoriales propios, superficies de lectura opacas.

---

## Qué cambió en v3 (rediseño RPG)

### Una escena por pantalla
- Armazón común (`components/ui/GameShell.tsx`): HUD compacto · escena · navegación. Mide exactamente
  la ventana (`100dvh` con respaldo `100vh`), respeta *safe areas* y el teclado virtual
  (`interactive-widget=resizes-content`). El documento no se desplaza nunca.
- **Paginación por medición** (`components/ui/Ajuste.tsx`, lógica pura en `lib/paginar.ts`): diálogos,
  opciones, casos, bienes, códex y resultados se reparten en páginas según el alto real disponible.
  Nada se recorta ni se achica la letra; con texto ampliado, la región desborda de forma controlada.
- Formularios convertidos en pasos (creación en 5 pasos, compensación económica en 4).
- En pantallas anchas: escenario arriba y caja de diálogo abajo (clásico RPG); mapa con camino sobre
  el plano de la ciudad; paneles con escenario lateral.

### Tipografía: exactamente dos familias
- **Cinzel** (títulos, capítulos, nombres) y **Atkinson Hyperlegible** (todo lo demás), vía `next/font`.
- Escala central en `app/globals.css` (`--t-micro` 13 px … `--t-display`), cuerpo de 16 px o más.
  Botones de 44 × 44 px mínimo, foco visible, estados con icono y texto (no sólo color).

### Ciclo de juego
situación → diálogo → decisión → **consecuencia** (qué pasó en la historia · qué cambió · regla jurídica,
con enlace al códex) → nueva posibilidad.
- **Mapa por actos** con estado de cada capítulo (bloqueado, disponible, en curso, completado),
  progreso y "siguiente objetivo". Objetivo visible en cada capítulo y en su bitácora.
- **Recompensas una sola vez**: escenas, casos y acciones se registran en el guardado; volver,
  recargar o pulsar dos veces no duplica efectos.
- **Aprender del error**: los casos fallados del haber vuelven en una segunda revisión; el examen
  permite repasar los errores; cualquier escena decidida se puede **revivir en modo recuerdo**
  (sin efectos) para ver qué habría pasado con otra decisión.
- **Recompensas por comprensión**: +1 Inteligencia jurídica sólo al acertar al primer intento y sin
  pista (la inteligencia desbloquea opciones de diálogo); logros "Intuición notarial" y
  "Acuerdo completo y suficiente".
- **Antecedentes con función**: la prueba, la fecha cierta o el acuerdo regulador se presentan como
  objetos ante el tribunal; si la demanda se rechaza, la sentencia dice qué faltó y dónde conseguirlo.
- Los personajes reaccionan (cambia su expresión) según lo que provocó tu decisión.

### Guardado
- Versión 4 con **migración segura** desde v3 (antes, un cambio de versión borraba la partida). Ver
  `lib/partida.ts`.

### Verificación
```bash
npm test          # vitest: paginación, migración, idempotencia, reglas del clasificador
npm run typecheck # tsc --noEmit
npm run lint
npm run build
```

Las dudas jurídicas detectadas (sin modificar el contenido) están en [`docs/REVISION_JURIDICA.md`](docs/REVISION_JURIDICA.md).

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript** (con `ignoreBuildErrors: true` para tolerancia en deploy)
- **TailwindCSS** + CSS personalizado
- **Framer Motion** (animaciones)
- **Zustand + persist** (estado y guardado en `localStorage`, con guardas SSR)
- **Vercel-ready** (sin backend obligatorio)

---

## Qué hay de nuevo en v2

### Sistemas pedagógicos completos
- **Selector de sexo registral** en la creación: define acceso al art. 150, 166 y 167 CC.
- **Patrimonios satélite de la mujer casada en SC** — arts. 150, 166, 167. Minijuego + opción irrevocable de aceptar/renunciar gananciales (art. 150 inc. final).
- **Deberes recíprocos del matrimonio** — arts. 131-134 CC. Tracker en vivo. Cada incumplimiento grave deja flag de causal culposa (art. 54 LMC) que bloquea CE (art. 62 inc. 2°).
- **Compensación económica** — arts. 61-66 LMC. Calculadora real con los criterios del art. 62, modalidades del art. 65, bloqueo por culpa grave del art. 62 inc. 2°.
- **Fecha cierta del cese de convivencia** — arts. 22 y 25 LMC. Los 4 medios taxativos + reglas para matrimonios pre/post 18-11-2004.
- **Bienes familiares** — arts. 141-149 CC. Declaración, efectos, desafectación.
- **Acuerdo regulador completo y suficiente** — arts. 21 y 27 LMC. Constructor con evaluación normativa.
- **Acciones de filiación** — reclamación (art. 205), impugnación (art. 212), prueba biológica (art. 199) con presunción del inc. 2°.
- **Modo Examen** — 20 preguntas de selección múltiple tipo cédula de grado, con explicación normativa.
- **Codex con búsqueda** — 18 temas + 30 artículos destacados, filtrables.
- **Sistema de logros**.

### Mecánica de "segunda vida" (loop)
- El **divorcio NO termina el juego**. Tras la liquidación podés iniciar una **segunda vida**:
  - Conservás bienes propios, reservado del art. 150, satélites 166-167, hijos, logros y atributos.
  - Volvés al mundo I (noviazgo) en un nuevo ciclo vital.
  - Si te casás de nuevo, debés confeccionar **inventario solemne** (arts. 124-127 CC) o sufrís sanciones patrimoniales.
- Cada ciclo se cuenta y registra; los bienes adquiridos llevan `cicloVital` marcado.

### Liquidación con etapas separadas
9 fases, cada una con justificación normativa visible:
1. Facción de inventario (art. 1765)
2. Tasación (art. 1335 supletoriamente)
3. Deducción de bajas generales (art. 959)
4. Liquidación de recompensas (arts. 1769-1779)
5. Cómputo de gananciales (art. 1773)
6. División por mitades (art. 1774)
7. Adjudicación a hijuelas (art. 1337)
8. Inscripción conservatoria (arts. 686, 687 + Reglamento CBR)
9. Cierre del expediente

### Bug fixes desde v1
- `reset()` limpia `finalizado` y `epilogo` (no más epílogo eterno).
- `next.config.js` con `ignoreBuildErrors: true` para tolerancia en build.
- Hydration guard en home.
- Tipos explícitos en `reduce`/`some`.

---

## Mundos jugables (15)

| # | Mundo | Núcleo normativo |
|---|---|---|
| I | Noviazgo precontractual | Arts. 98 CC, 5-8 LMC |
| II | Matrimonio y régimen | Arts. 102, 135, 1715-1721 CC |
| III | Haber social | Art. 1725 + 18 casos |
| III bis | Patrimonios satélite | Arts. 150, 166, 167 CC |
| IV | Deberes recíprocos | Arts. 131-134 CC |
| V | Filiación y cuidado | Ley 19.585, art. 225, Ley 14.908, 21.389 |
| V bis | Acciones de filiación | Arts. 195-221 CC |
| VI | Bienes familiares | Arts. 141-149 CC |
| VII | Crisis matrimonial | Arts. 132, 54 LMC, Ley 20.066 |
| VIII | Fecha cierta del cese | Arts. 22 y 25 LMC |
| IX | Acuerdo regulador | Arts. 21 y 27 LMC |
| X | Separación y divorcio | Arts. 54-55, 26-29 LMC |
| XI | Compensación económica | Arts. 61-66 LMC |
| XII | Nulidad y matrimonio putativo | Arts. 5-8, 17, 51 LMC |
| XIII | Liquidación (9 fases) | Arts. 1765-1788 CC |
| XIV | Segunda vida | Arts. 124-127 CC + loop |
| XV | Modo Examen | Cédula tipo grado |

---

## Estructura

```
derecho-familia-rpg/
├─ app/
│  ├─ page.tsx                 # Pantalla de título
│  ├─ creacion/                # Personaje + sexo + atributos
│  ├─ juego/                   # Mapa-hub (15 mundos)
│  ├─ mundo/[id]/              # Router de mundos
│  ├─ liquidacion/             # Boss final con 9 fases
│  ├─ examen/                  # Cédula tipo grado
│  ├─ epilogo/                 # Epílogo + loop
│  ├─ codex/                   # Codex con búsqueda
│  ├─ inventario/              # Estado completo del expediente
│  └─ globals.css
├─ components/
│  ├─ DialogoEscena.tsx
│  ├─ MatrimonioPanel.tsx
│  ├─ ClasificadorBienes.tsx        # 18 casos
│  ├─ PatrimonioSatelitePanel.tsx   # Arts. 150, 166, 167 + opción gananciales
│  ├─ DeberesPanel.tsx              # Arts. 131-134 tracker
│  ├─ HijosPanel.tsx                # Alimentos, RDR, RNDPA
│  ├─ FiliacionAccionesPanel.tsx    # Arts. 195-221
│  ├─ BienesFamiliaresPanel.tsx     # Arts. 141-149
│  ├─ CrisisPanel.tsx
│  ├─ FechaCiertaPanel.tsx          # Art. 22 y 25 LMC
│  ├─ AcuerdoReguladorPanel.tsx     # Arts. 21 y 27 LMC
│  ├─ SeparacionPanel.tsx
│  ├─ NulidadPanel.tsx
│  └─ CompensacionEconomicaPanel.tsx # Calculadora art. 62 + modalidades art. 65
├─ lib/reglas.ts               # Motor normativo
├─ data/dialogos.ts            # Escenas Disco-Elysium-like
├─ store/useGame.ts            # Zustand + persist + loop
├─ types/game.ts               # Tipos del dominio
└─ configs (next, tailwind, vercel, tsconfig)
```

---

## Cómo correr localmente

```bash
npm install
npm run dev   # http://localhost:3000
```

Node 18.17+ o 20+.

## Cómo desplegar en Vercel

1. Subí el contenido del ZIP a un repo nuevo en GitHub (el **contenido**, no la carpeta).
2. https://vercel.com/new → importá el repo. Framework: Next.js. Root: `./`. Deploy.
3. ~2 min → link público.

## Aviso pedagógico

El juego es una **simplificación didáctica** rigurosa. Cita los artículos exactos para que los reconozcas. NO reemplaza el estudio del Código Civil, la LMC, la jurisprudencia y la doctrina (Somarriva, Ramos Pazos, Court Murasso, Corral Talciani, Rodríguez Grez, Pizarro Wilson).

> "Murió esperando inscripción conservatoria mientras litigaba una recompensa derivada de una subrogación defectuosa."
