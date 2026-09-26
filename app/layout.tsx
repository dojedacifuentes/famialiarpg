import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Atkinson_Hyperlegible, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./eva.css";
import Proveedores from "@/components/ui/Proveedores";
import { ARCADE } from "@/lib/eva-arcade";

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
  // La dirección pública real del juego: con la anterior (famialiarpg.vercel.app,
  // que no existe) la imagen para compartir apuntaba a una página en blanco.
  metadataBase: new URL(ARCADE.sitio),
  // Al compartir el enlace: la imagen es `app/opengraph-image.tsx` (EVA ARCADE).
  openGraph: { title: "EVA ARCADE · Expediente 1725", description: "Decide. Descubre las consecuencias. Un RPG de Derecho de Familia chileno.", locale: "es_CL", type: "website", siteName: ARCADE.nombre },
  twitter: { card: "summary_large_image", title: "EVA ARCADE · Expediente 1725", description: "Decide. Descubre las consecuencias. Un RPG de Derecho de Familia chileno." },
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
        {/* Estadística de visitas de Vercel, sin cookies: cuántas y de dónde llegan
            (por ejemplo, desde /links de EVA ARCADE). Sólo cuenta si Web Analytics
            está activado en el proyecto de Vercel. */}
        <Analytics />
      </body>
    </html>
  );
}
