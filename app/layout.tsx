import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Tipos de letra da marca SC Braga Masters: Big Shoulders Display para
// títulos "de estádio", Barlow para texto corrido, Barlow Condensed para
// tudo o que é rótulo/navegação/UI compacta.
// Auto-hospedados (ficheiros em app/fonts/, extraídos do Google Fonts) em
// vez de next/font/google, para o build não depender de ir buscar as fontes
// à rede — isso estava a fazer o deploy no Vercel falhar.
const bigShoulders = localFont({
  src: "./fonts/big-shoulders-display-var.woff2",
  weight: "600 800",
  variable: "--font-big-shoulders",
});
const barlow = localFont({
  src: [
    { path: "./fonts/barlow-400.woff2", weight: "400" },
    { path: "./fonts/barlow-500.woff2", weight: "500" },
    { path: "./fonts/barlow-600.woff2", weight: "600" },
    { path: "./fonts/barlow-700.woff2", weight: "700" },
  ],
  variable: "--font-barlow",
});
const barlowCondensed = localFont({
  src: [
    { path: "./fonts/barlow-condensed-500.woff2", weight: "500" },
    { path: "./fonts/barlow-condensed-600.woff2", weight: "600" },
    { path: "./fonts/barlow-condensed-700.woff2", weight: "700" },
  ],
  variable: "--font-barlow-condensed",
});

export const metadata: Metadata = {
  title: "SC Braga Masters",
  description: "Gestão de treinos e atletas — Sporting Clube de Braga Masters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt"
      className={`${bigShoulders.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <body className="bg-brand-bg font-sans text-brand-charcoal">{children}</body>
    </html>
  );
}
