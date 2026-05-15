import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EXPEDIENTE: Derecho de Familia — RPG",
  description: "Disco Elysium + Código Civil chileno. Un RPG narrativo jurídico.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=IM+Fell+English:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="crt">{children}</body>
    </html>
  );
}
