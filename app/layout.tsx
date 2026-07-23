import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Treino",
  description: "Gestão de treinos e atletas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
