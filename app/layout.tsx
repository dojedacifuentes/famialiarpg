import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./eva.css";
import Proveedores from "@/components/ui/Proveedores";

// ============================================================================
// Exactamente DOS familias tipográficas en todo el juego:
//  · Cinzel — títulos, capítulos, nombres de personajes y lugares.
//  · Atkinson Hyperlegible — diálogos, opciones, botones, formularios y
//    explicaciones. Diseñada para máxima legibilidad a tamaños pequeños.
// next/font las descarga al compilar y las sirve desde el propio dominio:
// no hay hoja de estilo externa que bloquee el primer render.
// ============================================================================
const display = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--fuente-display",
});

const lectura = Atkinson_Hyperlegible({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--fuente-lectura",
});

export const metadata: Metadata = {
  title: "EVA ARCADE · Expediente 1725",
  metadataBase: new URL("https://famialiarpg.vercel.app"),
  openGraph: { title: "EVA ARCADE · Expediente 1725", description: "Decide. Descubre las consecuencias. Un RPG de Derecho de Familia chileno.", locale: "es_CL", type: "website" },
  description: "RPG narrativo de Derecho de Familia chileno: decide, observa las consecuencias y aprende la regla que las explica.",
};

// viewport-fit=cover habilita env(safe-area-inset-*) en teléfonos con muesca o
// gesto inferior. resizes-content hace que el teclado virtual reduzca el alto
// dinámico (100dvh) en vez de tapar la barra de acciones.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#060913",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${lectura.variable}`}>
      <body>
        <Proveedores>{children}</Proveedores>
      </body>
    </html>
  );
}
