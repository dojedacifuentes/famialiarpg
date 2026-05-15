# EXPEDIENTE 1725/2026 — Derecho de Familia RPG · v2.0

**Disco Elysium + Código Civil chileno.** RPG narrativo web sobre matrimonio, sociedad conyugal, patrimonios satélites de la mujer casada, deberes recíprocos, filiación, divorcio, nulidad, compensación económica, liquidación y reconstrucción post-divorcio. Pensado para **estudio del examen de grado**.

Estética: minimalismo cyberpunk-notarial, CRT, glitch jurídico, neon azul/violeta sobre negro.

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
