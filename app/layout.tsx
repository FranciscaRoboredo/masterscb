import type { Metadata } from "next";
import { Big_Shoulders_Display, Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

// Tipos de letra da marca SC Braga Masters: Big Shoulders Display para
// títulos "de estádio", Barlow para texto corrido, Barlow Condensed para
// tudo o que é rótulo/navegação/UI compacta.
const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-big-shoulders",
});
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
